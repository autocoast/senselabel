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
    <div v-if="editorStore.bucket.active"
        class="z-50 absolute top-2 left-1/2 transform -translate-x-1/2 w-96 p-2 h-12 bg-slate-400 shadow-md rounded flex items-center justify-center dark:bg-slate-900 dark:text-coolgreen">
        <p class="mr-3">Bucket Fill Tolerance</p>
        <input type="range" class="dark:bg-slate-950 dark:range-success bg-slate-200 range range-primary" min="0"
            max="100" step="1" v-model="editorStore.bucketFillTolerance" @change="handleSliderChange" />
    </div>
</template>

<script setup>
import { useEditorStore } from '~/store/editorStore';
import { useUploadStore } from '~/store/uploadStore';
import { bucketFillWorker } from '~/utils/canvasHandlers/bucketfill';

const editorStore = useEditorStore();
const uploadStore = useUploadStore();

// Method to handle slider change logic
const handleSliderChange = () => {
    if (HistoryHandler.history.length) {
        if (HistoryHandler.history[HistoryHandler.history.length - 1][3] === HistoryAction.BUCKETFILL) {
            HistoryHandler.getInstance().undo();
            const canvas = ActionEventHandler.getInstance().getCanvas();
            bucketFillWorker(canvas, editorStore.lastXY.x, editorStore.lastXY.y, editorStore, uploadStore);
        }
    }
};

</script>