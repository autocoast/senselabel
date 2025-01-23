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


import type { EditorStore, NormType, UploadStore, UploadStoreActions, UploadStoreGetters } from "~/types";
import ndarray from 'ndarray';

export function normalizeBy1And99Percentile(img: Uint16Array[], width: number, height: number): ImageData {
    const r = img[0];
    const g = img[1];
    const b = img[2];

    const returnImage = new ImageData(width, height);
    const rSorted = r.slice().sort((a, b) => a - b);
    const gSorted = g.slice().sort((a, b) => a - b);
    const bSorted = b.slice().sort((a, b) => a - b);

    const r1 = rSorted[Math.floor(rSorted.length * 0.01)];
    const r99 = rSorted[Math.floor(rSorted.length * 0.99)];
    const g1 = gSorted[Math.floor(gSorted.length * 0.01)];
    const g99 = gSorted[Math.floor(gSorted.length * 0.99)];
    const b1 = bSorted[Math.floor(bSorted.length * 0.01)];
    const b99 = bSorted[Math.floor(bSorted.length * 0.99)];

    for (let i = 0; i < width * height; i++) {
        const normR = Math.floor((r[i] - r1) / (r99 - r1) * 255);
        const normG = Math.floor((g[i] - g1) / (g99 - g1) * 255);
        const normB = Math.floor((b[i] - b1) / (b99 - b1) * 255);

        returnImage.data[i * 4] = normR;
        returnImage.data[i * 4 + 1] = normG;
        returnImage.data[i * 4 + 2] = normB;
        returnImage.data[i * 4 + 3] = 255;

    }
    return returnImage;
}

// let labelStore = useLabelCanvasStore();

export function rgbToHex(r: number, g: number, b: number) {
    return ((r << 16) | (g << 8) | b).toString(16).toUpperCase();
}

function isOpacityPixel(pixel: Uint8ClampedArray) {
    return pixel[3] === 0;
}

export function getHexStringAt(x: number, y: number, labelStore: EditorStore): {
    layerName: string,
    hex: string
} {
    for (let i = 0; i < labelStore.drawingLayerNameDisplayOrder.length; i++) {
        let layerName = labelStore.drawingLayerNameDisplayOrder[i];
        let canvas = labelStore.layerNameToCanvas.get(layerName);
        if (canvas?.style.opacity === '0') {
            continue;
        }

        let ctx = canvas!.getContext('2d', {
            willReadFrequently: true
        });
        let pixel = ctx!.getImageData(x, y, 1, 1).data;

        if (isOpacityPixel(pixel)) {
            continue;
        }


        let hex = '#' + ('000000' + rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6);
        // if (allClassColors.includes(hex)) {
        return {
            layerName: layerName,
            hex: hex
            // };
        }
    }

    for (let i = 0; i < labelStore.layerNameDisplayOrder.length; i++) {
        let layerName = labelStore.layerNameDisplayOrder[i];

        let canvas = labelStore.layerNameToCanvas.get(layerName);
        if (canvas?.style.opacity === '0') {
            continue;
        }

        let ctx = canvas!.getContext('2d', {
            willReadFrequently: true
        });


        let xmod = x;
        let ymod = y;
        // if (layerName === 'GMM' || layerName === 'SCL') {
        //     xmod -= patchNumberToCoords(patchNumber).x;
        //     ymod -= patchNumberToCoords(patchNumber).y;
        // }

        let pixel = ctx!.getImageData(xmod, ymod, 1, 1).data;

        let hex = '#' + ('000000' + rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6);


        if (isOpacityPixel(pixel)) {
            continue;
        }


        // if (allClassColors.includes(hex)) {
        return {
            layerName: layerName,
            hex: hex
        };
        // }
    }

    return {
        layerName: 'Drawing Layer 1',
        hex: '#000000'
    };
}

/**
 * Get the current active layer defined at the most top layer without opacity 0
 * @param hasProperty 
 * @returns 
 */
export function getActiveLayer(labelStore: EditorStore, hasProperties?: string[], ignoreHasProperties?: string[]) {

    const checkLayer = (layerName: string) => {
        let canvas = labelStore.layerNameToCanvas.get(layerName);
        if (canvas?.style.opacity === '0') {
            return false;
        }
        if (ignoreHasProperties && ignoreHasProperties.length > 0) {
            if (ignoreHasProperties.every(prop => !canvas?.hasAttribute(prop))) {
                return false;
            }
        }
        if (hasProperties && hasProperties.length > 0) {
            if (hasProperties.every(prop => canvas!.hasAttribute(prop))) {
                return true;
            }
        } else {
            return true;
        }

    }

    // drawing layers are always on top, that's why we check them first
    for (let i = 0; i < labelStore.drawingLayerNameDisplayOrder.length; i++) {
        let layerName = labelStore.drawingLayerNameDisplayOrder[i];
        if (checkLayer(layerName)) return layerName;
    }

    for (let i = 0; i < labelStore.layerNameDisplayOrder.length; i++) {
        let layerName = labelStore.layerNameDisplayOrder[i];
        if (checkLayer(layerName)) return layerName;
    }

    return 'Drawing Layer 1';
}

