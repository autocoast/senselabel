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

// kmeansWorker.ts
import { KMeans } from './kmeans'; // Import the KMeans class

self.addEventListener('message', (event) => {
    const { pixels, k } = event.data;

    // Perform K-means clustering
    const kmeans = new KMeans(k);
    kmeans.fit(pixels);
    const labels = kmeans.predict(pixels);
    const centroids = kmeans.centroids;

    // Return the clusters and centroids back to the main thread
    self.postMessage({ labels, centroids });
});

// KMeans class would be the same as the one shared earlier
