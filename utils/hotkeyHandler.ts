/*
 * Remote Sensing Labelling Tool
 * Copyright (C) 2025 Helmholtz-Zentrum Hereon
 * Author: David Pogorzelski
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import type { EditorStore, EditorStoreActions, EditorStoreGetters } from "@/types";
import { useEditorStore } from "~/store/editorStore";
import { useSettingsStore } from "~/store/settingStore";
import { HistoryHandler } from "@/utils/historyHandler";
import { useUploadStore } from "~/store/uploadStore";

export class HotkeyHandler {

    static instance: HotkeyHandler | null = null;
    static pressedKeys: string[] = [];
    static combiHitPerformed = false;

    settingsStore: any = null;
    editorStore: (EditorStore & EditorStoreActions & EditorStoreGetters) | null = null;
    uploadStore: any = null;

    constructor() {
        if (HotkeyHandler.instance) {
            return HotkeyHandler.instance;
        } else {
            // add event listeners
            this.settingsStore = useSettingsStore();
            this.editorStore = useEditorStore();
            this.uploadStore = useUploadStore();

            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);
        }
    }

    static getInstance() {
        if (!HotkeyHandler.instance) {
            HotkeyHandler.instance = new HotkeyHandler();
        }
        return HotkeyHandler.instance;
    }

    handleKeyUp(event: KeyboardEvent) {

        event.preventDefault();

        HotkeyHandler.pressedKeys = HotkeyHandler.pressedKeys.filter((key) => key !== event.key || key === 'Meta');

        if (event.key === 'Meta') {
            HotkeyHandler.pressedKeys = [];
        }

        HotkeyHandler.combiHitPerformed = false;

    }

    handleKeyDown(event: KeyboardEvent) {
        event.preventDefault();

        if (!HotkeyHandler.pressedKeys.includes(event.key)) {
            HotkeyHandler.pressedKeys.push(event.key);
        }

        if (HotkeyHandler.pressedKeys.includes('Meta')) {
            HotkeyHandler.pressedKeys = [];
            return;
        }

        let store = HotkeyHandler.getInstance().editorStore;
        if (store) {

            if (HotkeyHandler.pressedKeys.length === 1) {

                let hks = HotkeyHandler.getInstance().settingsStore.hotKeys;
                for (let i = 0; i < hks.length; i++) {
                    let hksParsed = JSON.parse(hks[i].value);
                    if (hks[i].type === 'string[]' && hksParsed.length === 1) {
                        if (hksParsed[0] === HotkeyHandler.pressedKeys[0]) {
                            HotkeyHandler.getInstance().performAction(hks[i].name);
                            return;
                        }
                    }
                }
            }


            if (HotkeyHandler.pressedKeys.length === 2 && HotkeyHandler.combiHitPerformed === false) {

                HotkeyHandler.combiHitPerformed = true;
                let hks = HotkeyHandler.getInstance().settingsStore.hotKeys;
                for (let i = 0; i < hks.length; i++) {
                    let hksParsed = JSON.parse(hks[i].value);
                    hksParsed.sort();
                    HotkeyHandler.pressedKeys.sort();
                    if (hks[i].type === 'string[]' && hksParsed.length === 2) {
                        if (hksParsed[0] == HotkeyHandler.pressedKeys[0] && hksParsed[1] == HotkeyHandler.pressedKeys[1]) {
                            HotkeyHandler.getInstance().performAction(hks[i].name);
                            return;
                        }
                    }
                }
            }
        }
    }

    async performAction(hotKeyName: string) {
        let editorStore = HotkeyHandler.getInstance().editorStore;

        if (editorStore) {
            if (!editorStore.wand.menuOpen && !editorStore.classicView.mapOpen) {
                switch (hotKeyName) {
                    case 'hk_toggle_pen':
                        editorStore.activateTool('plainDrawer')
                        break;
                    case 'hk_toggle_eraser':
                        editorStore.activateTool('eraser')
                        break;
                    case 'hk_toggle_pan':
                        editorStore.activateTool('pan')
                        break;
                    case 'hk_toggle_bucket':
                        editorStore.activateTool('bucket')
                        break;
                    case 'hk_toggle_wand':
                        editorStore.activateTool('wand')
                        break;
                    case 'hk_toggle_gap_drawer':
                        editorStore.activateTool('gapDrawer')
                        break;
                    // case 'hk_cancel':
                    //     editorStore.closeAllMenus();
                    //     break;
                    case 'hk_undo':
                        HistoryHandler.getInstance().undo();
                        break;
                    case 'hk_redo':
                        HistoryHandler.getInstance().redo();
                        break;
                    // case 'hk_save':
                    //     editorStore.saveState(editorStore.shortNote, editorStore.longNote);
                    //     break;
                    case 'hk_incr_pen_size':
                        editorStore.penSize += 1;
                        break;
                    case 'hk_decr_pen_size':
                        editorStore.penSize = Math.max(1, editorStore.penSize - 1);
                        break;
                    // case 'hk_toggle_norm':
                    //     editorStore.toggleNormalization();
                    //     break;
                    // case 'hk_map':
                    //     editorStore.mapActive = !editorStore.mapActive;
                    //     break;
                    case 'hk_toggle_norm':
                        if (this.editorStore) {
                            this.editorStore.toggleNormalization(HotkeyHandler.getInstance().uploadStore.selectedSatellite);
                        }
                        break;
                    case 'hk_toggle_map':
                        if (this.editorStore) {
                            this.editorStore.activateTool('map');
                        }
                        break;
                }
            } else {
                // if (hotKeyName === 'hk_map') {
                //     editorStore.mapActive = !editorStore.mapActive;
                // }
            }

            if (hotKeyName === 'hk_undo' || hotKeyName === 'hk_redo') {
                setTimeout(() => {
                    HotkeyHandler.combiHitPerformed = false;
                }, 200);
            }
        }
    }

}