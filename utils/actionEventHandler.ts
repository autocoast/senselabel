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


// import { bucketFillWorker } from "@/canvashandlers/drawingtools/bucketfill";
import { drawGapPixel, drawPixel, erasePixel, magneticDraw, overDrawColor } from "@/utils/canvasHandlers/basicDrawingHandlers";
import { useEditorStore } from "~/store/editorStore";
import { useSettingsStore } from "~/store/settingStore";
import type { EditorStore, EditorStoreActions, EditorStoreGetters, UploadStore, UploadStoreActions, UploadStoreGetters } from "@/types";
import { getMousePos, toggleCursor } from "~/utils";
import { useUploadStore } from "~/store/uploadStore";
import { bucketFillWorker } from "./canvasHandlers/bucketfill";
import { HistoryHandler } from "@/utils/historyHandler";
// import { logAudit } from "@/utils/helpers/api";

export class ActionEventHandler {

    static instance: ActionEventHandler | null = null;

    static mouseupListener: boolean = false;
    static mousedownListener: boolean = false;
    static mousemoveListener: boolean = false;

    editorStore: (EditorStore & EditorStoreActions & EditorStoreGetters) | null = null;
    settingsStore: any = null;
    uploadStore: (UploadStore & UploadStoreActions & UploadStoreGetters) | null = null;

    private mouseDownHandler: (event: Event) => void;
    private mouseUpHandler: (event: Event) => void;
    private mouseMoveHandler: (event: Event) => void;

    constructor() {
        this.editorStore = useEditorStore();
        this.uploadStore = useUploadStore();
        this.settingsStore = useSettingsStore();

        // Define the handler functions
        this.mouseDownHandler = (event: Event) => this.mouseDownFunction(event as MouseEvent, this.getCanvas()!);
        this.mouseUpHandler = (event: Event) => this.mouseUpFunction(event as MouseEvent);
        this.mouseMoveHandler = (event: Event) => this.mouseMoveEvent(event, this.getGMMContext());
    }

    static getInstance() {
        if (!ActionEventHandler.instance) {
            ActionEventHandler.instance = new ActionEventHandler();
        }
        return ActionEventHandler.instance;
    }

    getCanvas(): HTMLCanvasElement | null {
        let labelStore = ActionEventHandler.getInstance().editorStore;
        if (labelStore) {
            if (labelStore.wand.active) {
                return labelStore.layerNameToCanvas.get(labelStore.wand.drawLayer)!;
            } else if (labelStore.bucket.active) {
                return labelStore.layerNameToCanvas.get(labelStore.bucket.drawLayer)!;
            } else if (labelStore.gapDrawer.active) {
                return labelStore.layerNameToCanvas.get(labelStore.gapDrawer.drawLayer)!;
            } else if (labelStore.magneticDrawer.active) {
                return labelStore.layerNameToCanvas.get(labelStore.magneticDrawer.drawLayer)!;
            } else {
                return labelStore.layerNameToCanvas.get(labelStore.selectedDrawingLayer)!; // sure?
            }
        }
        return null;
    }

    getGMMContext(): CanvasRenderingContext2D | null {
        let labelStore = ActionEventHandler.getInstance().editorStore;
        if (labelStore) {
            let gmmCanvas = labelStore.layerNameToCanvas.get('GMM');
            return gmmCanvas?.getContext('2d') ?? null;
        }
        return null;
    }

    mouseDownFunction(event: MouseEvent, canvas: HTMLCanvasElement) {
        event.preventDefault();
        let labelStore = ActionEventHandler.getInstance().editorStore;

        if (labelStore) {
            if (event.which === 3) {
                return; // Skip right-clicks
            }

            const xy = getMousePos(event, labelStore);
            if (!xy) return;

            const x = Math.floor(xy.x) - Math.floor(1 / 2);
            const y = Math.floor(xy.y) - Math.floor(1 / 2);
            labelStore.mouseIsDown = true;

            if (labelStore.bucket.active && !labelStore.wand.menuOpen && this.uploadStore) {
                labelStore.lastXY = { x, y };
                bucketFillWorker(canvas!, x, y, labelStore, this.uploadStore); //todo
                return;
            }

            const x2 = Math.floor(xy.x) - Math.floor(labelStore.penSize / 2);
            const y2 = Math.floor(xy.y) - Math.floor(labelStore.penSize / 2);

            labelStore.lastXY = { x: x2, y: y2 };

            if (labelStore.wand.menuOpen) {
                labelStore.closeAllMenus();
                labelStore.wand.overwriteClass = labelStore.hoverColor;
                labelStore.wand.menuOpen = false;
                labelStore.wand.active = true;
                labelStore.wand.drawLayer = labelStore.selectedDrawingLayer;
                toggleCursor('wand')
                return;
            }

            if (labelStore.drawingActive && labelStore.layerNameDrawerSettings.get(labelStore.selectedDrawingLayer)!.visible) {
                drawPixel(x2, y2, this.uploadStore!.classes[labelStore.selectedClass].color, labelStore);
            } else if (labelStore.eraser.active && labelStore.layerNameDrawerSettings.get(labelStore.selectedDrawingLayer)!.visible) {
                erasePixel(x2, y2, labelStore);
            } else if (this.editorStore?.gapDrawer.active) {
                drawGapPixel(x2, y2, this.uploadStore!.classes[labelStore.selectedClass].color, labelStore);
            } else if (labelStore.wand.active) {
                overDrawColor(x2, y2, this.uploadStore!.classes[labelStore.selectedClass].color, labelStore);
            } else if (labelStore.magneticDrawer.active) {
                magneticDraw(x2, y2, this.uploadStore!.classes[labelStore.selectedClass].color, labelStore);
            }
        }
    }

