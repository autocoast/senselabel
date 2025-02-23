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

import { SatelliteType, type EditorStore, type EditorStoreActions, type EditorStoreGetters, type NormType } from "@/types";

let worker: Worker | null = null;

export function normalize(editStore: (EditorStore & EditorStoreActions & EditorStoreGetters), normType: NormType, satelliteType: SatelliteType) {

    let tooltips = 'Source Image';
    // let canvas = getCanvasTemplate(labelStore, 'Source Image', tooltips);

    let canvas: HTMLCanvasElement = document.getElementById('Source Image') as HTMLCanvasElement;

    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('@/public/workers/normalizeWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
        // const { canvas } = event.data;
        // labelStore.layerNameToCanvas.set('savi', canvas);

        const ctx = canvas.getContext('2d');
        if (ctx) {
            const { imageData } = event.data;
            ctx.putImageData(imageData, 0, 0);
            ctx.imageSmoothingEnabled = false;
        }

        worker?.terminate();  // Clean up the worker
    };

    let r: Uint16Array = new Uint16Array();
    let g: Uint16Array = new Uint16Array();
    let b: Uint16Array = new Uint16Array();

    switch (satelliteType) {
        case SatelliteType.sentinels2l2a:
            r = editStore.sentinels2l2a.rawBands.b4.raster;
            g = editStore.sentinels2l2a.rawBands.b3.raster;
            b = editStore.sentinels2l2a.rawBands.b2.raster;
            break;
        case SatelliteType.landsat8toa:
            r = editStore.landsat8toa.rawBands.b4.raster;
            g = editStore.landsat8toa.rawBands.b3.raster;
            b = editStore.landsat8toa.rawBands.b2.raster;
            break;
        case SatelliteType.sentinels2l1c:
            r = editStore.sentinels2l1c.rawBands.b4.raster;
            g = editStore.sentinels2l1c.rawBands.b3.raster;
            b = editStore.sentinels2l1c.rawBands.b2.raster;
            break;
        case SatelliteType.landsat8sr:
            r = editStore.landsat8sr.rawBands.b4.raster;
            g = editStore.landsat8sr.rawBands.b3.raster;
            b = editStore.landsat8sr.rawBands.b2.raster;
            break;
        case SatelliteType.landsat5toa:
            r = editStore.landsat5toa.rawBands.b3.raster;
            g = editStore.landsat5toa.rawBands.b2.raster;
            b = editStore.landsat5toa.rawBands.b1.raster;
            break;
        case SatelliteType.landsat5sr:
            r = editStore.landsat5sr.rawBands.b3.raster;
            g = editStore.landsat5sr.rawBands.b2.raster;
            b = editStore.landsat5sr.rawBands.b1.raster;
            break;
    }

    worker.postMessage({
        rRaw: r,
        gRaw: g,
        bRaw: b,
        normType,
        width: editStore.width,
        height: editStore.height
    });
}