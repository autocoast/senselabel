
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


import type { EditorStore } from "@/types";
import { useEditorStore } from "~/store/editorStore";

export class LayersHandler {
    static instance: LayersHandler | null = null;


    editorStore: EditorStore | null = null;

    constructor() {
        if (LayersHandler.instance) {
            return LayersHandler.instance;
        }
        this.editorStore = useEditorStore();
    }

    static getInstance() {
        if (!LayersHandler.instance) {
            LayersHandler.instance = new LayersHandler();
        }
        return LayersHandler.instance;
    }

    /**
     * Orders the layers in the layers container
     * @param layerName Layer to come to the front
     */
    orderLayers(layerName: string) {
        let labelCanvasStore = LayersHandler.getInstance().editorStore;
        if (labelCanvasStore) {
            const layers = document.getElementById('layers');
            const newSelectedLayerNode = document.getElementById(layerName);
            if (layers && newSelectedLayerNode) {
                layers.appendChild(newSelectedLayerNode);
            }
            // move canvas with IDs that start with 'Drawing Layer' to th last of the list
            const drawingLayers = document.querySelectorAll('canvas[id^="Drawing Layer"]');

            drawingLayers?.forEach((layer) => {
                layers?.appendChild(layer);
            });
            if (layerName.startsWith('Drawing Layer') && layers && newSelectedLayerNode) {
                layers.appendChild(newSelectedLayerNode);
            }

            // reoder labelCanvasStore.layerNameToCanvas
            labelCanvasStore.layerNameDisplayOrder = labelCanvasStore.layerNameDisplayOrder.sort((a, b) => {
                if (a === layerName) {
                    return -1;
                } else if (b === layerName) {
                    return 1;
                } else {
                    return 0;
                }
            });

            labelCanvasStore.drawingLayerNameDisplayOrder = labelCanvasStore.drawingLayerNameDisplayOrder.sort((a, b) => {
                if (a === layerName) {
                    return -1;
                } else if (b === layerName) {
                    return 1;
                } else {
                    return 0;
                }
            });

            // labelCanvasStore.layerType = LayersHandler.getInstance().getLayerType();
        }
    }

    // getLayerType() {
    //     let layerType: 'Moisture' | 'Agriculture' | 'NDVI' | 'Short Wave Infrared' | 'RGB' = 'Moisture';

    //     let layers = document.getElementById('layers')!.children
    //     for (let i = layers.length - 1; i >= 0; i--) {
    //         let layer = layers[i] as HTMLCanvasElement;
    //         if (!layer.id.startsWith('Drawing Layer')) {
    //             if (layer.id === 'Moisture') {
    //                 layerType = 'Moisture';
    //                 break;
    //             }
    //             if (layer.id === 'Agriculture') {
    //                 layerType = 'Agriculture';
    //                 break;
    //             }
    //             if (layer.id === 'NDVI') {
    //                 layerType = 'NDVI';
    //                 break;
    //             }
    //             if (layer.id === 'Short Wave Infrared') {
    //                 layerType = 'Short Wave Infrared';
    //                 break;
    //             }

    //             layerType = 'RGB';
    //             break;
    //         }
    //     }

    //     return layerType;
    // }


    clearSourceCanvas() {
        let labelCanvas = document.getElementById('sourceImage');
        if (labelCanvas) {
            labelCanvas.innerHTML = '';
        }
    }

    clearDrawingCanvas() {
        let labelCanvas = document.getElementById('drawingContainer');
        if (labelCanvas) {
            labelCanvas.innerHTML = '';
        }
    }

    clearLayerCanvases() {
        let labelCanvas = document.getElementById('layers');
        if (labelCanvas) {
            labelCanvas.innerHTML = '';
        }
    }
}