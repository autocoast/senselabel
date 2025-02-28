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
    <div style="position: relative;" oncontextmenu="return false;" class="relative w-full h-full"
        id="classicViewContainer">
        <EditorClasses />
        <EditorBucketSlider />
        <EditorMap />
        <div :class="editorStore.mapIsActive ? 'hidden' : 'display'" id="panContainer"> <!--class="w-full h-full">-->
            <div id="labelContainer" class="w-full h-full">
                <div id="layers"></div>
                <div id="drawingContainer"></div>
                <canvas id="cursorShadow"></canvas>
                <canvas id="autofill"></canvas>
            </div>
        </div>
        <!-- Left and Right Arrow Keys -->
        <div id="leftArrow" class="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-slate-100 ml-10" @click="() => {
            navStore.currentLinkIndex = Math.max(0, navStore.currentLinkIndex - 1);
            navStore.editorDrawerOpen = false;
        }">
            <Icon name="mdi:arrow-left" class="w-10 h-10" />
        </div>
        <div id="rightArrow" class="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-100 mr-10" @click="() => {
            navStore.currentLinkIndex = Math.min(navStore.links.length - 1, navStore.currentLinkIndex + 1);
            navStore.editorDrawerOpen = false;
        }">
            <Icon name="mdi:arrow-right" class="w-10 h-10" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useEditorStore } from '~/store/editorStore';
import { useSettingsStore } from '~/store/settingStore';
import { CursorShadowHandler } from '~/utils/canvasHandlers/cursorShadowHandler';
import { useNavStore } from '~/store/navStore';

const editorStore = useEditorStore();
const settingsStore = useSettingsStore();
const navStore = useNavStore();

// watch(() => editorStore.layerNameDrawerSettings, () => {



//     if (editorStore.layerNameDrawerSettings.get(layer.title)!.visible) {
//         document.getElementById(layer.title)!.style.display = 'block';
//     } else {
//         document.getElementById(layer.title)!.style.display = 'none';
//     }
// }, { deep: true });

watch(() => editorStore.layerNameDrawerSettings, () => {

    for (const [key, value] of editorStore.layerNameDrawerSettings.entries()) {
        const element = document.getElementById(key);
        if (element) {
            element.style.opacity = '' + (value.opacity / 100);

            if (value.visible) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }

        }
    }

}, { deep: true });

watch(() => editorStore.layerNameToCanvas, () => {
    LayersHandler.getInstance().clearLayerCanvases();
    for (let i = editorStore.layerNameDisplayOrder.length - 1; i >= 0; i--) {
        let layerName = editorStore.layerNameDisplayOrder[i];
        let canvas = editorStore.layerNameToCanvas.get(layerName);
        // center canvas in the container
        if (canvas) {
            // canvas.style.marginLeft = 'auto';
            // canvas.style.marginRight = 'auto';
            document.getElementById('layers')?.appendChild(canvas);
        }
    }
    editorStore.drawingLayerNameDisplayOrder.forEach((layerName) => {
        let canvas = editorStore.layerNameToCanvas.get(layerName);
        if (canvas) {
            // canvas.style.marginLeft = 'auto';
            // canvas.style.marginRight = 'auto';
            document.getElementById('layers')?.appendChild(canvas);
        }
    });

}, { deep: true });

watch(() => editorStore.panMoveActive, (isActive) => {
    if (isActive) {
        PanzoomHandler.getInstance().addPanzoom(document.getElementById('panContainer')!);
    } else {
        if (PanzoomHandler.getInstance().panzoom) {
            PanzoomHandler.getInstance().lastPan = PanzoomHandler.getInstance().panzoom!.getPan();
            PanzoomHandler.getInstance().lastPanScale = PanzoomHandler.getInstance().panzoom!.getScale();
            PanzoomHandler.getInstance().lastPanOptions = PanzoomHandler.getInstance().panzoom!.getOptions();
            PanzoomHandler.getInstance().lastLabelContainerStyle = document.getElementById('panContainer')!.style.transform;
            PanzoomHandler.getInstance().removePanZoom();
        }
    }
});

watch(() => editorStore.penSize, (penSize) => {
    CursorShadowHandler.getInstance().updateCursorShadow();
});

watch(() => editorStore.width, (width) => {
    let cursorCanvas = document.querySelector('#cursorShadow')! as HTMLCanvasElement;
    cursorCanvas.width = width;
    cursorCanvas.height = editorStore.height;
    CursorShadowHandler.getInstance().updateCursorShadow();
});

onMounted(async () => {

    CursorShadowHandler.getInstance().addMouseOverContainer();
    PanzoomHandler.getInstance().addPanzoom(document.getElementById('panContainer')!);
    PanzoomHandler.getInstance().addRightMouseButtonDownEvent();
    PanzoomHandler.getInstance().addRightMouseButtonUpEvent();
    HistoryHandler.getInstance();
})

onBeforeUnmount(() => {
    PanzoomHandler.getInstance().removePanZoom();
    CursorShadowHandler.getInstance().removeMouseOverContainer();
});

</script>

<style scoped>
#panContainer {
    margin: 50px auto;
}
</style>