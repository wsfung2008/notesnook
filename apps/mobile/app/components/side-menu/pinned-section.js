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

import React, { useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Notebook from "../../screens/notebook";
import { TaggedNotes } from "../../screens/notes/tagged";
import { TopicNotes } from "../../screens/notes/topic-notes";
import Navigation from "../../services/navigation";
import { useMenuStore } from "../../stores/use-menu-store";
import useNavigationStore from "../../stores/use-navigation-store";
import { useNoteStore } from "../../stores/use-notes-store";
import { useThemeStore } from "../../stores/use-theme-store";
import { db } from "../../common/database";
import { normalize, SIZE } from "../../utils/size";
import { Properties } from "../properties";
import { Button } from "../ui/button";
import { Notice } from "../ui/notice";
import { PressableButton } from "../ui/pressable";
import Seperator from "../ui/seperator";
import SheetWrapper from "../ui/sheet";
import Heading from "../ui/typography/heading";
import Paragraph from "../ui/typography/paragraph";
import { useCallback } from "react";

export const TagsSection = React.memo(
  function TagsSection() {
    const menuPins = useMenuStore((state) => state.menuPins);
    const loading = useNoteStore((state) => state.loading);
    const setMenuPins = useMenuStore((state) => state.setMenuPins);

    useEffect(() => {
      if (!loading) {
        setMenuPins();
      }
    }, [loading, setMenuPins]);

    const onPress = (item) => {
      if (item.type === "notebook") {
        Notebook.navigate(item);
      } else if (item.type === "tag") {
        TaggedNotes.navigate(item);
      } else {
        TopicNotes.navigate(item);
      }
      setImmediate(() => {
        Navigation.closeDrawer();
      });
    };
    const renderItem = ({ item, index }) => {
      let alias = item.alias || item.title;
      return (
        <PinItem item={item} index={index} alias={alias} onPress={onPress} />
      );
    };

    return (
      <View
        style={{
          flexGrow: 1
        }}
      >
        <FlatList
          data={menuPins}
          style={{
            flexGrow: 1
          }}
          ListEmptyComponent={
            <Notice
              size="small"
              type="information"
              text="Add shortcuts for notebooks, topics and tags here."
            />
          }
          contentContainerStyle={{
            flexGrow: 1
          }}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    );
  },
  () => true
);

export const PinItem = React.memo(
  function PinItem({ item, onPress, placeholder, alias }) {
    const colors = useThemeStore((state) => state.colors);
    const setMenuPins = useMenuStore((state) => state.setMenuPins);
    alias = item?.alias || item?.title;
    const [visible, setVisible] = useState(false);
    const [headerTextState, setHeaderTextState] = useState(null);
    const color = headerTextState?.id === item.id ? colors.accent : colors.pri;
    const fwdRef = useRef();

    const onHeaderStateChange = useCallback(
      (state) => {
        setTimeout(() => {
          let id = state.currentScreen?.id;
          if (id === item.id) {
            setHeaderTextState({
              id: state.currentScreen.id
            });
          } else {
            if (headerTextState !== null) {
              setHeaderTextState(null);
            }
          }
        }, 300);
      },
      [headerTextState, item.id]
    );

    useEffect(() => {
      let unsub = useNavigationStore.subscribe(onHeaderStateChange);
      return () => {
        unsub();
      };
    }, [headerTextState, onHeaderStateChange]);

    const icons = {
      topic: "bookmark",
      notebook: "book-outline",
      tag: "pound"
    };

    return (
      <>
        {visible && (
          <SheetWrapper
            onClose={() => {
              setVisible(false);
            }}
            gestureEnabled={false}
            fwdRef={fwdRef}
            visible={true}
          >
            <Seperator />
            <Button
              title="Remove Shortcut"
              type="error"
              onPress={async () => {
                await db.settings.unpin(item.id);
                setVisible(false);
                setMenuPins();
              }}
              fontSize={SIZE.md}
              width="95%"
              height={50}
              customStyle={{
                marginBottom: 30
              }}
            />
          </SheetWrapper>
        )}
        <PressableButton
          type={headerTextState?.id === item.id ? "grayBg" : "gray"}
          onLongPress={() => {
            if (placeholder) return;
            Properties.present(item);
          }}
          onPress={() => onPress(item)}
          customStyle={{
            width: "100%",
            alignSelf: "center",
            borderRadius: 5,
            flexDirection: "row",
            paddingHorizontal: 8,
            justifyContent: "space-between",
            alignItems: "center",
            height: normalize(50),
            marginBottom: 5
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexGrow: 1,
              flex: 1
            }}
          >
            <View
              style={{
                width: 30,
                justifyContent: "center"
              }}
            >
              <Icon color={color} size={SIZE.lg - 2} name={icons[item.type]} />
              <Icon
                style={{
                  position: "absolute",
                  bottom: -6,
                  left: -6
                }}
                color={color}
                size={SIZE.xs}
                name="arrow-top-right-thick"
              />
            </View>
            <View
              style={{
                alignItems: "flex-start",
                flexGrow: 1,
                flex: 1
              }}
            >
              {headerTextState?.id === item.id ? (
                <Heading
                  style={{
                    flexWrap: "wrap"
                  }}
                  color={colors.heading}
                  size={SIZE.md}
                >
                  {alias}
                </Heading>
              ) : (
                <Paragraph numberOfLines={1} color={colors.pri} size={SIZE.md}>
                  {alias}
                </Paragraph>
              )}
            </View>
          </View>
        </PressableButton>
      </>
    );
  },
  (prev, next) => {
    if (!next.item) return false;
    if (prev.alias !== next.alias) return false;
    if (prev.item?.dateModified !== next.item?.dateModified) return false;
    if (prev.item?.id !== next.item?.id) return false;
    return true;
  }
);
