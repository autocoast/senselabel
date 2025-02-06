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

    <!-- Sidebar/Menu -->
    <div v-if="!editorStore.mapIsActive" class="w-28 text-white p-0 space-y-4">
        <!-- Menu Item 1 -->
        <div class="flex">
            <EditorToolbarButton iconName="mdi:pan" tool="pan" :condition="editorStore.panMoveActive"
                :clickEvent="() => editorStore.activateTool('pan')" hotkeyString="hk_toggle_pan" />
            <div class="m-1"></div>
            <EditorToolbarButton iconName="mdi:map" tool="map" :condition="editorStore.mapIsActive"
                :clickEvent="() => editorStore.activateTool('map')" hotkeyString="hk_toggle_map" />
        </div>
        <div class="flex">
            <EditorToolbarButton iconName="mdi:pen" tool="plainDrawer" :condition="editorStore.drawingActive"
                :clickEvent="() => editorStore.activateTool('plainDrawer')" hotkeyString="hk_toggle_pen" />
            <div class="m-1"></div>

            <EditorToolbarButton iconName="mdi:eraser" tool="eraser" :condition="editorStore.eraser.active"
                :clickEvent="() => editorStore.activateTool('eraser')" hotkeyString="hk_toggle_eraser" />
        </div>

        <div class="flex">
            <button class="btn w-12 dark:border-none" @click="downloadNpy()">
                <Icon name="mdi:download" class="dark:text-coolgreen text-slate-600" />
            </button>
            <div class="m-1"></div>
            <EditorToolbarButton iconName="mdi:fill" tool="bucket" :condition="editorStore.bucket.active"
                :clickEvent="() => editorStore.activateTool('bucket')" hotkeyString="hk_toggle_bucket" />
        </div>

        <div class="flex">
            <EditorToolbarButton iconName="mdi:ab-testing" tool="gapDrawer" :condition="editorStore.gapDrawer.active"
                :clickEvent="() => editorStore.activateTool('gapDrawer')" hotkeyString="hk_toggle_gap_drawer" />
            <div class="m-1"></div>
            <div class="relative">
                <EditorToolbarButton iconName="mdi:magic-staff" tool="wand"
                    :condition="editorStore.wand.menuOpen || editorStore.wand.active" :clickEvent="() => toggleMenu()"
                    hotkeyString="hk_toggle_wand" :borderStyle="'2px solid ' + editorStore.wand.overwriteClass"
                    :borderCondition="!!editorStore.wand.overwriteClass" />

                <!-- Dropdown Menu -->
                <transition name="fade-slide">
                    <div v-if="editorStore.wand.menuOpen"
                        class="absolute z-50 bg-white text-slate-500 shadow-lg rounded-lg p-4 w-72 dark:bg-slate-950 dark:text-coolgreen"
                        @click.outside="closeMenu">
                        <!-- Card Content -->
                        <h4 class="text-lg font-semibold">Wand Tool</h4>
                        <p class="text-sm">
                            The wand tool lets you replace a certain color when overpainting it without interfering
                            with
                            other colors.
                        </p>
                        <h5 class="text-md font-medium mt-4">Please pick a color that should be replaced</h5>
                        <div class="mt-2 w-24 h-12 rounded" :style="{ backgroundColor: editorStore.hoverColor }">
                        </div>
                    </div>
                </transition>
            </div>
        </div>
        <div class="flex">
            <EditorToolbarButton iconName="mdi:undo" tool="undo" :condition="false"
                :clickEvent="() => HistoryHandler.getInstance().undo()" hotkeyString="hk_undo" />
            <div class="m-1"></div>
            <EditorToolbarButton iconName="mdi:redo" tool="redo" :condition="false"
                :clickEvent="() => HistoryHandler.getInstance().redo()" hotkeyString="hk_redo" />
        </div>
        <div class="indicator">
            <span v-if="editorStore.showHotkeys"
                class="indicator-item badge badge-primary dark:bg-slate-950 dark:text-coolgreen dark:border-none">{{
                    hotkeyNameToShortcutName('hk_toggle_norm') }}</span>
            <span class="text-xs text-slate-400">Normalization</span>
        </div>
        <select v-if="uploadStore.selectedSatellite === SatelliteType.sentinels2l2a"
            v-model="editorStore.currentNormalization"
            @change="normalize(editorStore, editorStore.currentNormalization, SatelliteType.sentinels2l2a)"
            class="select w-full max-w-xs select-xs text-slate-500 mt-0 dark:bg-slate-950" style="margin-top: 0;">
            <option v-for="norm in normalizations" :key="norm" :value="norm">{{ normTypeToDisplayName(norm) }}
            </option>
        </select>
        <select v-if="uploadStore.selectedSatellite === SatelliteType.sentinels2l1c"
            v-model="editorStore.currentNormalization"
            @change="normalize(editorStore, editorStore.currentNormalization, SatelliteType.sentinels2l2a)"
            class="select w-full max-w-xs select-xs text-slate-500 mt-0 dark:bg-slate-950" style="margin-top: 0;">
            <option v-for="norm in normalizations" :key="norm" :value="norm">{{ normTypeToDisplayName(norm) }}
            </option>
        </select>
        <select v-if="uploadStore.selectedSatellite === SatelliteType.landsat8toa"
            v-model="editorStore.currentNormalization"
            @change="normalize(editorStore, editorStore.currentNormalization, SatelliteType.landsat8toa)"
            class="select w-full max-w-xs select-xs text-slate-500 mt-0 dark:bg-slate-950" style="margin-top: 0;">
            <option v-for="norm in normalizations" :key="norm" :value="norm">{{ normTypeToDisplayName(norm) }}
            </option>
        </select>
        <div class="indicator">
            <span v-if="editorStore.showHotkeys"
                class="indicator-item badge badge-primary dark:bg-slate-950 dark:border-none dark:text-coolgreen">{{
                    hotkeyNameToShortcutName('hk_decr_pen_size') }}- {{ hotkeyNameToShortcutName('hk_incr_pen_size')
                }}+</span>
            <span class="text-xs text-slate-400">Pen size</span>
        </div>
        <select v-model="editorStore.penSize" @change="CursorShadowHandler.getInstance().updateCursorShadow()"
            class="select w-full max-w-xs select-xs text-slate-500 mt-0 dark:bg-slate-950" style="margin-top: 0;">
            <option
                v-for="i in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]"
                :key="i" :value="i">{{ i }}</option>
        </select>
        <!-- <div class="form-control"> -->
        <label class="label cursor-pointer">
            <span class="label-text text-xs text-slate-400">Hotkeys</span>
            <input v-model="editorStore.showHotkeys" type="checkbox"
                class="toggle toggle-sm 
                dark:bg-gray-700 dark:border-gray-700
                dark:checked:bg-primary dark:checked:border-primary
                bg-slate-200 
                checked:bg-primary checked:border-primary" />
        </label>
        <!-- </div> -->
    </div>

