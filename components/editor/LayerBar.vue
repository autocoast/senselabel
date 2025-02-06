<template>
    <div class="flex items-center">
        <span class="text-xs text-slate-400">Drawing Layers</span>
        <div class="m-1"></div>
        <button class="items-center flex" @click.stop
            @click="() => { editorStore.addDrawingLayer('Drawing Layer ' + (editorStore.drawingLayerNameDisplayOrder.length + 1), editorStore.width, editorStore.height) }">
            <Icon name="mdi:plus" />
        </button>
    </div>
    <div class="cursor-pointer text-sm text-slate-500 rounded-lg p-2"
        :class="editorStore.selectedDrawingLayer === layerName ? 'bg-slate-200 dark:bg-gray-700' : ''"
        @click="editorStore.selectLayer(layerName)" v-for="layerName in editorStore.drawingLayerNameDisplayOrder"
        :key="layerName">
        <div>{{ layerName }}</div>
        <div class="m-2"></div>
        <div class="flex w-full">
            <button @click.stop
                @click="editorStore.layerNameDrawerSettings.get(layerName)!.visible = !editorStore.layerNameDrawerSettings.get(layerName)!.visible">
                <Icon
                    :name="editorStore.layerNameDrawerSettings.get(layerName)!.visible ? 'mdi:eye' : 'mdi:eye-closed'" />
            </button>
            <div class="m-1"></div>
            <input v-model="editorStore.layerNameDrawerSettings.get(layerName)!.opacity" type="range" min="0" max="100"
                class="range dark:range-success range-primary range-xs bg-slate-100 dark:bg-slate-950" @click.stop />
        </div>
    </div>
    <div class="m-4"></div>
    <span class="text-xs text-slate-400">Other Layers</span>
    <div class="cursor-pointer text-sm text-slate-500 rounded-lg p-2"
        :class="editorStore.selectedOtherLayer === layerName ? 'bg-slate-200 dark:bg-gray-700' : ''"
        @click="editorStore.selectLayer(layerName)" v-for="layerName in editorStore.layerNameDisplayOrder"
        :key="layerName">
        <div>{{ layerName }}</div>
        <div class="m-2"></div>
        <div class="flex w-full">
            <button @click.stop
                @click="editorStore.layerNameDrawerSettings.get(layerName)!.visible = !editorStore.layerNameDrawerSettings.get(layerName)!.visible">
                <Icon
                    :name="editorStore.layerNameDrawerSettings.get(layerName)!.visible ? 'mdi:eye' : 'mdi:eye-closed'" />
            </button>
            <div class="m-1"></div>
            <button @click.stop @click="toggleMenu(layerName)">
                <Icon name="mdi:stairs" />
            </button>
            <transition name="fade-slide">
                <div v-if="editorStore.layerNameDrawerSettings.get(layerName)!.kmeansMenuOpen" ref="kmeansMenuRef"
                    :style="menuStyle"
                    class=" absolute z-50 bg-white text-slate-500 shadow-lg rounded-lg p-4 w-72 dark:bg-slate-950 dark:text-coolgreen">
                    <!-- Card Content -->
                    <h4 class="text-lg font-semibold">K-Means Clustering</h4>
                    <p class="text-sm">
                        Cluster the satellite image to reduce the number of colors.
                        This helps to simplify the labelling process.
                        <br />
                        <br />
                        Number of clusters:
                    </p>
                    <select v-model="numberOfClusters" class="mt-2 w-24 h-12 rounded dark:bg-slate-950">
                        <option v-for="i in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]"
                            :value="i" :selected="i === numberOfClusters">{{ i }}</option>
                    </select>
                    <button @click.stop class="btn w-24 mt-2 border-none"
                        @click="() => { continuosToDiscrete(layerName) }">{{
                            editorStore.kmeansLoading ? '' : 'Cluster' }}
                        <span v-if="editorStore.kmeansLoading" class="loading loading-spinner loading-xs"></span>
                    </button>
                    <button @click.stop class="btn w-12 mt-2 border-none" @click="closeMenu(layerName)">
                        <Icon name="mdi:close" />
                    </button>
                </div>
            </transition>
            <div class="m-1"></div>
            <button @click="discreteToContinuos(layerName)" @click.stop>
                <Icon name="mdi:chart-bell-curve-cumulative"
                    :class="editorStore.layerNameDrawerSettings.get(layerName)!.kmeansClustered ? 'bg-red-600' : ''" />
            </button>
            <div class="m-1"></div>
            <input v-model="editorStore.layerNameDrawerSettings.get(layerName)!.opacity" type="range" min="0" max="100"
                class="range dark:range-success range-primary range-xs bg-slate-100 dark:bg-slate-950" @click.stop />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '~/store/editorStore';
