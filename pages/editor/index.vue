<!--
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
-->

<template>
    <EditorHeader>
        <div class="flex h-screen">

            <!-- Tool Bar -->
            <EditorToolbar />
            <!-- Main Editor -->
            <div class="flex-1 bg-slate-600 dark:bg-slate-950 relative">
                <EditorMap v-if="editorStore.mapViewActive" />
                <EditorClassicView v-else />
            </div>

            <!-- Layers/Right Panel -->
            <div v-if="!editorStore.mapIsActive" class="w-48 text-black p-4 space-y-4">
                <EditorLayerBar />
            </div>
            <div v-else class="w-48 text-black p-4 space-y-4">
                <div class="indicator">
                    <span v-if="editorStore.showHotkeys" class="indicator-item badge badge-primary">m</span>
                    <button class="btn w-30 mt-2 border-none text-sm text-slate-400"
                        @click="editorStore.mapIsActive = false, editorStore.panMoveActive = true">
                        <Icon name="mdi:close" />Close Map
                    </button>
                </div>
                <p class="dark:text-coolgreen text-center text-slate-400">Right click on a location to open street view
                </p>

            </div>
        </div>
    </EditorHeader>
</template>


<script lang="ts" setup>
import { fromUrl, fromArrayBuffer, GeoTIFFImage, type ReadRasterResult } from 'geotiff';
import { useEditorStore } from '~/store/editorStore';
import { useSettingsStore } from '~/store/settingStore';
import { useUploadStore } from '~/store/uploadStore';
import { SatelliteType } from '~/types';
import { loadAgriculture } from '~/utils/canvasHandlers/agricultureHandler';
import { discretize } from '~/utils/canvasHandlers/kmeansHandler';
import { loadNDVI } from '~/utils/canvasHandlers/ndviHandler';
import { loadNDWI } from '~/utils/canvasHandlers/ndwiHandler';
import GeoTIFF from 'geotiff';
import proj4 from 'proj4';
import { useNavStore } from '~/store/navStore';
import _ from 'lodash';

definePageMeta({
    layout: 'editor'
})

const editorStore = useEditorStore();
const uploadStore = useUploadStore();
const settingStore = useSettingsStore();
const navStore = useNavStore();
const route = useRoute()

