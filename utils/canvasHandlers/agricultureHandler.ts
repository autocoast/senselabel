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
import { SatelliteType, type EditorStore } from "@/types";

let worker: Worker | null = null;

export function loadAgriculture(editStore: EditorStore, satelliteType: SatelliteType) {

    let tooltips = 'The agriculture band combination uses SWIR-1 (B11), near-infrared (B8), and blue (B2). It’s mostly used to monitor the health of crops because of how it uses short-wave and near-infrared. Both these bands are particularly good at highlighting dense vegetation that appears as dark green.';
    let canvas = getCanvasTemplate(editStore, 'Agriculture', tooltips, true);

    // let normalisedAgricultureTiff: ImageData = normalizeBy1And99Percentile([editStore.b11Raw, editStore.b8Raw, editStore.rgbRaw[2]], editStore.width, editStore.height);
    if (worker) {
        worker.terminate();  // Terminate any existing worker
    }

    worker = new Worker(new URL('@/public/workers/agricultureWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {


        const ctx = canvas.getContext('2d');
        if (ctx) {
            const { imageData } = event.data;
            ctx.clearRect(0, 0, editStore.width, editStore.height);
            ctx.putImageData(imageData, 0, 0);
            ctx.imageSmoothingEnabled = false;
        }

        worker?.terminate();  // Clean up the worker
    };

    let SWIR: Uint16Array = new Uint16Array();
    let NIR: Uint16Array = new Uint16Array();
    let BLUE: Uint16Array = new Uint16Array();

    switch (satelliteType) {
        case SatelliteType.sentinels2l2a:
            BLUE = editStore.sentinels2l2a.rawBands.b2.raster;
            NIR = editStore.sentinels2l2a.rawBands.b8.raster;
            SWIR = editStore.sentinels2l2a.rawBands.b11.raster;
            break;
        case SatelliteType.sentinels2l1c:
            BLUE = editStore.sentinels2l1c.rawBands.b2.raster;
            NIR = editStore.sentinels2l1c.rawBands.b8.raster;
            SWIR = editStore.sentinels2l1c.rawBands.b11.raster;
            break;
        case SatelliteType.landsat8toa:
            BLUE = editStore.landsat8toa.rawBands.b2.raster;
            NIR = editStore.landsat8toa.rawBands.b5.raster;
            SWIR = editStore.landsat8toa.rawBands.b6.raster;
            break;
    }

    worker.postMessage({
        swir: SWIR,
        nir: NIR,
        blue: BLUE,
        width: editStore.width,
        height: editStore.height,
    });
}
