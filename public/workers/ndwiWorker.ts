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
    const b8aRaw: Uint16Array = event.data.b8aRaw;
    const bRaw: Uint16Array = event.data.bRaw;
    const width: number = event.data.width;
    const height: number = event.data.height;

    const ndwiArray: number[] = [];
    for (let i = 0; i < b8aRaw.length; i++) {
        let ndwi = ((bRaw[i] - b8aRaw[i]) / (bRaw[i] + b8aRaw[i]));
        ndwiArray.push(ndwi);
    }

    const imageData = new ImageData(width, height);
    for (let i = 0; i < ndwiArray.length; i++) {
        imageData.data[i * 4] = ndwiArray[i] * 255;
        imageData.data[i * 4 + 1] = ndwiArray[i] * 255;
        imageData.data[i * 4 + 2] = ndwiArray[i] * 255;
        imageData.data[i * 4 + 3] = 255;
    }

    self.postMessage({
        imageData
    });
});