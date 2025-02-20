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

import { defineStore } from "pinia";
import { NormType, SatelliteType, type EditorStore, type EditorStoreActions, type EditorStoreGetters } from "@/types";
import { normalize } from "~/utils/canvasHandlers/normalizeHandler";
import { CursorShadowHandler } from "~/utils/canvasHandlers/cursorShadowHandler";
import { toggleCursor } from "~/utils";
import GeoTIFF, { fromArrayBuffer, GeoTIFFImage, type ReadRasterResult, type TypedArray } from "geotiff";
import Panzoom from "@panzoom/panzoom";

export const normalizations: NormType[] = [
    NormType["1and99percentile"],
    NormType["5and95percentile"],
    NormType.minmax,
    NormType.histogram
];


export const useEditorStore = defineStore<'editorStore', EditorStore, EditorStoreGetters, EditorStoreActions>('editorStore', {
    state: () => ({
        mapViewActive: false,
        mapIsActive: false,
        redrawMap: 0,
        redrawOverlay: 0,
        currentLayer: 'rgb199' as 'rgb199' | 'ndvi' | 'ndwi' | 'agriculture',
        layerNameToCanvas: new Map<string, HTMLCanvasElement>(),
        layerNameDisplayOrder: [],
        drawingLayerNameDisplayOrder: [],
        currentNormalization: NormType["1and99percentile"],
        referenceGeoTiff: null as null | GeoTIFF,
        cornerCoordinates: [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 }
        ],
        showHotkeys: true,
        width: 0,
        height: 0,
        classicView: {
            mapOpen: false
        },
        panMoveActive: true,
        drawingActive: false,
        eraserActive: false,
        drawingLayers: [
            // { title: 'Drawing Layer 1', selected: true },
        ],
        otherLayers: [
            // { title: 'Source Image', selected: false },
        ],
        optionalLayers: [],
        plainDrawer: {
            drawLayer: 'Drawing Layer 1',
            active: false
        },
        bucketFillTolerance: 80,
        wand: {
            drawLayer: 'Drawing Layer 1',
            active: false,
            menuOpen: false,
            overwriteClass: ''
        },
        eraser: {
            drawLayer: 'Drawing Layer 1',
            active: false
        },
        bucket: {
            drawLayer: 'Drawing Layer 1',
            active: false
        },
        gapDrawer: {
            drawLayer: 'Drawing Layer 1',
            active: false
        },
        magneticDrawer: {
            drawLayer: 'Drawing Layer 1',
            active: false
        },
        lastXY: { x: 0, y: 0 },
        mouseIsDown: false,
        penSize: 10,
        selectedDrawingLayer: 'Drawing Layer 1',
        selectedOtherLayer: 'Source Image',
        kmeansLoading: false,
        layerNameDrawerSettings: new Map<string, {}>() as Map<string, {
            opacity: number,
            visible: boolean,
            discretizable: boolean,
            discreteActive: boolean,
            discreteMenuOpen: boolean,
            kmeansMenuOpen: boolean,
            kmeansClustered: boolean,
            isLayer: boolean,
            legendDisplayAlways: boolean,
            legendForLayer: string
        }>,
        selectedClass: 0,
        hoverColor: '#000000',
        sentinels2l2a: {
            rawBands: {
                b1: {
                    raster: new Uint16Array()
                },
                b2: {
                    raster: new Uint16Array()
                },
                b3: {
                    raster: new Uint16Array()
                },
                b4: {
                    raster: new Uint16Array()
                },
                b5: {
                    raster: new Uint16Array()
                },
                b6: {
                    raster: new Uint16Array()
                },
                b7: {
                    raster: new Uint16Array()
                },
                b8: {
                    raster: new Uint16Array()
                },
                b8a: {
                    raster: new Uint16Array()
                },
                b9: {
                    raster: new Uint16Array()
                },
                b11: {
                    raster: new Uint16Array()
                },
                b12: {
                    raster: new Uint16Array()
                },
            }
        },
        landsat8toa: {
            rawBands: {
                b1: {
                    raster: new Uint16Array()
                },
                b2: {
                    raster: new Uint16Array()
                },
                b3: {
                    raster: new Uint16Array()
                },
                b4: {
                    raster: new Uint16Array()
                },
                b5: {
                    raster: new Uint16Array()
                },
                b6: {
                    raster: new Uint16Array()
                },
                b7: {
                    raster: new Uint16Array()
                },
                b8: {
                    raster: new Uint16Array()
                },
                b9: {
                    raster: new Uint16Array()
                },
                b10: {
                    raster: new Uint16Array()
                },
                b11: {
                    raster: new Uint16Array()
                }
            }
        },
        sentinels2l1c: {
            rawBands: {
                b1: {
                    raster: new Uint16Array()
                },
                b2: {
                    raster: new Uint16Array()
                },
                b3: {
                    raster: new Uint16Array()
                },
                b4: {
                    raster: new Uint16Array()
                },
                b5: {
                    raster: new Uint16Array()
                },
                b6: {
                    raster: new Uint16Array()
                },
                b7: {
                    raster: new Uint16Array()
                },
                b8: {
                    raster: new Uint16Array()
                },
                b8a: {
                    raster: new Uint16Array()
                },
                b9: {
                    raster: new Uint16Array()
                },
                b10: {
                    raster: new Uint16Array()
                },
                b11: {
                    raster: new Uint16Array()
                },
                b12: {
                    raster: new Uint16Array()
                },
            }
        },
        landsat8sr: {
            rawBands: {
                b1: {
                    raster: new Uint16Array()
                },
                b2: {
                    raster: new Uint16Array()
                },
                b3: {
                    raster: new Uint16Array()
                },
                b4: {
                    raster: new Uint16Array()
                },
                b5: {
                    raster: new Uint16Array()
                },
                b6: {
                    raster: new Uint16Array()
                },
                b7: {
                    raster: new Uint16Array()
                }
            }
        }
    }),
    getters: {
        // Define your getters here

    },
    actions: {
        closeAllMenus() {
            this.drawingActive = false;
            this.eraser.active = false;
            this.panMoveActive = false;
            this.bucket.active = false;
            this.wand.active = false;
            this.wand.menuOpen = false;
            this.gapDrawer.active = false;
            this.magneticDrawer.active = false;
        },
        toggleNormalization(satelliteType: SatelliteType) {
            this.currentNormalization = normalizations[(normalizations.indexOf(this.currentNormalization) + 1) % normalizations.length];
            //todo
            switch (satelliteType) {
                case SatelliteType.sentinels2l2a:
                    normalize(this, this.currentNormalization, SatelliteType.sentinels2l2a);
                    break
                case SatelliteType.landsat8toa:
                    normalize(this, this.currentNormalization, SatelliteType.landsat8toa);
                    break
                case SatelliteType.sentinels2l1c:
                    normalize(this, this.currentNormalization, SatelliteType.sentinels2l1c);
                    break
                case SatelliteType.landsat8sr:
                    normalize(this, this.currentNormalization, SatelliteType.landsat8sr);
                    break
            }
        },
        addLayer(layerName: string, canvas: HTMLCanvasElement, discretizable: boolean = false) {
            this.layerNameToCanvas.set(layerName, canvas);
            this.layerNameDrawerSettings.set(layerName, { opacity: 100, visible: true, discretizable, discreteActive: false, discreteMenuOpen: false, kmeansMenuOpen: false, kmeansClustered: false, isLayer: true, legendDisplayAlways: false, legendForLayer: '' });
            if (layerName.startsWith('Drawing Layer')) {
                this.drawingLayerNameDisplayOrder.push(layerName);
                // this.drawingLayers.forEach(layer => {
                //     layer.selected = false;
                // });
                // this.drawingLayers.push({ title: layerName, selected: false });
                // this.selectLayer(layerName, false);
            } else {
                this.layerNameDisplayOrder.push(layerName);
                this.otherLayers.push({ title: layerName, selected: false });
            }
        },
        selectLayer(layerName: string, closeMenus: boolean = true) {

            if (layerName.startsWith('Drawing Layer')) {
                this.selectedDrawingLayer = layerName;
            } else {
                this.selectedOtherLayer = layerName;
            }

            if (!layerName.startsWith('Drawing Layer') && closeMenus) {
                this.closeAllMenus();
                this.drawingActive = false;
                this.panMoveActive = true;
            }

            if (layerName.startsWith('Drawing Layer')) {
                ActionEventHandler.getInstance().updateMouseListeners();
            } else {
                this.otherLayers.forEach(layer => {
                    layer.selected = layer.title === layerName;
                });
                if (document) {
                    document.querySelectorAll('[id^="legend___"]').forEach((element) => {
                        (element as HTMLElement).style.display = 'none';
                    });
                    this.optionalLayers.forEach((legend) => {
                        if (legend.isLayer === false && legend.legendToLayer === layerName) {
                            let legendElement = document.getElementById('legend___' + legend.name);
                            if (legendElement) {
                                legendElement.style.display = 'block';
                            }
                        }
                    })
                }
            }

            LayersHandler.getInstance().orderLayers(layerName);

        },
        displaySourceImage(width: number, height: number, satelliteType: SatelliteType) {
            let sourceImageCanvas = document.getElementById('Source Image') as HTMLCanvasElement;
            if (!sourceImageCanvas) {
                sourceImageCanvas = document.createElement('canvas');
                sourceImageCanvas.width = width;
                sourceImageCanvas.height = height;
                sourceImageCanvas.style.imageRendering = 'pixelated';
                sourceImageCanvas.style.position = 'absolute';
                sourceImageCanvas.style.top = '0';
                sourceImageCanvas.style.left = '0';
                sourceImageCanvas.id = 'Source Image';
            }
            let ctx = sourceImageCanvas.getContext('2d');
            if (ctx) {
                switch (satelliteType) {
                    case SatelliteType.sentinels2l2a:
                        ctx.putImageData(normalizeBy1And99Percentile([this.sentinels2l2a.rawBands.b4.raster, this.sentinels2l2a.rawBands.b3.raster, this.sentinels2l2a.rawBands.b2.raster], width, height), 0, 0);
                        break;
                    case SatelliteType.sentinels2l1c:
                        ctx.putImageData(normalizeBy1And99Percentile([this.sentinels2l1c.rawBands.b4.raster, this.sentinels2l1c.rawBands.b3.raster, this.sentinels2l1c.rawBands.b2.raster], width, height), 0, 0);
                        break;
                    case SatelliteType.landsat8toa:
                        ctx.putImageData(normalizeBy1And99Percentile([this.landsat8toa.rawBands.b4.raster, this.landsat8toa.rawBands.b3.raster, this.landsat8toa.rawBands.b2.raster], width, height), 0, 0);
                        break
                    case SatelliteType.landsat8sr:
                        ctx.putImageData(normalizeBy1And99Percentile([this.landsat8sr.rawBands.b4.raster, this.landsat8sr.rawBands.b3.raster, this.landsat8sr.rawBands.b2.raster], width, height), 0, 0);
                        break
                }
                ctx!.imageSmoothingEnabled = false;
            }
            return sourceImageCanvas;
        },
        async addLegend(
            legend: {
                name: string;
                isLayer: boolean;
                displayAlways: boolean;
                legendToLayer: string;
            },
            file: File
        ) {
            const labelContainer = document.getElementById('classicViewContainer');
            if (!labelContainer) {
                console.error('Element with ID "labelContainer" not found.');
                return;
            }

            const legendCanvas = document.createElement('canvas');
            legendCanvas.style.position = 'absolute';
            legendCanvas.style.top = '0';
            legendCanvas.style.right = '0';
            legendCanvas.width = 200;
            legendCanvas.height = 200;
            legendCanvas.id = legend.displayAlways ? 'permanent_legend___' + legend.name : 'legend___' + legend.name;
            if (!legend.displayAlways) {
                legendCanvas.style.display = 'none';
            }

            const ctx = legendCanvas.getContext('2d');
            if (!ctx) {
                console.error('Failed to get 2D context.');
                return;
            }

            labelContainer.appendChild(legendCanvas);

            const pz = Panzoom(legendCanvas, {
                maxScale: 20,
                minScale: 0.1,
                bounds: false,
                boundsPadding: 0
            });
            document.getElementById(legendCanvas.id)!.addEventListener('wheel', pz.zoomWithWheel);

            if (file.name.endsWith('.tif') || file.name.endsWith('.tiff')) {
                try {
                    const tifImage = await fromArrayBuffer(await file.arrayBuffer());
                    const image: GeoTIFFImage = await tifImage.getImage();
                    const rasterImage = await image.readRasters({ interleave: true }); // Get interleaved data for easier RGBA mapping

                    const width = image.getWidth();
                    const height = image.getHeight();
                    console.log('Width:', width, 'Height:', height);

                    // Update canvas size to match the GeoTIFF dimensions
                    legendCanvas.width = Math.max(width, 200);
                    legendCanvas.height = Math.floor((legendCanvas.width / width) * height);

                    // Create an ImageData object
                    const imageData = ctx.createImageData(width, height);

                    // Map the raster data to the ImageData object (assume grayscale or single-band data)
                    for (let i = 0; i < rasterImage.length; i++) {
                        const pixelValue = Number(rasterImage[i]); // Pixel value from the raster
                        const mappedValue = (pixelValue / 255) * 255; // Normalize to 0-255
                        imageData.data[i * 4] = mappedValue; // Red channel
                        imageData.data[i * 4 + 1] = mappedValue; // Green channel
                        imageData.data[i * 4 + 2] = mappedValue; // Blue channel
                        imageData.data[i * 4 + 3] = 255; // Alpha channel
                    }

                    // Draw the ImageData onto the canvas
                    ctx.putImageData(imageData, 0, 0);
                } catch (error) {
                    console.error('Failed to process GeoTIFF file:', error);
                }
            } else {
                const img = new Image();
                img.onload = () => {
                    console.log(img.width);
                    console.log(img.height);
                    const ratio = img.width / img.height;
                    legendCanvas.width = Math.max(img.width, 200);
                    legendCanvas.height = Math.floor(legendCanvas.width / ratio);
                    ctx.drawImage(img, 0, 0, legendCanvas.width, legendCanvas.height);
                    URL.revokeObjectURL(img.src);
                };
                img.src = URL.createObjectURL(file);
            }
        },
        addImageLayer(layerName: string, width: number, height: number, imageFile: File) {
            let imageLayerCanvas = document.createElement('canvas');
            imageLayerCanvas.width = width;
            imageLayerCanvas.height = height;
            imageLayerCanvas.style.position = 'absolute';
            imageLayerCanvas.style.top = '0';
            imageLayerCanvas.style.left = '0';
            imageLayerCanvas.style.imageRendering = 'pixelated';
            imageLayerCanvas.id = layerName;
            document.getElementById('layers')!.appendChild(imageLayerCanvas);
            let ctx = imageLayerCanvas.getContext('2d');
            let img = new Image();
            console.log(width);
            console.log(imageFile);
            img.src = URL.createObjectURL(imageFile);
            img.onload = () => {
                ctx!.drawImage(img, 0, 0, width, height);
                document.getElementById('layers')!.appendChild(imageLayerCanvas);
                this.addLayer(layerName, imageLayerCanvas);
            };
        },
        addDrawingLayer(layerName: string, width: number, height: number) {
            let drawingCanvas = document.createElement('canvas');
            drawingCanvas.id = layerName;
            drawingCanvas.width = width;
            drawingCanvas.height = height;
            drawingCanvas.style.position = 'absolute';
            drawingCanvas.style.top = '0';
            drawingCanvas.style.left = '0';
            drawingCanvas.style.imageRendering = 'pixelated';
            document.getElementById('layers')!.appendChild(drawingCanvas);
            this.addLayer(layerName, drawingCanvas);
            this.selectLayer(layerName, false);
        },
        resetStore() {
            this.layerNameToCanvas = new Map<string, HTMLCanvasElement>();
            this.layerNameDisplayOrder = [];
            this.drawingLayerNameDisplayOrder = [];
            this.currentNormalization = NormType["1and99percentile"];
            this.referenceGeoTiff = null;
            this.cornerCoordinates = [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
                { x: 0, y: 0 },
                { x: 0, y: 0 }
            ];
            this.showHotkeys = true;
            this.width = 0;
            this.height = 0;
            this.classicView = {
                mapOpen: false
            };
            this.panMoveActive = true;
            this.drawingActive = false;
            this.eraserActive = false;
            this.drawingLayers = [];
            this.otherLayers = [];
            this.plainDrawer = {
                drawLayer: 'Drawing Layer 1',
                active: false
            };
            this.bucketFillTolerance = 80;
            this.wand = {
                drawLayer: 'Drawing Layer 1',
                active: false,
                menuOpen: false,
                overwriteClass: ''
            };
            this.eraser = {
                drawLayer: 'Drawing Layer 1',
                active: false
            };
            this.bucket = {
                drawLayer: 'Drawing Layer 1',
                active: false
            };
            this.gapDrawer = {
                drawLayer: 'Drawing Layer 1',
                active: false
            };
            this.magneticDrawer = {
                drawLayer: 'Drawing Layer 1',
                active: false
            };
            this.lastXY = { x: 0, y: 0 };
            this.mouseIsDown = false;
            this.penSize = 10;
            this.selectedDrawingLayer = 'Drawing Layer 1';
            this.selectedOtherLayer = 'Source Image';
            this.kmeansLoading = false;
            this.layerNameDrawerSettings = new Map<string, {
                opacity: number,
                visible: boolean,
                discretizable: boolean,
                discreteActive: boolean,
                discreteMenuOpen: boolean,
                kmeansMenuOpen: false,
                kmeansClustered: false,
                isLayer: true,
                legendDisplayAlways: false,
                legendForLayer: ''
            }>();
        },
        reactivateTool() {
            // this.closeAllMenus();
            // if (this.drawingActive) {
            //     this.activateTool('plainDrawer');
            // } else if (this.eraser.active) {
            //     this.activateTool('eraser');
            // } else if (this.panMoveActive) {
            //     this.activateTool('pan');
            // } else if (this.bucket.active) {
            //     this.activateTool('bucket');
            // } else if (this.wand.active) {
            //     this.activateTool('wand');
            // } else if (this.gapDrawer.active) {
            //     this.activateTool('gapDrawer');
            // } else if (this.magneticDrawer.active) {
            //     this.activateTool('magneticDrawer');
            // }
        },
        activateTool(tool: string) {

            this.wand.overwriteClass = '';

            switch (tool) {
                case 'pan':
                    this.closeAllMenus();
                    this.panMoveActive = true;
                    toggleCursor('move');
                    break;
                case 'gapDrawer':
                    this.closeAllMenus();

                    this.gapDrawer.active = true;
                    // if (!this.selectedLayer.startsWith('Drawing Layer')) {
                    //     this.selectLayer('Drawing Layer 1');
                    // }
                    this.gapDrawer.drawLayer = this.selectedDrawingLayer;
                    toggleCursor('ab');
                    break;
                case 'wand':
                    this.closeAllMenus();
                    this.wand.menuOpen = true;
                    toggleCursor('wand');
                    CursorShadowHandler.getInstance().updateCursorShadow();
                    break;
                case 'bucket':
                    this.closeAllMenus();
                    this.bucket.active = true;
                    // if (!this.selectedLayer.startsWith('Drawing Layer')) {
                    //     this.selectLayer('Drawing Layer 1');
                    // }
                    toggleCursor('bucket');
                    this.bucket.drawLayer = this.selectedDrawingLayer;
                    break;
                case 'plainDrawer':
                    this.closeAllMenus();
                    this.drawingActive = true;
                    // if (!this.selectedLayer.startsWith('Drawing Layer')) {
                    //     this.selectLayer('Drawing Layer 1');
                    // }
                    toggleCursor('draw');
                    break;
                case 'magneticDrawer':
                    this.closeAllMenus();
                    this.magneticDrawer.active = true;
                    // if (!this.selectedLayer.startsWith('Drawing Layer')) {
                    //     this.selectLayer('Drawing Layer 1');
                    // }
                    this.magneticDrawer.drawLayer = this.selectedDrawingLayer;
                    toggleCursor('draw');
                    break;
                case 'eraser':
                    this.closeAllMenus();
                    this.eraser.active = true;
                    // if (!this.selectedLayer.startsWith('Drawing Layer')) {
                    //     this.selectLayer('Drawing Layer 1');
                    // }
                    toggleCursor('delete');
                    break;
                case 'map':
                    this.closeAllMenus();
                    this.mapIsActive = !this.mapIsActive;
                    if (!this.mapIsActive) {
                        this.panMoveActive = true
                    }
                    break;
            }
            ActionEventHandler.getInstance().updateMouseListeners();
        }
    }
});