function bilinearInterpolate() {
    // Determine the highest resolution band
    let maxResolutionBand;
    if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
        maxResolutionBand = Object.values(editorStore.sentinels2l2a.rawBands).reduce((max, band) => {
            return band.raster.length > max.raster.length ? band : max;
        });
    } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
        maxResolutionBand = Object.values(editorStore.sentinels2l1c.rawBands).reduce((max, band) => {
            return band.raster.length > max.raster.length ? band : max;
        });
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {
        maxResolutionBand = Object.values(editorStore.landsat8toa.rawBands).reduce((max, band) => {
            return band.raster.length > max.raster.length ? band : max;
        });
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
        maxResolutionBand = Object.values(editorStore.landsat8sr.rawBands).reduce((max, band) => {
            return band.raster.length > max.raster.length ? band : max;
        });
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat5toa) {
        maxResolutionBand = Object.values(editorStore.landsat5toa.rawBands).reduce((max, band) => {
            return band.raster.length > max.raster.length ? band : max;
        }); 
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat5sr) {
        maxResolutionBand = Object.values(editorStore.landsat5sr.rawBands).reduce((max, band) => {
            return band.raster.length > max.raster.length ? band : max;
        });
    }

    const maxResolution = Math.sqrt(maxResolutionBand.raster.length);
    if (!Number.isInteger(maxResolution)) {
        throw new Error("Invalid raster length for a square grid.");
    }

    const result: Record<string, Uint16Array> = {};

    let entries;
    if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
        entries = Object.entries(editorStore.sentinels2l2a.rawBands);
    } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
        entries = Object.entries(editorStore.sentinels2l1c.rawBands);
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {   
        entries = Object.entries(editorStore.landsat8toa.rawBands);
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
        entries = Object.entries(editorStore.landsat8sr.rawBands);
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat5toa) {
        entries = Object.entries(editorStore.landsat5toa.rawBands);
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat5sr) {
        entries = Object.entries(editorStore.landsat5sr.rawBands);
    }
    for (const [bandKey, { raster }] of entries) {
        const resolution = Math.sqrt(raster.length);
        if (!Number.isInteger(resolution)) {
            throw new Error(`Invalid raster length for band ${bandKey}.`);
        }

        if (resolution === maxResolution) {
            continue;
        }

        const scale = resolution / maxResolution;
        const interpolated = new Uint16Array(maxResolution * maxResolution);

        for (let y = 0; y < maxResolution; y++) {
            for (let x = 0; x < maxResolution; x++) {
                // Calculate the corresponding position in the lower-res image
                const srcX = x * scale;
                const srcY = y * scale;

                const x0 = Math.floor(srcX);
                const y0 = Math.floor(srcY);
                const x1 = Math.min(x0 + 1, resolution - 1);
                const y1 = Math.min(y0 + 1, resolution - 1);

                const xWeight = srcX - x0;
                const yWeight = srcY - y0;

                const topLeft = raster[y0 * resolution + x0];
                const topRight = raster[y0 * resolution + x1];
                const bottomLeft = raster[y1 * resolution + x0];
                const bottomRight = raster[y1 * resolution + x1];

                const interpolatedValue =
                    topLeft * (1 - xWeight) * (1 - yWeight) +
                    topRight * xWeight * (1 - yWeight) +
                    bottomLeft * (1 - xWeight) * yWeight +
                    bottomRight * xWeight * yWeight;

                interpolated[y * maxResolution + x] = Math.round(interpolatedValue);
            }
        }

        if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
            //@ts-ignore
            editorStore.sentinels2l2a.rawBands[bandKey].raster = interpolated;
        } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
            //@ts-ignore
            editorStore.sentinels2l1c.rawBands[bandKey].raster = interpolated;
        } else if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {
            //@ts-ignore
            editorStore.landsat8toa.rawBands[bandKey].raster = interpolated;
        } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
            //@ts-ignore
            editorStore.landsat8sr.rawBands[bandKey].raster = interpolated;
        } else if (uploadStore.selectedSatellite === SatelliteType.landsat5toa) {
            //@ts-ignore
            editorStore.landsat5toa.rawBands[bandKey].raster = interpolated;
        } else if (uploadStore.selectedSatellite === SatelliteType.landsat5sr) {
            //@ts-ignore
            editorStore.landsat5sr.rawBands[bandKey].raster = interpolated;
        }
    }
}

async function loadTifByUrlAndStore(tifName: string, bandName: string) {
    const tifImage = await fromUrl('https://senselabel.vercel.app/example/' + tifName);
    // const tifImage = await fromUrl('http://localhost:3000/example/' + tifName);
    const image: GeoTIFFImage = await tifImage.getImage();
    const rasterImage: ReadRasterResult = await image.readRasters()


    if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
        //@ts-ignore
        editorStore.sentinels2l2a.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B2') {
            editorStore.referenceGeoTiff = tifImage;
        }

    } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
        //@ts-ignore
        editorStore.sentinels2l1c.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B2') {
            editorStore.referenceGeoTiff = tifImage;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {
        //@ts-ignore
        editorStore.landsat8toa.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B3') {
            editorStore.referenceGeoTiff = tifImage;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
        //@ts-ignore
        editorStore.landsat8sr.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B3') {
            editorStore.referenceGeoTiff = tifImage;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat5toa) {
        //@ts-ignore
        editorStore.landsat5toa.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B4') {
            editorStore.referenceGeoTiff = tifImage;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat5sr) {
        //@ts-ignore
        editorStore.landsat5sr.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B4') {
            editorStore.referenceGeoTiff = tifImage;
        }
    }
}

async function loadTifByFileAndStore(tif: File, bandName: string, channel?: number | undefined) {
    const tifImage = await fromArrayBuffer(await tif.arrayBuffer());
    const image: GeoTIFFImage = await tifImage.getImage();
    let rasterImage: ReadRasterResult = await image.readRasters();
    if (channel && channel !== -1) {
        rasterImage = [rasterImage[channel]] as ReadRasterResult;
    }

    console.log(tif);

    if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
        //@ts-ignore
        editorStore.sentinels2l2a.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B2') {
            editorStore.referenceGeoTiff = tifImage;
        }

    } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
        //@ts-ignore
        editorStore.sentinels2l1c.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B2') {
            editorStore.referenceGeoTiff = tifImage;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {
        //@ts-ignore
        editorStore.landsat8toa.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B3') {
            editorStore.referenceGeoTiff = tifImage;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
        //@ts-ignore
        editorStore.landsat8sr.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B3') {
            editorStore.referenceGeoTiff = tifImage;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat5toa) {
        //@ts-ignore
        editorStore.landsat5toa.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B4') {
            editorStore.referenceGeoTiff = tifImage;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat5sr) {
        //@ts-ignore
        editorStore.landsat5sr.rawBands[bandName.toLowerCase()].raster = rasterImage[0] as Uint16Array;
        if (bandName === 'B4') {
            editorStore.referenceGeoTiff = tifImage;
        }
    }
}

