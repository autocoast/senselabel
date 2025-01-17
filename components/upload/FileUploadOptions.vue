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
        <!-- <UploadFileUploadOption title="Single Files" description="Useful when you want to label a single image."
            details="-- FileA.tif
  -- FileB.tif
  -- FileC.png
  -- FileD.jpg
  -- etc." :onClick="toggleSingleFiles">
            <template #icon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity=".16"></circle>
                    <path v-if="uploadStore.singleFilesUpload" fill-rule="evenodd" clip-rule="evenodd"
                        d="M3.75 12a8.25 8.25 0 0 1 11.916-7.393.75.75 0 1 0 .668-1.343A9.713 9.713 0 0 0 12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75c0-.366-.02-.727-.06-1.082a.75.75 0 1 0-1.49.164A8.25 8.25 0 1 1 3.75 12Zm17.78-6.47a.75.75 0 0 0-1.06-1.06L12 12.94l-2.47-2.47a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l9-9Z"
                        fill="currentColor"></path>
                </svg>
            </template>
</UploadFileUploadOption> -->

        <UploadFileUploadOption title="Folder structure" description="Use the following structure to upload your files."
            details="- Folder
      - SubfolderA
          - Band 1.tif
          - Band 2.tif
          - ...
      - SubfolderB
          - Band 1.tif
          - Band 2.tif
          - ...
      - etc." :onClick="toggleSingleFiles">
            <!-- <template #icon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity=".16"></circle>
                    <path v-if="uploadStore.multipleFilesUpload" fill-rule="evenodd" clip-rule="evenodd"
                        d="M3.75 12a8.25 8.25 0 0 1 11.916-7.393.75.75 0 1 0 .668-1.343A9.713 9.713 0 0 0 12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75c0-.366-.02-.727-.06-1.082a.75.75 0 1 0-1.49.164A8.25 8.25 0 1 1 3.75 12Zm17.78-6.47a.75.75 0 0 0-1.06-1.06L12 12.94l-2.47-2.47a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l9-9Z"
                        fill="currentColor"></path>
                </svg>
            </template> -->
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