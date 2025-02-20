import type GeoTIFF from "geotiff";

export interface EditorStore {
    mapViewActive: boolean,
    mapIsActive: boolean,
    redrawMap: number,
    redrawOverlay: number,
    currentLayer: 'rgb199' | 'ndvi' | 'ndwi' | 'agriculture',
    layerNameToCanvas: Map<string, HTMLCanvasElement>,
    layerNameDisplayOrder: string[];
    drawingLayerNameDisplayOrder: string[];
    panMoveActive: boolean;
    drawingActive: boolean;
    eraserActive: boolean;
    currentNormalization: NormType;
    lastXY: { x: number, y: number };
    showHotkeys: boolean;
    hoverColor: string;
    referenceGeoTiff: null | GeoTIFF;
    cornerCoordinates: [
        { x: number, y: number },
        { x: number, y: number },
        { x: number, y: number },
        { x: number, y: number }
    ]
    classicView: {
        mapOpen: boolean;
    }
    drawingLayers: { title: string, selected: boolean }[];
    otherLayers: { title: string, selected: boolean }[];
    optionalLayers: {
        name: string;
        isLayer: boolean;
        displayAlways: boolean;
        legendToLayer: string;
    }[],
    plainDrawer: {
        drawLayer: string;
        active: boolean;
    }
    bucketFillTolerance: number;
    wand: {
        drawLayer: string;
        active: boolean;
        menuOpen: boolean;
        overwriteClass: string;
    };
    eraser: {
        drawLayer: string;
        active: boolean;
    }
    bucket: {
        drawLayer: string;
        active: boolean;
    }
    gapDrawer: {
        drawLayer: string;
        active: boolean;
    }
    magneticDrawer: {
        drawLayer: string;
        active: boolean;
    }
    penSize: number;
    selectedOtherLayer: string;
    selectedDrawingLayer: string;
    mouseIsDown: boolean;
    kmeansLoading: boolean;
    layerNameDrawerSettings: Map<string, {
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
    }>;
    width: number;
    height: number;
    selectedClass: number;
    sentinels2l2a: {
        rawBands: {
            b1: {
                raster: Uint16Array
            },
            b2: {
                raster: Uint16Array
            },
            b3: {
                raster: Uint16Array
            },
            b4: {
                raster: Uint16Array
            },
            b5: {
                raster: Uint16Array
            },
            b6: {
                raster: Uint16Array
            },
            b7: {
                raster: Uint16Array
            },
            b8: {
                raster: Uint16Array
            },
            b8a: {
                raster: Uint16Array
            },
            b9: {
                raster: Uint16Array
            },
            b11: {
                raster: Uint16Array
            },
            b12: {
                raster: Uint16Array
            },
        }
    }
    sentinels2l1c: {
        rawBands: {
            b1: {
                raster: Uint16Array
            },
            b2: {
                raster: Uint16Array
            },
            b3: {
                raster: Uint16Array
            },
            b4: {
                raster: Uint16Array
            },
            b5: {
                raster: Uint16Array
            },
            b6: {
                raster: Uint16Array
            },
            b7: {
                raster: Uint16Array
            },
            b8: {
                raster: Uint16Array
            },
            b8a: {
                raster: Uint16Array
            },
            b9: {
                raster: Uint16Array
            },
            b10: {
                raster: Uint16Array
            },
            b11: {
                raster: Uint16Array
            },
            b12: {
                raster: Uint16Array
            },
        }
    }
    landsat8toa: {
        rawBands: {
            b1: {
                raster: Uint16Array
            },
            b2: {
                raster: Uint16Array
            },
            b3: {
                raster: Uint16Array
            },
            b4: {
                raster: Uint16Array
            },
            b5: {
                raster: Uint16Array
            },
            b6: {
                raster: Uint16Array
            },
            b7: {
                raster: Uint16Array
            },
            b8: {
                raster: Uint16Array
            },
            b9: {
                raster: Uint16Array
            },
            b10: {
                raster: Uint16Array
            },
            b11: {
                raster: Uint16Array
            },
        }
    }
    landsat8sr: {
        rawBands: {
            b1: {
                raster: Uint16Array
            },
            b2: {
                raster: Uint16Array
            },
            b3: {
                raster: Uint16Array
            },
            b4: {
                raster: Uint16Array
            },
            b5: {
                raster: Uint16Array
            },
            b6: {
                raster: Uint16Array
            },
            b7: {
                raster: Uint16Array
            },
        }
    },
    landsat5toa: {
        rawBands: {
            b1: {
                raster: Uint16Array
            },
            b2: {
                raster: Uint16Array
            },
            b3: {
                raster: Uint16Array
            },
            b4: {
                raster: Uint16Array
            },
            b5: {
                raster: Uint16Array
            },
            b6: {
                raster: Uint16Array
            },
            b7: {
                raster: Uint16Array
            }
        }
    }
    landsat5sr: {
        rawBands: {
            b1: {
                raster: Uint16Array
            },
            b2: {
                raster: Uint16Array
            },
            b3: {
                raster: Uint16Array
            },
            b4: {
                raster: Uint16Array
            },
            b5: {
                raster: Uint16Array
            },
            b6: {
                raster: Uint16Array
            },
            b7: {
                raster: Uint16Array
            },
        }
    }
}

export interface EditorStoreGetters {
    [key: string]: any;
}

export interface EditorStoreActions {
    displaySourceImage(width: number, height: number, satelliteType: SatelliteType): HTMLCanvasElement;
    addLayer(layerName: string, canvas: HTMLCanvasElement, discretizable?: boolean): void;
    addImageLayer(layerName: string, width: number, height: number, imageUrl: File): void;
    addLegend(layerName: {
        name: string;
        isLayer: boolean;
        displayAlways: boolean;
        legendToLayer: string;
    }, file: File): void;
    toggleNormalization(satelliteType: SatelliteType): void;
    addDrawingLayer(layerName: string, width: number, height: number): void;
    activateTool(tool: string): void;
    selectLayer(layerName: string, closeMenus?: boolean): void;
    closeAllMenus(): void;
    reactivateTool(): void;
    resetStore(): void;
}

export interface NavStore {
    links: string[];
    currentLinkIndex: number;
    editorDrawerOpen: boolean;
}

export interface UploadStore {
    singleFilesUpload: boolean;
    multipleFilesUpload: boolean;
    uploadedFiles: File[];
    selectedSatellite: SatelliteType;
    useNdvi: boolean;
    useNdwi: boolean;
    useAgriculture: boolean;
    sentinels2aAssignment: Record<string, string>;
    sentinels2cAssignment: Record<string, string>;
    landsat8srAssignment: Record<string, string>;
    landsat8toaAssignment: Record<string, string>;
    landsat5toaAssignment: Record<string, string>;
    landsat5srAssignment: Record<string, string>;
    classes: {
        id: number,
        className: string,
        color: string
    }[]
}

export interface UploadStoreGetters {
    [key: string]: any;
}

export interface UploadStoreActions {
    hexColorToClassNumber(hexColor: string): number;
}

export enum NormType {
    '1and99percentile' = '1and99percentile',
    '5and95percentile' = '5and95percentile',
    'minmax' = 'minmax',
    'histogram' = 'histogram'
}

export enum SatelliteType {
    'sentinels2l2a' = 'sentinels2l2a',
    'sentinels2l1c' = 'sentinels2l1c',
    'landsat8toa' = 'landsat8toa',
    'landsat8sr' = 'landsat8sr',
    'landsat5toa' = 'landsat5toa',
    'landsat5sr' = 'landsat5sr'
}