// export function coordinatesToIndex(x: number, y: number, componentsPerPixel: number = 4) {
//     return (y * config.imageSize + x);
// }

export function getMousePos(event: MouseEvent, labelStore: EditorStore) {
    // let canvas = labelStore.layerNameToCanvas.get(labelStore.selectedLayer);
    // let labelStore = ActionEventHandler.getInstance().canvasHandlerStore;
    if (labelStore) {
        let canvas = labelStore.layerNameToCanvas.get('Drawing Layer 1');
        let rect = canvas!.getBoundingClientRect();
        let scaleX = canvas!.width / rect.width;    // relationship bitmap vs. element for X
        let scaleY = canvas!.height / rect.height;  // relationship bitmap vs. element for Y

        return {
            x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
            y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
        };
    }
}

export function hexToColor(hex: string): number {
    // Remove the '#' if it's there
    hex = hex.replace('#', '');

    // Parse the hex string as an integer with base 16
    return parseInt(hex, 16);
}


export function colorDistance(color1: number, color2: number) {
    // Extract RGB components from color1
    const r1 = (color1 >> 16) & 0xFF;
    const g1 = (color1 >> 8) & 0xFF;
    const b1 = color1 & 0xFF;

    // Extract RGB components from color2
    const r2 = (color2 >> 16) & 0xFF;
    const g2 = (color2 >> 8) & 0xFF;
    const b2 = color2 & 0xFF;

    // Compute the distance using Euclidean formula
    const distance = Math.sqrt(
        Math.pow(r2 - r1, 2) +
        Math.pow(g2 - g1, 2) +
        Math.pow(b2 - b1, 2)
    );

    return distance;
}

export function formatHkBadge(name: string, settingsStore: any) {
    return settingsStore.hotKeys.find((x: any) => x.name == name)?.keys.map((x: any) => x.toLocaleUpperCase().replace('CONTROL', 'Ctrl').replace('META', '⌘')).join(' + ');
}

export function toggleCursor(cursor: string) {
    let labelContainer = document.getElementById('labelContainer');
    // remove class
    labelContainer?.classList.remove('cursor-draw');
    labelContainer?.classList.remove('cursor-move');
    labelContainer?.classList.remove('cursor-ab');
    labelContainer?.classList.remove('cursor-bucket');
    labelContainer?.classList.remove('cursor-wand');
    labelContainer?.classList.remove('cursor-delete');

    // add class
    labelContainer?.classList.add(`cursor-${cursor}`);

}

export function invertColor(r: number, g: number, b: number): string {
    const invertedR = 255 - r;
    const invertedG = 255 - g;
    const invertedB = 255 - b;
    return `rgb(${invertedR}, ${invertedG}, ${invertedB})`;
}

export function extractCanvasData(canvas: HTMLCanvasElement, uploadStore: (UploadStore & UploadStoreActions & UploadStoreGetters)) {
    const context = canvas.getContext('2d');
    const imageData = context!.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data; // Flat RGBA data

    // Extract a single channel (e.g., grayscale or a specific channel)
    const singleChannel = new Uint8Array(canvas.width * canvas.height);
    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];
        let a = pixels[i + 3];
        let hexString = rgbToHexString([r, g, b]);
        let classNumber = uploadStore.hexColorToClassNumber(hexString);
        singleChannel[i / 4] = classNumber;
    }

    return singleChannel;
}

export function rgbToHexString(rgb: number[]) {
    const hex = rgb.map((value) => value.toString(16).padStart(2, '0')).join('');
    return `#${hex}`;
}

export function createMultiChannelArray(canvases: HTMLCanvasElement[], uploadStore: (UploadStore & UploadStoreActions & UploadStoreGetters)) {
    if (canvases.length === 0) {
        throw new Error('No canvases provided');
    }

    const width = canvases[0].width;
    const height = canvases[0].height;
    const numChannels = canvases.length;

    // Initialize ndarray for multi-channel array
    const multiChannelArray = ndarray(new Uint8Array(width * height * numChannels), [height, width, numChannels]);

    // Fill the ndarray with data from each canvas
    canvases.forEach((canvas, channelIndex) => {
        const singleChannelData = extractCanvasData(canvas, uploadStore);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                multiChannelArray.set(y, x, channelIndex, singleChannelData[y * width + x]);
            }
        }
    });

    return multiChannelArray;
}

