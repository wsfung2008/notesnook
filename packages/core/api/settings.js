/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2022 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { EV, EVENTS } from "../common";
import id from "../utils/id";
import "../types";
import setManipulator from "../utils/set";

class Settings {
  /**
   *
   * @param {import("./index").default} db
   */
  constructor(db) {
    this._db = db;
  }

  async init() {
    var settings = await this._db.storage.read("settings");
    this._initSettings(settings);
    await this._saveSettings(false);

    EV.subscribe(EVENTS.userLoggedOut, async () => {
      this._initSettings();
      await this._saveSettings(false);
    });
  }

  get raw() {
    return this._settings;
  }

  async merge(item) {
    if (this._settings.dateModified > (await this._db.lastSynced())) {
      this._settings.id = item.id;
      this._settings.pins = setManipulator.union(
        this._settings.pins,
        item.pins,
        (p) => p.data.id
      );
      this._settings.groupOptions = {
        ...this._settings.groupOptions,
        ...item.groupOptions
      };
      this._settings.toolbarConfig = {
        ...this._settings.toolbarConfig,
        ...item.toolbarConfig
      };
      this._settings.aliases = {
        ...this._settings.aliases,
        ...item.aliases
      };
      this._settings.dateModified = Date.now();
    } else {
      this._initSettings(item);
    }
    await this._saveSettings(false);
  }

  /**
   *
   * @param {GroupingKey} key
   * @param {GroupOptions} groupOptions
   */
  async setGroupOptions(key, groupOptions) {
    this._settings.groupOptions[key] = groupOptions;
    await this._saveSettings();
  }

  /**
   *
   * @param {GroupingKey} key
   * @returns {GroupOptions}
   */
  getGroupOptions(key) {
    return (
      this._settings.groupOptions[key] || {
        groupBy: "default",
        sortBy:
          key === "trash"
            ? "dateDeleted"
            : key === "tags"
            ? "dateCreated"
            : "dateEdited",
        sortDirection: "desc"
      }
    );
  }

  /**
   *
   * @param {string} key
   * @param {{preset: string, config?: any[]}} config
   */
  async setToolbarConfig(key, config) {
    this._settings.toolbarConfig[key] = config;
    await this._saveSettings();
  }

  /**
   *
   * @param {string} key
   * @returns {{preset: string, config: any[]}}
   */
  getToolbarConfig(key) {
    return this._settings.toolbarConfig[key];
  }

  async setAlias(id, name) {
    this._settings.aliases[id] = name;
    await this._saveSettings();
  }

  getAlias(id) {
    return this._settings.aliases[id];
  }

  async pin(type, data) {
    if (type !== "notebook" && type !== "topic" && type !== "tag")
      throw new Error("This item cannot be pinned.");
    if (this.isPinned(data.id)) return;
    this._settings.pins.push({ type, data });

    await this._saveSettings();
  }

  async unpin(id) {
    const index = this._settings.pins.findIndex((i) => i.data.id === id);
    if (index <= -1) return;
    this._settings.pins.splice(index, 1);

    await this._saveSettings();
  }

  isPinned(id) {
    return !!this._settings.pins.find((v) => v.data.id === id);
  }

  get pins() {
    return this._settings.pins.reduce((prev, pin) => {
      if (!pin || !pin.data) return;

      let item = null;
      if (pin.type === "notebook") {
        const notebook = this._db.notebooks.notebook(pin.data.id);
        item = notebook ? notebook.data : null;
      } else if (pin.type === "topic") {
        const notebook = this._db.notebooks.notebook(pin.data.notebookId);
        if (notebook) {
          const topic = notebook.topics.topic(pin.data.id);
          if (topic) item = topic._topic;
        }
      } else if (pin.type === "tag") {
        item = this._db.tags.tag(pin.data.id);
      }
      if (item) prev.push(item);
      else this.unpin(pin.data.id); // TODO risky.
      return prev;
    }, []);
  }

  _initSettings(settings) {
    this._settings = {
      type: "settings",
      id: id(),
      pins: [],
      groupOptions: {},
      toolbarConfig: {},
      aliases: {},
      dateModified: 0,
      dateCreated: 0,
      ...(settings || {})
    };
  }

  async _saveSettings(updateDateModified = true) {
    if (updateDateModified) {
      this._settings.dateModified = Date.now();
      this._settings.synced = false;
    }

    await this._db.storage.write("settings", this._settings);
    this._db.eventManager.publish(EVENTS.databaseUpdated, this._settings);
  }
}
export default Settings;
