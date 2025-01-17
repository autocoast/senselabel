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

import type { EditorStore } from "~/types";

export function erasePixel(x: number, y: number, editStore: EditorStore) {
    let canvas = editStore.layerNameToCanvas.get(editStore.selectedDrawingLayer);
    const context = canvas?.getContext('2d');
    if (context) {
        context.clearRect(x, y, editStore.penSize, editStore.penSize);
    }
}

export function drawPixel(x: number, y: number, color: string, editStore: EditorStore) {
    let canvas = editStore.layerNameToCanvas.get(editStore.selectedDrawingLayer);
    const context = canvas?.getContext('2d');
    if (context) {
        context.fillStyle = color;
        context.fillRect(x, y, editStore.penSize, editStore.penSize);
    }
}

export function drawGapPixel(x: number, y: number, color: string, editStore: EditorStore) {


    let canvas = editStore.layerNameToCanvas.get(editStore.selectedDrawingLayer);
    const context = canvas?.getContext('2d');

    if (context) {
        // if ((x + editStore.penSize / 2) < x0 || (x - editStore.penSize / 2) >= x0 + config.patchSize || (y + editStore.penSize / 2) < y0 || (y - editStore.penSize / 2) >= y0 + config.patchSize) {
        //     return;
        // }

        const penSize = editStore.penSize;

        // Iterate through the pen size area
        for (let i = 0; i < penSize; i++) {
            for (let j = 0; j < penSize; j++) {
                let shouldDraw = true;

                // Check if all pixels in the pen size area are zero
                editStore.layerNameToCanvas.forEach((canvas, layerName) => {
                    if (layerName.startsWith('Drawing Layer')) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            const pixel = ctx.getImageData(x + i, y + j, 1, 1).data;
                            if (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0 || pixel[3] !== 0) {
                                shouldDraw = false;
                            }
                        }
                    }
                });

                // Draw only if the pixel is zero
                if (shouldDraw) {
                    context.fillStyle = color;
                    context.fillRect(x + i, y + j, 1, 1);
                }
            }
        }
    }
}

export function overDrawColor(x: number, y: number, color: string, editStore: EditorStore) {
    let canvas = editStore.layerNameToCanvas.get(editStore.wand.drawLayer);
    const context = canvas?.getContext('2d');
    if (context) {
        for (let i = 0; i < editStore.penSize; i++) {
            for (let j = 0; j < editStore.penSize; j++) {
                const colorXY = getHexStringAt(x + i, y + j, editStore).hex;
                if (colorXY === editStore.wand.overwriteClass.toUpperCase()) {
                    context.fillStyle = color;
                    context.fillRect(x + i, y + j, 1, 1);
                }
            }
        }
    }
}


export function magneticDraw(x: number, y: number, color: string, editStore: EditorStore) {
    const canvas = editStore.layerNameToCanvas.get('Source Image');
    const drawingCanvas = editStore.layerNameToCanvas.get(editStore.selectedDrawingLayer);

    if (!canvas || !drawingCanvas) return;

    const context = canvas.getContext('2d');
    const drawContext = drawingCanvas.getContext('2d');

    if (context && drawContext) {
        const radius = editStore.penSize * 2; // Adjustable based on pen size
        const edgeData = context.getImageData(x - radius, y - radius, radius * 2, radius * 2);

        // Analyze the edgeData to find the nearest edge
        let bestX = x, bestY = y;
        let maxEdgeValue = 0;

        for (let i = 0; i < edgeData.width; i++) {
            for (let j = 0; j < edgeData.height; j++) {
                const index = (j * edgeData.width + i) * 4;
                const intensity = edgeData.data[index]; // Assuming grayscale edge map

                if (intensity > maxEdgeValue) {
                    maxEdgeValue = intensity;
                    bestX = x + i - radius;
                    bestY = y + j - radius;
                }
            }
        }

        // Snap to the nearest adjacent pixel
        if (editStore.lastXY.x && editStore.lastXY.y) {
            const adjacentPixels = [
                { x: editStore.lastXY.x - 1, y: editStore.lastXY.y },
                { x: editStore.lastXY.x + 1, y: editStore.lastXY.y },
                { x: editStore.lastXY.x, y: editStore.lastXY.y - 1 },
                { x: editStore.lastXY.x, y: editStore.lastXY.y + 1 }
            ];

            // Find the closest adjacent pixel to bestX, bestY
            let closestPixel = adjacentPixels[0];
            let minDistance = Infinity;

            adjacentPixels.forEach(pixel => {
                const distance = Math.sqrt(
                    Math.pow(pixel.x - bestX, 2) + Math.pow(pixel.y - bestY, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestPixel = pixel;
                }
            });

            bestX = closestPixel.x;
            bestY = closestPixel.y;
        }

        // Draw and update the previous position
        drawContext.fillStyle = color;
        drawContext.fillRect(bestX, bestY, editStore.penSize, editStore.penSize);
        editStore.lastXY.x = bestX;
        editStore.lastXY.y = bestY;
    }
}
