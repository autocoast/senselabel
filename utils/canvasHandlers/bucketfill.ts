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

import { HistoryAction, HistoryHandler } from "@/utils/historyHandler";
import type { EditorStore, UploadStore, UploadStoreActions, UploadStoreGetters } from "@/types";
import { getHexStringAt } from "@/utils";
let worker: Worker | null = null;

export function bucketFillWorker(targetCanvas: HTMLCanvasElement, startX: number, startY: number, labelStore: EditorStore, uploadStore: (UploadStore & UploadStoreGetters & UploadStoreActions)) {

    const context = targetCanvas?.getContext('2d');
    if (!context) return;

    // labelStore.isLoading = true;

    const {
        layerName: sourceLayerName,
        hex: hexColorToReplace,
    } = getHexStringAt(startX, startY, labelStore);

    const sourceLayerCanvas = labelStore.layerNameToCanvas.get(sourceLayerName)!;
    const sourceContext = sourceLayerCanvas.getContext('2d')!;

    const replacingHexColor = uploadStore.classes[labelStore.selectedClass].color;
    const imageData = sourceContext.getImageData(0, 0, sourceLayerCanvas.width, sourceLayerCanvas.height);
    const targetImageData = context.getImageData(0, 0, targetCanvas.width, targetCanvas.height);


    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('@/public/workers/bucketFillWorker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event) => {
        const { imageData: updatedData } = event.data;

        const newImageData = new ImageData(new Uint8ClampedArray(updatedData), 480, 480);

        context.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        context.putImageData(newImageData, 0, 0);

        // labelStore.isLoading = false;
        labelStore.mouseIsDown = false;
        // labelStore.pushToHistory();
        HistoryHandler.getInstance().pushToHistory(); // todo

        worker?.terminate();  // Clean up the worker
    };

    worker.postMessage({
        sourceIsPatchSize: sourceLayerCanvas.id === 'GMM' || sourceLayerCanvas.id === 'SCL',
        targetImageData,
        imageData,
        startX,
        startY,
        hexColorToReplace,
        replacingHexColor,
        sourceCanvasWidth: sourceLayerCanvas.width,
        sourceCanvasHeight: sourceLayerCanvas.height,
        layerIsDrawingLayer: sourceLayerName.includes('Drawing Layer'),
        tolerance: labelStore.bucketFillTolerance, // tolerance
        imageSize: targetCanvas.width
    });
}