import { useUploadStore } from '~/store/uploadStore';
import { SatelliteType } from '~/types';
import { loadAgriculture } from '~/utils/canvasHandlers/agricultureHandler';
import { discretize } from '~/utils/canvasHandlers/kmeansHandler';
import { loadNDVI } from '~/utils/canvasHandlers/ndviHandler';
import { loadNDWI } from '~/utils/canvasHandlers/ndwiHandler';

const editorStore = useEditorStore();
const uploadStore = useUploadStore();

const numberOfClusters = ref(5);

function continuosToDiscrete(layerName: string) {
    editorStore.displaySourceImage(editorStore.width, editorStore.height, uploadStore.selectedSatellite);
    let canvas = editorStore.layerNameToCanvas.get(layerName)!;
    discretize(canvas, numberOfClusters.value, editorStore, layerName);
    editorStore.layerNameDrawerSettings.get(layerName)!.discreteActive = true;
}

function discreteToContinuos(layerName: string) {
    switch (layerName) {
        case 'Source Image':
            editorStore.displaySourceImage(editorStore.width, editorStore.height, uploadStore.selectedSatellite);
            break;
        case 'NDVI':
            switch (uploadStore.selectedSatellite) {
                case SatelliteType.sentinels2l2a:
                    loadNDVI(editorStore, SatelliteType.sentinels2l2a);
                case SatelliteType.landsat8toa:
                    loadNDVI(editorStore, SatelliteType.landsat8toa);
                case SatelliteType.sentinels2l1c:
                    loadNDVI(editorStore, SatelliteType.sentinels2l1c);
            }
            break;
        case 'Agriculture':
            switch (uploadStore.selectedSatellite) {
                case SatelliteType.sentinels2l2a:
                    loadAgriculture(editorStore, SatelliteType.sentinels2l2a);
                case SatelliteType.landsat8toa:
                    loadAgriculture(editorStore, SatelliteType.landsat8toa);
                case SatelliteType.sentinels2l1c:
                    loadAgriculture(editorStore, SatelliteType.sentinels2l1c);
                    break;
            }
            break;
        case 'NDWI':
            switch (uploadStore.selectedSatellite) {
                case SatelliteType.sentinels2l2a:
                    loadNDWI(editorStore, SatelliteType.sentinels2l2a);
                case SatelliteType.landsat8toa:
                    loadNDWI(editorStore, SatelliteType.landsat8toa);
                case SatelliteType.sentinels2l1c:
                    loadNDWI(editorStore, SatelliteType.sentinels2l1c);
                    break;
            }
            break;
    }
    editorStore.layerNameDrawerSettings.get(layerName)!.kmeansClustered = false;
}

function closeMenu(layerName: string) {
    editorStore.layerNameDrawerSettings.get(layerName)!.kmeansMenuOpen = false;
};


function toggleMenu(layerName: string) {
    // editorStore.kmeansMenuOpen = !editorStore.kmeansMenuOpen;

    editorStore.otherLayers.forEach((layer) => {
        editorStore.layerNameDrawerSettings.get(layer.title)!.kmeansMenuOpen = false;
    });

    editorStore.layerNameDrawerSettings.get(layerName)!.kmeansMenuOpen = !editorStore.layerNameDrawerSettings.get(layerName)!.kmeansMenuOpen;
    adjustMenuPosition();
    // nextTick(() => {
    //     if (kmeansMenuOpen.value) {
    //         adjustMenuPosition();
    //     }
    // });
};


const kmeansMenuRef = ref<HTMLElement | null>(null);
const menuStyle = ref({
    marginTop: `20px`,
    right: '0px'
});



function adjustMenuPosition() {
    const menu = kmeansMenuRef.value;
    if (menu) {
        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        let left = rect.left;

        // Adjust if the menu goes beyond the right edge
        if (rect.right > viewportWidth) {
            left -= rect.right - viewportWidth + 16; // Add some padding
        }

        // Apply dynamic styles
        menuStyle.value = {
            marginTop: `20px`,
            right: `${left}px`,
        };
    }
}
</script>