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


import { useEditorStore } from "@/store/editorStore";
import { useSettingsStore } from "@/store/settingStore";
import type { EditorStore, EditorStoreActions, EditorStoreGetters } from "@/types";
import { ActionEventHandler } from "@/utils/actionEventHandler";
import { set } from "lodash";

export enum HistoryAction {
    BUCKETFILL = 'BUCKETFILL',
    DRAWPIXEL = 'DRAWPIXEL',
    ERASEPIXEL = 'ERASEPIXEL',
    ABDRAW = 'ABDRAW',
    TABDRAW = 'TABDRAW',
    MAGICDRAW = 'MAGICDRAW',
}

export class HistoryHandler {

    static instance: HistoryHandler | null = null;
    editorStore: (EditorStore & EditorStoreActions & EditorStoreGetters) | null = null;

    static letters = 'abcdefghijklmnopqrstuvwxyz';
    static letterIndex = 0;

    static history: [
        string,
        ImageData,
        // HistoryAction
        string,
        HistoryAction
    ][] = [];

    static future: [
        string,
        ImageData,
        // HistoryAction
        string,
        HistoryAction
    ][] = [];

    constructor() {
        if (HistoryHandler.instance) {
            return HistoryHandler.instance;
        } else {
            // add event listeners
            this.editorStore = useEditorStore();
        }
    }

    static getInstance() {
        if (!HistoryHandler.instance) {
            HistoryHandler.instance = new HistoryHandler();
        }
        return HistoryHandler.instance;
    }


    undo() {
        if (HistoryHandler.history.length) {

            if (HistoryHandler.history[HistoryHandler.history.length - 1][0].includes('undeletable')) {
                return;
            }

            let deletedHistoryEntry = HistoryHandler.history.pop();

            let deletedHistoryEntryLayerName = deletedHistoryEntry![0];
            let deletedHistoryEntryProtocol = deletedHistoryEntry![2];
            let deletedHistoryEntryAction = deletedHistoryEntry![3];

            // Check if there are deletables left 
            let countLayerHistory = 0;
            for (let i = 0; i < HistoryHandler.history.length; i++) {
                if (HistoryHandler.history[i][0].replace('_undeletable', '') === deletedHistoryEntryLayerName) {
                    countLayerHistory++;
                }
                if (countLayerHistory > 1) {
                    // deletables are left
                    break;
                }
            }

            // Special case:
            // This is only the case if a new layer was created and there are no deletables left.
            // Keep the layer but clear the canvas.
            // Also add the future image to the future stack
            if (countLayerHistory === 0) {
                let canvas = HistoryHandler.getInstance().editorStore!.layerNameToCanvas.get(deletedHistoryEntryLayerName);
                if (canvas) {
                    let ctx = canvas.getContext('2d');
                    if (ctx) {
                        let futureImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        let clonedImageData = new ImageData(
                            new Uint8ClampedArray(futureImageData.data),
                            futureImageData.width,
                            futureImageData.height
                        );
                        HistoryHandler.future.push([deletedHistoryEntryLayerName, clonedImageData, deletedHistoryEntryProtocol, deletedHistoryEntryAction]);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        return;
                    }
                }
            }

            // Else:
            // Simply restore the previous image
            // 1. Find the corresponding history for the layer
            // 2. Restore the image
            // 3. Add the image to the future stack
            // 4. Select the layer
            let historyImageToRestore = null;
            for (let i = HistoryHandler.history.length - 1; i >= 0; i--) {
                if (HistoryHandler.history[i][0].replace('_undeletable', '') === deletedHistoryEntryLayerName) {
                    historyImageToRestore = HistoryHandler.history[i];
                    break;
                }
            }
            let canvas = HistoryHandler.getInstance().editorStore!.layerNameToCanvas.get(deletedHistoryEntryLayerName);
            if (canvas) {
                let ctx = canvas.getContext('2d');
                if (ctx) {
                    let futureImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let clonedImageData = new ImageData(
                        new Uint8ClampedArray(futureImageData.data),
                        futureImageData.width,
                        futureImageData.height
                    );
                    HistoryHandler.future.push([deletedHistoryEntryLayerName, clonedImageData, deletedHistoryEntryProtocol, deletedHistoryEntryAction]);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.putImageData(historyImageToRestore![1], 0, 0);
                }
            }

            HistoryHandler.getInstance().editorStore!.selectLayer(HistoryHandler.history[HistoryHandler.history.length - 1][0].replace('_undeletable', ''));


        }
    }

    redo() {
        if (HistoryHandler.future.length) {

            let futureImageToRestore = HistoryHandler.future.pop();
            let canvas = HistoryHandler.getInstance().editorStore?.layerNameToCanvas.get(futureImageToRestore![0]);
            if (canvas) {
                let ctx = canvas.getContext('2d');
                if (ctx) {
                    let futureImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let clonedImageData = new ImageData(
                        new Uint8ClampedArray(futureImageToRestore![1].data),
                        futureImageData.width,
                        futureImageData.height
                    );
                    // check if clonedImageData is different from the last one in history
                    // if (HistoryHandler.history.length > 0) {
                    //     let lastImageData = HistoryHandler.history[HistoryHandler.history.length - 1][1].data;
                    //     if (!clonedImageData.data.every((value, index) => value === lastImageData[index])) {
                    //         HistoryHandler.history.push([futureImageToRestore![0], clonedImageData, futureImageToRestore![2]]);
                    //     }
                    // }
                    HistoryHandler.history.push([futureImageToRestore![0], clonedImageData, futureImageToRestore![2], futureImageToRestore![3]]);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.putImageData(futureImageToRestore![1], 0, 0);
                    HistoryHandler.getInstance().editorStore?.selectLayer(futureImageToRestore![0]);
                }
            }
        }

    }

    pushToHistory() {

        /**
         * Push the current imageData to the history array if it is different from the last one
         */
        let store = HistoryHandler.getInstance().editorStore;
        if (store) {
            let selectedLayer = store.selectedDrawingLayer;
            if (selectedLayer) {
                let canvas = store.layerNameToCanvas.get(selectedLayer);
                if (canvas) {
                    let ctx = canvas.getContext('2d');
                    if (ctx) {
                        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                        // Check if the new imageData is different from the last one in history
                        if (HistoryHandler.history.length > 0) {
                            let lastImageData = HistoryHandler.history[HistoryHandler.history.length - 1][1].data;

                            // Directly compare the data arrays
                            if (imageData.data.every((value, index) => value === lastImageData[index])) {
                                return;
                            }
                        }

                        let clonedImageData = new ImageData(
                            new Uint8ClampedArray(imageData.data),
                            imageData.width,
                            imageData.height
                        );

                        let historyAction: HistoryAction = HistoryAction.DRAWPIXEL;
                        if (store.bucket.active) {
                            historyAction = HistoryAction.BUCKETFILL;
                        } else if (store.wand.active) {
                            historyAction = HistoryAction.MAGICDRAW;
                        } else if (store.eraser.active) {
                            historyAction = HistoryAction.ERASEPIXEL;
                        } else if (store.gapDrawer.active) {
                            historyAction = HistoryAction.ABDRAW;
                        } else {
                            historyAction = HistoryAction.TABDRAW;
                        }
                        // todo tab

                        HistoryHandler.history.push([store.selectedDrawingLayer, clonedImageData, HistoryHandler.letters[HistoryHandler.letterIndex], historyAction]);
                        HistoryHandler.letterIndex++;

                    }
                }
            }
        }
    }
}