</template>

<script setup lang="ts">

import { fromUrl, fromUrls, fromArrayBuffer, fromBlob, GeoTIFF, type TypedArray, GeoTIFFImage, type ReadRasterResult } from 'geotiff';
import { normalizations, useEditorStore } from '~/store/editorStore';
import { useNavStore } from '~/store/navStore';
import { useSettingsStore } from '~/store/settingStore';
import { useUploadStore } from '~/store/uploadStore';
import { SatelliteType } from '~/types';
import { CursorShadowHandler } from '~/utils/canvasHandlers/cursorShadowHandler';
import { normalize } from '~/utils/canvasHandlers/normalizeHandler';
const editorStore = useEditorStore();
const uploadStore = useUploadStore();
const navStore = useNavStore();
const settingStore = useSettingsStore();

function hotkeyNameToShortcutName(hotkeyName: string) {
    const setting = settingStore.settings.find(x => x.name === hotkeyName);
    return setting ? JSON.parse(setting.value).join(' + ') : '';
}

function toggleMenu() {
    editorStore.wand.menuOpen = !editorStore.wand.menuOpen;
};

// Close menu
function closeMenu() {
    editorStore.wand.menuOpen = false;
};

function downloadNpy() {
    // select all canvases from #drawingContainer
    const canvases = document.querySelectorAll('#layers canvas') as NodeListOf<HTMLCanvasElement>;
    // check if canvas id starts with "Drawing Layer"
    const drawingCanvases = Array.from(canvases).filter(canvas => canvas.id.startsWith('Drawing Layer'));
    // createMultiChannelArray(drawingCanvases, uploadStore);
    handleDownload(drawingCanvases, uploadStore, navStore.links[navStore.currentLinkIndex]);
}

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
</style>