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
import type { EditorStore, EditorStoreActions, EditorStoreGetters } from "@/types";
import { getHexStringAt, getMousePos } from "@/utils"

export class CursorShadowHandler {

    static instance: CursorShadowHandler | null = null;

    canvas: HTMLCanvasElement | null = null;
    cursorShadowPosition: { x: number, y: number } | null = null;
    editorStore: (EditorStore & EditorStoreActions & EditorStoreGetters) | null = null;

    constructor() {
        if (CursorShadowHandler.instance) {
            return CursorShadowHandler.instance;
        }
        this.editorStore = useEditorStore();
    }

    static getInstance() {
        if (!CursorShadowHandler.instance) {
            CursorShadowHandler.instance = new CursorShadowHandler();
        }
        return CursorShadowHandler.instance
    }

    /**
     * Adjusts the cursor shadow based on the pen size
     * @returns 
     */
    updateCursorShadow() {
        let labelCanvasStore = CursorShadowHandler.getInstance().editorStore;
        let cursorCanvas = document.getElementById("cursorShadow") as HTMLCanvasElement;
        let cursorContext = cursorCanvas!.getContext('2d');
        if (labelCanvasStore) {
            if ((labelCanvasStore.wand.active || labelCanvasStore.bucket.active || labelCanvasStore.gapDrawer.active || labelCanvasStore.drawingActive || labelCanvasStore.eraser.active) && CursorShadowHandler.getInstance().cursorShadowPosition) {
                const xy = CursorShadowHandler.getInstance().cursorShadowPosition;
                if (!xy) return;

                let penSize = labelCanvasStore.bucket.active ? 1 : labelCanvasStore.penSize;

                const x = Math.floor(xy.x) - Math.floor(penSize / 2);
                const y = Math.floor(xy.y) - Math.floor(penSize / 2);
                cursorContext!.clearRect(0, 0, cursorCanvas!.width, cursorCanvas!.height);
                cursorContext!.fillStyle = 'lime';
                cursorContext!.fillRect(x, y, penSize, penSize);
            }
        }
    }


    mouseMoveEvent(e: Event, cursorCanvas: HTMLCanvasElement, cursorContext: CanvasRenderingContext2D | null) {
        e.preventDefault();
        let labelCanvasStore = CursorShadowHandler.getInstance().editorStore;
        if (labelCanvasStore) {
            if (labelCanvasStore.selectedDrawingLayer) {
                const mouseEvent = e as MouseEvent;
                const xy = getMousePos(mouseEvent, labelCanvasStore);
                if (!xy) return;
                CursorShadowHandler.getInstance().cursorShadowPosition = { x: xy.x, y: xy.y };
                const x = Math.floor(xy.x) - Math.floor(1 / 2);
                const y = Math.floor(xy.y) - Math.floor(1 / 2);

                let penSize = labelCanvasStore.bucket.active ? 1 : labelCanvasStore.penSize;

                const x2 = Math.floor(xy.x) - Math.floor(penSize / 2);
                const y2 = Math.floor(xy.y) - Math.floor(penSize / 2);
                // cursorShadowPosition = { x: x2, y: y2 };
                cursorContext!.clearRect(0, 0, cursorCanvas!.width, cursorCanvas!.height);
                if (labelCanvasStore.wand.menuOpen || labelCanvasStore.wand.active || labelCanvasStore.drawingActive || labelCanvasStore.bucket.active || labelCanvasStore.eraser.active || labelCanvasStore.gapDrawer.active) {
                    // fill rect
                    cursorContext!.fillStyle = 'lime';
                    // draw a cross for the bucket tool
                    if (labelCanvasStore.bucket.active) {
                        cursorContext!.fillRect(x2, y2, 1, 1);
                        for (let i = -3; i <= 3; i++) {
                            cursorContext!.fillRect(x2 + i, y2, 1, 1);
                            cursorContext!.fillRect(x2, y2 + i, 1, 1);
                        }
                    } else {
                        if (!labelCanvasStore.wand.menuOpen) {
                            cursorContext!.fillRect(x2, y2, penSize, penSize);
                        } else {
                            cursorContext!.fillRect(x, y, 1, 1);
                        }
                    }
                }

                labelCanvasStore.hoverColor = getHexStringAt(x, y, labelCanvasStore).hex;
            }
        }
    }

    addMouseOverContainer() {

        let labelContainer = document.getElementById('labelContainer');
        let cursorCanvas = document.getElementById("cursorShadow") as HTMLCanvasElement;
        cursorCanvas!.style.position = 'absolute';
        cursorCanvas!.style.top = '0';
        cursorCanvas.style.left = '0';
        cursorCanvas.style.opacity = '0.4';
        cursorCanvas.style.imageRendering = 'pixelated';
        cursorCanvas.style.pointerEvents = 'none';
        let cursorContext = cursorCanvas!.getContext('2d');

        if (labelContainer) {
            ['mousemove', 'touchmove'].forEach((event) => {
                labelContainer!.addEventListener(event, (e) => {
                    CursorShadowHandler.getInstance().mouseMoveEvent(e, cursorCanvas, cursorContext);
                });
            });
        }
    }

    removeMouseOverContainer() {
        let cursorCanvas = document.getElementById("cursorShadow") as HTMLCanvasElement;
        let cursorContext = cursorCanvas!.getContext('2d');
        let labelContainer = document.getElementById('labelContainer');
        if (labelContainer) {
            ['mousemove', 'touchmove'].forEach((event) => {
                labelContainer!.removeEventListener(event, (e) => {
                    CursorShadowHandler.getInstance().mouseMoveEvent(e, cursorCanvas, cursorContext);
                });
            });
        }
    }
}


