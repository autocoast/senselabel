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

import { getCanvasTemplate } from "@/utils";
import { SatelliteType, type EditorStore } from "~/types";

let worker: Worker | null = null;

export function loadNDVI(editStore: EditorStore, satelliteType: SatelliteType) {

    let tooltips = 'Because near-infrared (which vegetation strongly reflects) and red light (which vegetation absorbs), the vegetation index is good for quantifying the amount of vegetation. The formula for the normalized difference vegetation index is (B8-B4)/(B8+B4). While high values suggest dense canopy, low or negative values indicate urban and water features.';
    let canvas = getCanvasTemplate(editStore, 'NDVI', tooltips, true);

    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('@/public/workers/ndviWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {


        const ctx = canvas.getContext('2d');
        if (ctx) {
            const { imageData } = event.data;
            ctx.putImageData(imageData, 0, 0);
            ctx.imageSmoothingEnabled = false;
        }

        worker?.terminate();  // Clean up the worker
    };

    let NIR: Uint16Array = new Uint16Array();
    let RED: Uint16Array = new Uint16Array();

    switch (satelliteType) {
        case SatelliteType.sentinels2l2a:
            RED = editStore.sentinels2l2a.rawBands.b4.raster;
            NIR = editStore.sentinels2l2a.rawBands.b8.raster;
            break;
        case SatelliteType.landsat8toa:
            RED = editStore.landsat8toa.rawBands.b4.raster;
            NIR = editStore.landsat8toa.rawBands.b5.raster;
            break;
        case SatelliteType.sentinels2l1c:
            RED = editStore.sentinels2l1c.rawBands.b4.raster;
            NIR = editStore.sentinels2l1c.rawBands.b5.raster;
            break;
        case SatelliteType.landsat8sr:
            RED = editStore.landsat8sr.rawBands.b4.raster;
            NIR = editStore.landsat8sr.rawBands.b5.raster;
            break;
    }



    worker.postMessage({
        b8Raw: NIR,
        rRaw: RED,
        width: editStore.width,
        height: editStore.height
    });
}