async function loadBandByFile(bandName: string, uploadFile: File, channel?: number | undefined) {
    if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
        switch (bandName) {
            case 'B1':
                await loadTifByFileAndStore(uploadFile, 'B1')
                break;
            case 'B2':
                await loadTifByFileAndStore(uploadFile, 'B2')
                break;
            case 'B3':
                await loadTifByFileAndStore(uploadFile, 'B3')
                break;
            case 'B4':
                await loadTifByFileAndStore(uploadFile, 'B4')
                break;
            case 'B5':
                await loadTifByFileAndStore(uploadFile, 'B5')
                break;
            case 'B6':
                await loadTifByFileAndStore(uploadFile, 'B6')
                break;
            case 'B7':
                await loadTifByFileAndStore(uploadFile, 'B7')
                break;
            case 'B8':
                await loadTifByFileAndStore(uploadFile, 'B8')
                break;
            case 'B8A':
                await loadTifByFileAndStore(uploadFile, 'B8A')
                break;
            case 'B9':
                await loadTifByFileAndStore(uploadFile, 'B9')
                break;
            case 'B10':
                break;
            case 'B11':
                await loadTifByFileAndStore(uploadFile, 'B11')
                break;
            case 'B12':
                await loadTifByFileAndStore(uploadFile, 'B12')
                break;
            case 'B13':
                break;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
        switch (bandName) {
            case 'B1':
                await loadTifByFileAndStore(uploadFile, 'B1')
                break;
            case 'B2':
                await loadTifByFileAndStore(uploadFile, 'B2')
                break;
            case 'B3':
                await loadTifByFileAndStore(uploadFile, 'B3')
                break;
            case 'B4':
                await loadTifByFileAndStore(uploadFile, 'B4')
                break;
            case 'B5':
                await loadTifByFileAndStore(uploadFile, 'B5')
                break;
            case 'B6':
                await loadTifByFileAndStore(uploadFile, 'B6')
                break;
            case 'B7':
                await loadTifByFileAndStore(uploadFile, 'B7')
                break;
            case 'B8':
                await loadTifByFileAndStore(uploadFile, 'B8')
                break;
            case 'B8A':
                await loadTifByFileAndStore(uploadFile, 'B8A')
                break;
            case 'B9':
                await loadTifByFileAndStore(uploadFile, 'B9')
                break;
            case 'B10':
                await loadTifByFileAndStore(uploadFile, 'B10')
                break;
                break;
            case 'B11':
                await loadTifByFileAndStore(uploadFile, 'B11')
                break;
            case 'B12':
                await loadTifByFileAndStore(uploadFile, 'B12')
                break;
            case 'B13':
                break;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
        console.log('bname', bandName);
        switch (bandName) {
            case 'B1':
                await loadTifByFileAndStore(uploadFile, 'B1')
                break;
            case 'B2':
                await loadTifByFileAndStore(uploadFile, 'B2')
                break;
            case 'B3':
                await loadTifByFileAndStore(uploadFile, 'B3')
                break;
            case 'B4':
                await loadTifByFileAndStore(uploadFile, 'B4')
                break;
            case 'B5':
                await loadTifByFileAndStore(uploadFile, 'B5')
                break;
            case 'B6':
                await loadTifByFileAndStore(uploadFile, 'B6')
                break;
            case 'B7':
                await loadTifByFileAndStore(uploadFile, 'B7')
                break;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {
        switch (bandName) {
            case 'B1':
                await loadTifByFileAndStore(uploadFile, 'B1')
                break;
            case 'B2':
                await loadTifByFileAndStore(uploadFile, 'B2')
                break;
            case 'B3':
                await loadTifByFileAndStore(uploadFile, 'B3')
                break;
            case 'B4':
                await loadTifByFileAndStore(uploadFile, 'B4')
                break;
            case 'B5':
                await loadTifByFileAndStore(uploadFile, 'B5')
                break;
            case 'B6':
                await loadTifByFileAndStore(uploadFile, 'B6')
                break;
            case 'B7':
                await loadTifByFileAndStore(uploadFile, 'B7')
                break;
            case 'B8':
                await loadTifByFileAndStore(uploadFile, 'B8')
                break;
            case 'B9':
                await loadTifByFileAndStore(uploadFile, 'B9')
                break;
            case 'B10':
                await loadTifByFileAndStore(uploadFile, 'B10')
                break;
            case 'B11':
                await loadTifByFileAndStore(uploadFile, 'B11')
                break;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat5toa) {
        switch (bandName) {
            case 'B1':
                await loadTifByFileAndStore(uploadFile, 'B1')
                break;
            case 'B2':
                await loadTifByFileAndStore(uploadFile, 'B2')
                break;
            case 'B3':
                await loadTifByFileAndStore(uploadFile, 'B3')
                break;
            case 'B4':
                await loadTifByFileAndStore(uploadFile, 'B4')
                break;
            case 'B5':
                await loadTifByFileAndStore(uploadFile, 'B5')
                break;
            case 'B6':
                await loadTifByFileAndStore(uploadFile, 'B6')
                break;
            case 'B7':
                await loadTifByFileAndStore(uploadFile, 'B7')
                break;
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat5sr) {
        switch (bandName) {
            case 'B1':
                await loadTifByFileAndStore(uploadFile, 'B1')
                break;
            case 'B2':
                await loadTifByFileAndStore(uploadFile, 'B2')
                break;
            case 'B3':
                await loadTifByFileAndStore(uploadFile, 'B3')
                break;
            case 'B4':
                await loadTifByFileAndStore(uploadFile, 'B4')
                break;
            case 'B5':
                await loadTifByFileAndStore(uploadFile, 'B5')
                break;
            case 'B7':
                await loadTifByFileAndStore(uploadFile, 'B7')
                break;
        }
    }
}

async function loadBandByUrl(bandName: string) {
    switch (bandName) {
        case 'B1':
            await loadTifByUrlAndStore('B1.tif', 'B1')
            break;
        case 'B2':
            await loadTifByUrlAndStore('b.tif', 'B2')
            break;
        case 'B3':
            await loadTifByUrlAndStore('g.tif', 'B3')
            break;
        case 'B4':
            await loadTifByUrlAndStore('r.tif', 'B4')
            break;
        case 'B5':
            await loadTifByUrlAndStore('B5.tif', 'B5')
            break;
        case 'B6':
            await loadTifByUrlAndStore('B6.tif', 'B6')
            break;
        case 'B7':
            await loadTifByUrlAndStore('B7.tif', 'B7')
            break;
        case 'B8':
            await loadTifByUrlAndStore('B8.tif', 'B8')
            break;
        case 'B8A':
            await loadTifByUrlAndStore('B8A.tif', 'B8A')
            break;
        case 'B9':
            await loadTifByUrlAndStore('B9.tif', 'B9')
            break;
        case 'B10':
            break;
        case 'B11':
            await loadTifByUrlAndStore('B11.tif', 'B11')
            break;
        case 'B12':
            await loadTifByUrlAndStore('B12.tif', 'B12')
            break;
        case 'B13':
            break;
    }
}

interface Coordinate {
    x: number;
    y: number;
}

interface GeoKeys {
    ProjectedCSTypeGeoKey?: number;
}

async function getCornerCoordinates(tiff: GeoTIFF): Promise<[number, number][]> {
    // Load the GeoTIFF
    const image = await tiff.getImage();

    // Get GeoTIFF metadata
    const bbox = image.getBoundingBox(); // [minX, minY, maxX, maxY]
    const geoKeys: GeoKeys = image.getGeoKeys();

    // Check the projection (CRS)
    const sourceCRS = geoKeys.ProjectedCSTypeGeoKey
        ? `EPSG:${geoKeys.ProjectedCSTypeGeoKey}`
        : 'EPSG:4326'; // Default to WGS84 if no projection is defined

    // Define corner coordinates in image space
    const corners: Coordinate[] = [
        { x: bbox[0], y: bbox[3] }, // Top-left
        { x: bbox[2], y: bbox[3] }, // Top-right
        { x: bbox[0], y: bbox[1] }, // Bottom-left
        { x: bbox[2], y: bbox[1] }, // Bottom-right
    ];

    // Transform to geographic coordinates (WGS84)
    const wgs84Corners = corners.map((corner) => {
        const [lon, lat] = proj4(sourceCRS, 'EPSG:4326', [corner.x, corner.y]);
        return [lon, lat] as [number, number];
    });

    return wgs84Corners;
}

watch(() => navStore.currentLinkIndex, () => {
    editorStore.resetStore();
    loadEditor();
});

async function loadEditor() {


    if (document) {
        document.querySelectorAll('[id^="permanent_legend"]')?.forEach((element) => {
            element.remove();
        });
        document.querySelectorAll('[id^="legend___"]')?.forEach((element) => {
            element.remove();
        });
    }

    await settingStore.loadSettings();
    HotkeyHandler.getInstance();

    let otherLayers: string[] = [];
    let folderIndex = 0;
    let folderName = '';
    let currentFolderName = '';
    let linkList: string[] = []
    // uploadStore.selectedSatellite = 'sentinel-2';
    if (!_.has(route.query, 'example')) {

        for (let i = 0; i < uploadStore.uploadedFiles.length; i++) {

            let currentUploadFileName = uploadStore.uploadedFiles[i].webkitRelativePath.split('/')[2];

            if (folderName === '') {
                folderName = uploadStore.uploadedFiles[i].webkitRelativePath.split('/')[1];
                linkList.push(folderName);
            } else {
                if (folderName !== uploadStore.uploadedFiles[i].webkitRelativePath.split('/')[1]) {
                    folderIndex++;
                    folderName = uploadStore.uploadedFiles[i].webkitRelativePath.split('/')[1];
                    linkList.push(folderName);
                }
            }

            if (folderIndex === navStore.currentLinkIndex) {
                currentFolderName = folderName;
                if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
                    let found = false;
                    for (const [key, value] of Object.entries(uploadStore.sentinels2aAssignment)) {
                        let cleanedValue = value;
                        if (value.startsWith('[Channel')) {
                            cleanedValue = value.split('] ')[1];
                        }
                        if (cleanedValue === currentUploadFileName) {
                            await loadBandByFile(key.replace('Band ', 'B').toUpperCase(), uploadStore.uploadedFiles[i]);
                            found = true;
                        }
                    }
                    if (!found && isLayerFile(currentUploadFileName)) {
                        otherLayers.push(uploadStore.uploadedFiles[i].name);
                    }
                } else if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {
                    let found = false;
                    for (const [key, value] of Object.entries(uploadStore.landsat8toaAssignment)) {
                        if (value === currentUploadFileName) {
                            await loadBandByFile(key.replace('Band ', 'B').toUpperCase(), uploadStore.uploadedFiles[i]);
                            found = true;
                        }
                    }
                    if (!found && isLayerFile(currentUploadFileName)) {
                        otherLayers.push(uploadStore.uploadedFiles[i].name);
                    }
                } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
                    let found = false;
                    for (const [key, value] of Object.entries(uploadStore.sentinels2cAssignment)) {
                        if (value === currentUploadFileName) {
                            await loadBandByFile(key.replace('Band ', 'B').toUpperCase(), uploadStore.uploadedFiles[i]);
                            found = true;
                        }
                    }
                    if (!found && isLayerFile(currentUploadFileName)) {
                        otherLayers.push(uploadStore.uploadedFiles[i].name);
                    }
                } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
                    let found = false;
                    for (const [key, value] of Object.entries(uploadStore.landsat8srAssignment)) {
                        if (value === currentUploadFileName) {
                            await loadBandByFile(key.replace('Band ', 'B').toUpperCase(), uploadStore.uploadedFiles[i]);
                            found = true;
                        }
                    }
                    if (!found && isLayerFile(currentUploadFileName)) {
                        otherLayers.push(uploadStore.uploadedFiles[i].name);
                    }
                } else if (uploadStore.selectedSatellite === SatelliteType.landsat5toa) {
                    let found = false;
                    for (const [key, value] of Object.entries(uploadStore.landsat5toaAssignment)) {
                        if (value === currentUploadFileName) {
                            await loadBandByFile(key.replace('Band ', 'B').toUpperCase(), uploadStore.uploadedFiles[i]);
                            found = true;
                        }
                    }
                    if (!found && isLayerFile(currentUploadFileName)) {
                        otherLayers.push(uploadStore.uploadedFiles[i].name);
                    }
                } else if (uploadStore.selectedSatellite === SatelliteType.landsat5sr) {
                    let found = false;
                    for (const [key, value] of Object.entries(uploadStore.landsat5srAssignment)) {
                        if (value === currentUploadFileName) {
                            await loadBandByFile(key.replace('Band ', 'B').toUpperCase(), uploadStore.uploadedFiles[i]);
                            found = true;
                        }
                    }
                    if (!found && isLayerFile(currentUploadFileName)) {
                        otherLayers.push(uploadStore.uploadedFiles[i].name);
                    }
                }
            }
        }

        navStore.links = linkList;
    } else {
        await loadBandByUrl('B1');
        await loadBandByUrl('B2');
        await loadBandByUrl('B3');
        await loadBandByUrl('B4');
        await loadBandByUrl('B5');
        await loadBandByUrl('B6');
        await loadBandByUrl('B7');
        await loadBandByUrl('B8');
        await loadBandByUrl('B8A');
        await loadBandByUrl('B9');
        await loadBandByUrl('B11');
        await loadBandByUrl('B12');
    }

    if (editorStore.referenceGeoTiff) {
        getCornerCoordinates(editorStore.referenceGeoTiff).then((corners) => {
            if (corners.length === 4) {
                editorStore.cornerCoordinates = corners.map(([x, y]) => ({ x, y })) as [{ x: number; y: number; }, { x: number; y: number; }, { x: number; y: number; }, { x: number; y: number; }];
            } else {
                throw new Error("Expected 4 corner coordinates.");
            }
        });
    }

    bilinearInterpolate()


    let w = 0;
    let h = 0;
    switch (uploadStore.selectedSatellite) {
        case SatelliteType.sentinels2l2a:
            w = Math.sqrt(editorStore.sentinels2l2a.rawBands.b4.raster.length);
            h = Math.sqrt(editorStore.sentinels2l2a.rawBands.b4.raster.length);
            break;
        case SatelliteType.sentinels2l1c:
            w = Math.sqrt(editorStore.sentinels2l1c.rawBands.b4.raster.length);
            h = Math.sqrt(editorStore.sentinels2l1c.rawBands.b4.raster.length);
            break;
        case SatelliteType.landsat8toa:
            w = Math.sqrt(editorStore.landsat8toa.rawBands.b4.raster.length);
            h = Math.sqrt(editorStore.landsat8toa.rawBands.b4.raster.length);
            break;
        case SatelliteType.landsat8sr:
            w = Math.sqrt(editorStore.landsat8sr.rawBands.b4.raster.length);
            h = Math.sqrt(editorStore.landsat8sr.rawBands.b4.raster.length);
            break;
        case SatelliteType.landsat5toa:
            w = Math.sqrt(editorStore.landsat5toa.rawBands.b4.raster.length);
            h = Math.sqrt(editorStore.landsat5toa.rawBands.b4.raster.length);
            break;
        case SatelliteType.landsat5sr:
            w = Math.sqrt(editorStore.landsat5sr.rawBands.b4.raster.length);
            h = Math.sqrt(editorStore.landsat5sr.rawBands.b4.raster.length);
    }

    console.log(w, h);

    editorStore.width = w;
    editorStore.height = h;

    document.getElementById('labelContainer')!.style.width = w + 'px';
    document.getElementById('labelContainer')!.style.height = h + 'px';
    document.getElementById('panContainer')!.style.width = w + 'px';
    document.getElementById('panContainer')!.style.height = h + 'px';

    let sourceCanvas = editorStore.displaySourceImage(w, h, uploadStore.selectedSatellite);
    editorStore.addLayer('Source Image', sourceCanvas);


    otherLayers.forEach(otherLayer => {

        try {
            let found = editorStore.optionalLayers.find(layer => layer.name === otherLayer);
            if (found) {
                if (found.isLayer === false) {
                    editorStore.addLegend(found, uploadStore.uploadedFiles.find(file => {
                        let a = file.webkitRelativePath.split('/')[1] === currentFolderName && file.name === otherLayer;
                        return a;
                    })!);
                } else {
                    editorStore.addImageLayer(otherLayer, w, h, uploadStore.uploadedFiles.find(file => { return file.webkitRelativePath.split('/')[1] === currentFolderName && file.name === otherLayer })!);
                }
            }

        } catch (error: any) {
            console.error(error);
        }
    })

    // uploadStore.uploadedFiles.forEach((file: File) => {
    //     try {
    //         editorStore.addImageLayer(file.name, w, h, file);
    //     } catch (e) {
    //         console.error(e);
    //     }
    // })

    editorStore.addDrawingLayer('Drawing Layer 1', w, h);
    editorStore.selectLayer('Drawing Layer 1');

    // load remaining layers
    switch (uploadStore.selectedSatellite) {
        case SatelliteType.sentinels2l2a:
            if (uploadStore.useNdvi) {
                loadNDVI(editorStore, SatelliteType.sentinels2l2a);
            }
            if (uploadStore.useAgriculture) {
                loadAgriculture(editorStore, SatelliteType.sentinels2l2a);
            }
            if (uploadStore.useNdwi) {
                loadNDWI(editorStore, SatelliteType.sentinels2l2a);
            }
            break;
        case SatelliteType.sentinels2l1c:
            if (uploadStore.useNdvi) {
                loadNDVI(editorStore, SatelliteType.sentinels2l1c);
            }
            if (uploadStore.useAgriculture) {
                loadAgriculture(editorStore, SatelliteType.sentinels2l1c);
            }
            if (uploadStore.useNdwi) {
                loadNDWI(editorStore, SatelliteType.sentinels2l1c);
            }
            break;
        case SatelliteType.landsat8toa:
            if (uploadStore.useNdvi) {
                loadNDVI(editorStore, SatelliteType.landsat8toa);
            }
            if (uploadStore.useAgriculture) {
                loadAgriculture(editorStore, SatelliteType.landsat8toa);
            }
            if (uploadStore.useNdwi) {
                loadNDWI(editorStore, SatelliteType.landsat8toa);
            }
            break;
        case SatelliteType.landsat8sr:
            if (uploadStore.useNdvi) {
                loadNDVI(editorStore, SatelliteType.landsat8sr);
            }
            if (uploadStore.useAgriculture) {
                loadAgriculture(editorStore, SatelliteType.landsat8sr);
            }
            if (uploadStore.useNdwi) {
                loadNDWI(editorStore, SatelliteType.landsat8sr);
            }
            break;
        case SatelliteType.landsat5toa:
            if (uploadStore.useNdvi) {
                loadNDVI(editorStore, SatelliteType.landsat5toa);
            }
            if (uploadStore.useAgriculture) {
                loadAgriculture(editorStore, SatelliteType.landsat5toa);
            }
            if (uploadStore.useNdwi) {
                loadNDWI(editorStore, SatelliteType.landsat5toa);
            }
            break;
        case SatelliteType.landsat5sr:
            if (uploadStore.useNdvi) {
                loadNDVI(editorStore, SatelliteType.landsat5sr);
            }
            if (uploadStore.useAgriculture) {
                loadAgriculture(editorStore, SatelliteType.landsat5sr);
            }
            if (uploadStore.useNdwi) {
                loadNDWI(editorStore, SatelliteType.landsat5sr);
            }
            break;
    }
}


onMounted(async () => {
    loadEditor();
});

// const kmeansMenuOpen = ref(false);


</script>


<style>
/* Add Tailwind-based transition animation */
.fade-slide-enter-active,
.fade-slide-leave-active {
    @apply transition duration-300 ease-out;
}

.fade-slide-enter-from {
    @apply opacity-0 scale-95;
}

.fade-slide-enter-to {
    @apply opacity-100 scale-100;
}

.fade-slide-leave-from {
    @apply opacity-100 scale-100;
}

.fade-slide-leave-to {
    @apply opacity-0 scale-95;
}

#labelContainer.cursor-draw {
    cursor: url('@/assets/cursors/draw-pen.svg'), auto;
}

#labelContainer.cursor-move {
    cursor: move;
}

#labelContainer.cursor-ab {
    cursor: url('@/assets/cursors/ab-testing.svg'), auto;
}

#labelContainer.cursor-bucket {
    cursor: url('@/assets/cursors/format-color-fill.svg'), auto;
}

#labelContainer.cursor-wand {
    cursor: url('@/assets/cursors/auto-fix.svg'), auto;
}

#labelContainer.cursor-delete {
    cursor: url('@/assets/cursors/eraser.svg'), auto;
}
</style>