// function downloadAsNpy(array: ndarray.NdArray<Uint8Array>, filename = 'multi_channel_array.npy') {
//     const npyData = npyjs.write(array.data, { shape: array.shape });
//     const blob = new Blob([npyData], { type: 'application/octet-stream' });
//     saveAs(blob, filename);
// }

import * as npy2 from './npy.js';

export function ndarrayToNpy(ndarray: ndarray.NdArray<Uint8Array>): Uint8Array {
    const { shape, data } = ndarray;

    // Create the .npy file header
    const magicString = '\x93NUMPY';
    const version = '\x01\x00'; // NPY file format version 1.0
    const dtype = '<u1'; // Little-endian unsigned 8-bit integer

    const headerDict = {
        descr: dtype, // Data type descriptor
        fortran_order: false, // Row-major (C-style) array
        shape: shape, // Shape of the array
    };

    let headerStr = JSON.stringify(headerDict)
        .replace(/"/g, "'") // Replace double quotes with single quotes
        .replace(/:/g, ': '); // Add space after colons

    // Ensure header is aligned to 16 bytes
    const padding = ' '.repeat((16 - ((10 + headerStr.length) % 16)) % 16);
    headerStr += padding;

    const headerLen = headerStr.length;
    const headerLenBytes = new Uint8Array([
        headerLen & 0xff,
        (headerLen >> 8) & 0xff,
    ]); // Little-endian 2-byte length

    // Encode the header
    const headerBytes = new TextEncoder().encode(magicString + version);
    const fullHeader = new Uint8Array(
        headerBytes.length + headerLenBytes.length + headerLen
    );
    fullHeader.set(headerBytes, 0);
    fullHeader.set(headerLenBytes, headerBytes.length);
    fullHeader.set(new TextEncoder().encode(headerStr), headerBytes.length + headerLenBytes.length);

    // Combine header and data
    const npyArray = new Uint8Array(fullHeader.length + data.length);
    npyArray.set(fullHeader, 0);
    npyArray.set(data, fullHeader.length);

    return npyArray;
}


export function downloadAsNpy(ndarray: ndarray.NdArray<Uint8Array>, filename = 'multi_channel_array.npy') {
    // Convert the ndarray to a .npy file buffer
    const npyBuffer = npy2.default.tobuffer({
        data: ndarray.data,
        shape: ndarray.shape,
        fortran_order: false, // Set to false for C-contiguous arrays
    });

    // Create a Blob and trigger download
    const blob = new Blob([npyBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// Example usage:
export function handleDownload(canvases: HTMLCanvasElement[], uploadStore: (UploadStore & UploadStoreActions & UploadStoreGetters)) {

    if (canvases.length === 0) {
        console.error('No canvases found!');
        return;
    }

    try {
        const multiChannelArray = createMultiChannelArray(canvases, uploadStore);
        downloadAsNpy(multiChannelArray);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
    }
}


export function normTypeToDisplayName(norm: NormType) {
    switch (norm) {
        case '1and99percentile':
            return '1% and 99% Percentile';
        case '5and95percentile':
            return '5% and 95% Percentile';
        case 'minmax':
            return 'Min-Max';
        case 'histogram':
            return 'Histogram Equalization';
        default:
            return '10000';
    }
}

export function getCanvasTemplate(labelStore: any, canvasId: string, tooltips: string, discretizable: boolean = false) {

    let canvas = null;
    if (labelStore.layerNameToCanvas.has(canvasId)) {
        canvas = labelStore.layerNameToCanvas.get(canvasId)!;
    } else {
        canvas = document.createElement('canvas');
    }
    canvas.width = labelStore.width;
    canvas.height = labelStore.height;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.id = canvasId;
    if (!labelStore.layerNameDrawerSettings.has(canvasId)) {
        labelStore.addLayer(canvasId, canvas, discretizable);
        // labelStore.tooltips[canvasId] = tooltips;
    }

    return canvas;

}

export function isLayerFile(layerName: string) {
    return layerName.endsWith('.tif') || layerName.endsWith('.tiff') || layerName.endsWith('.png') || layerName.endsWith('.jpg') || layerName.endsWith('.jpeg') || layerName.endsWith('.bmp');
}