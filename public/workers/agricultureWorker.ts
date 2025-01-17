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

self.addEventListener('message', (event) => {
    const swir: Uint16Array = event.data.swir;
    const nir: Uint16Array = event.data.nir;
    const blue: Uint16Array = event.data.nir;
    const width: number = event.data.width;
    const height: number = event.data.height;

    let imageData = normalizeBy1And99Percentile([swir, nir, blue], width, height);

    self.postMessage({
        imageData
    });
});




function normalizeBy1And99Percentile(img: Uint16Array[], width: number, height: number): ImageData {
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