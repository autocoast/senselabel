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
    <div class="space-y-4">
        <div class="flex items-center gap-4 p-4 bg-base-100 rounded-lg shadow-md dark:bg-slate-900">
            <input v-model="layerName"
                class="dark:bg-slate-900 dark:border-coolgreen dark:text-coolgreen input input-bordered flex-1"
                :class="referenceVariable ? '' : 'line-through'" type="text" placeholder="Class Name" />
            <button class="btn text-white  btn-sm " :class="referenceVariable ? 'btn-error' : 'btn-success'"
                @click="referenceVariable = !referenceVariable">
                {{ referenceVariable ? 'Remove' : 'Add' }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { useUploadStore } from '~/store/uploadStore';

const uploadStore = useUploadStore();

const layerName: Ref<string> = ref('');

const props = defineProps<{
    layerType: 'ndvi' | 'ndwi' | 'agriculture';
}>();

const referenceVariable: Ref<boolean> = ref(false);

watch(referenceVariable, (value) => {
    switch (props.layerType) {
        case 'ndvi':
            uploadStore.useNdvi = value;
            break;
        case 'ndwi':
            uploadStore.useNdwi = value;
            break;
        case 'agriculture':
            uploadStore.useAgriculture = value;
            break;
    }
});

onMounted(() => {
    switch (props.layerType) {
        case 'ndvi':
            layerName.value = 'NDVI';
            referenceVariable.value = uploadStore.useNdvi
            break;
        case 'ndwi':
            layerName.value = 'NDWI';
            referenceVariable.value = uploadStore.useNdwi
            break;
        case 'agriculture':
            layerName.value = 'Agriculture';
            referenceVariable.value = uploadStore.useAgriculture
            break;
    }
});

</script>