    mouseUpFunction(event: MouseEvent) {
        event.preventDefault();
        let labelStore = ActionEventHandler.getInstance().editorStore;

        if (labelStore) {
            labelStore.mouseIsDown = false;
            if (event.button === 0) {
                if (labelStore.bucket.active || labelStore.drawingActive || labelStore.eraser.active || labelStore.wand.active || labelStore.gapDrawer.active) {
                    HistoryHandler.getInstance().pushToHistory();
                    if (labelStore.drawingActive) {
                        // logAudit(labelStore.currentImage.fullTitle, 'draw');
                    } else if (labelStore.eraser.active) {
                        // logAudit(labelStore.currentImage.fullTitle, 'erase');
                    } else if (labelStore.wand.active) {
                        // logAudit(labelStore.currentImage.fullTitle, 'magicdraw');
                    } else if (labelStore.gapDrawer.active) {
                        // logAudit(labelStore.currentImage.fullTitle, 'abstick');
                    }
                }
            }
        }
    }

    mouseMoveEvent(event: Event, gmmContext: CanvasRenderingContext2D | null) {
        event.preventDefault();
        let labelStore = ActionEventHandler.getInstance().editorStore;

        if (labelStore && labelStore.mouseIsDown) {
            const xy = getMousePos(event as MouseEvent, labelStore);
            if (!xy) return;

            let x = Math.floor(xy.x) - Math.floor(labelStore.penSize / 2);
            let y = Math.floor(xy.y) - Math.floor(labelStore.penSize / 2);

            if (labelStore.drawingActive && labelStore.layerNameDrawerSettings.get(labelStore.selectedDrawingLayer)!.visible) {
                drawPixel(x, y, labelStore.sel, labelStore);
            } else if (labelStore.eraser.active && labelStore.layerNameDrawerSettings.get(labelStore.selectedDrawingLayer)!.visible) {
                erasePixel(x, y, labelStore);
            } else if (labelStore.gapDrawer.active) {
                drawGapPixel(x, y, this.uploadStore!.classes[labelStore.selectedClass].color, labelStore);
            } else if (labelStore.wand.active) {
                overDrawColor(x, y, this.uploadStore!.classes[labelStore.selectedClass].color, labelStore);
            } else if (labelStore.magneticDrawer.active) {
                magneticDraw(x, y, this.uploadStore!.classes[labelStore.selectedClass].color, labelStore);
            }
        }
    }

    addMouseDownListeners() {
        if (!ActionEventHandler.mousedownListener) {

            let canvas = ActionEventHandler.getInstance().getCanvas();
            if (canvas) {
                canvas.style.pointerEvents = 'auto';
                ['mousedown', 'touchstart'].forEach(modality => {
                    canvas!.addEventListener(modality, ActionEventHandler.getInstance().mouseDownHandler);
                });
                ActionEventHandler.mousedownListener = true;
            }
        }
    }

    addMouseUpListeners() {
        if (!ActionEventHandler.mouseupListener) {

            let body = document.querySelector('#labelContainer');
            if (body) {
                ['mouseup', 'touchend'].forEach(modality => {
                    body!.addEventListener(modality, ActionEventHandler.getInstance().mouseUpHandler);
                });
                ActionEventHandler.mouseupListener = true;
            }
        }
    }

    addMouseMoveEventListeners() {
        if (!ActionEventHandler.mousemoveListener) {

            let canvas = ActionEventHandler.getInstance().getCanvas();
            if (canvas) {
                ['mousemove', 'touchmove'].forEach(modality => {
                    canvas!.addEventListener(modality, ActionEventHandler.getInstance().mouseMoveHandler);
                });
                ActionEventHandler.mousemoveListener = true;
            }
        }
    }

    updateMouseListeners() {
        ActionEventHandler.getInstance().removeEventListeners();
        ActionEventHandler.getInstance().addMouseDownListeners();
        ActionEventHandler.getInstance().addMouseUpListeners();
        ActionEventHandler.getInstance().addMouseMoveEventListeners();
    }

    removeEventListeners() {
        let labelStore = ActionEventHandler.getInstance().editorStore;
        if (labelStore) {
            labelStore.layerNameToCanvas.forEach((canvas: HTMLCanvasElement) => {
                ['mousedown', 'touchstart'].forEach(modality => {
                    canvas?.removeEventListener(modality, ActionEventHandler.getInstance().mouseDownHandler);
                });
                ['mouseup', 'touchend'].forEach(modality => {
                    canvas?.removeEventListener(modality, ActionEventHandler.getInstance().mouseUpHandler);
                });
                ['mousemove', 'touchmove'].forEach(modality => {
                    canvas?.removeEventListener(modality, ActionEventHandler.getInstance().mouseMoveHandler);
                });
            });
            ActionEventHandler.mousedownListener = false;
            ActionEventHandler.mouseupListener = false;
            ActionEventHandler.mousemoveListener = false;
        }
    }
}
