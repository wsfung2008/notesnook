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

const { autoUpdater } = require("electron-updater");
const { EVENTS } = require("./events");
const { sendMessageToRenderer } = require("./ipc/utils");
const { getChangelog } = require("./changelog");

async function configureAutoUpdater() {
  autoUpdater.setFeedURL({
    provider: "generic",
    url: `https://notesnook.com/releases/${process.platform}/`,
    useMultipleRangeRequest: false
  });

  autoUpdater.autoDownload = false;
  autoUpdater.allowDowngrade = false;
  autoUpdater.allowPrerelease = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.addListener("checking-for-update", () => {
    sendMessageToRenderer(EVENTS.checkingForUpdate);
  });
  autoUpdater.addListener("update-available", async (info) => {
    info.releaseNotes = await getChangelog(info.version);
    console.log("Get release notes!", info.releaseNotes);
    sendMessageToRenderer(EVENTS.updateAvailable, info);
  });
  autoUpdater.addListener("download-progress", (progress) => {
    sendMessageToRenderer(EVENTS.updateDownloadProgress, progress);
  });
  autoUpdater.addListener("update-downloaded", (info) => {
    sendMessageToRenderer(EVENTS.updateDownloadCompleted, info);
  });
  autoUpdater.addListener("update-not-available", (info) => {
    sendMessageToRenderer(EVENTS.updateNotAvailable, info);
  });
}

module.exports = { configureAutoUpdater };
