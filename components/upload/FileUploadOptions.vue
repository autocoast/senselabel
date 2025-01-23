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
    <div class="flex flex-wrap gap-4 justify-around mb-6">
        <UploadFileUploadOption title="Folder structure" description="Use the following structure to upload your files."
            details="- Folder (all images)
      - SubfolderA (image A)
          - Band 1.tif
          - Band 2.tif
          - ...
      - SubfolderB (image B)
          - Band 1.tif
          - Band 2.tif
          - ...
      - etc." :onClick="toggleSingleFiles">
        </UploadFileUploadOption>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUploadStore } from "~/store/uploadStore";


// State management
const uploadStore = useUploadStore();

function toggleSingleFiles() {
    uploadStore.singleFilesUpload = !uploadStore.singleFilesUpload;
    uploadStore.multipleFilesUpload = !uploadStore.multipleFilesUpload;
    uploadStore.uploadedFiles = [];
    if (document) {
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        fileInput.value = '';
    }
}
</script>