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
    <!-- <div class="flex items-center justify-end p-0">
        <button class="btn btn-primary">Continue to editor</button>
    </div> -->
    <!-- <div class="flex items-center justify-center"> -->
    <div class="flex items-center justify-center min-h-screen bg-base-200">
        <div
            class="card shadow-xl dark:bg-coolgreen-900 dark:bg-opacity-10 w-full max-w-4xl dark:border-coolgreen border border-dashed">
            <!-- <div class=" card-title">
                <info title="About the file upload" text="
                    Upload files for processing. You can drag and drop files or click the button to browse your computer.
                    You can upload single files as well as multiple files and folders.
                    For best experience, upload GeoTIFF files for your raw satellite imagery.
                    You can also upload other file formats like JPEG, PNG, etc.
                    You can upload multi-channel GeoTIFF files or single-channel files (one file per band).
                    When specifying a satellite type (like Sentinel-2 or Landsat-8), the system will automatically compute additional layers for you (like NDVI, NDWI etc.) which might be helpful in during the labelling process.
                    
                " />
            </div> -->
            <div class="card-body">
                <ul class="steps">
                    <li class="step dark:text-coolgreen dark:step-success step-primary text-sm">Upload
                        files
                    </li>
                    <li class="step dark:text-coolgreen dark:step-success step-primary text-sm">Configure Satellite
                    </li>
                    <li class="step dark:text-coolgreen dark:step-success step-primary text-sm">Define Classes</li>
                    <li class="step dark:text-coolgreen dark:step-success step-primary text-sm">Label</li>
                </ul>
                <div class="m-2"></div>
                <!-- Header -->
                <h1 class="text-2xl font-bold text-center text-primary dark:text-slate-300">Upload Files </h1>

                <!-- Satellite Type Dropdown -->
                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">Select Satellite Type</span>
                    </label>
                    <select v-model="uploadStore.selectedSatellite"
                        class="select select-bordered select-primary dark:bg-transparent dark:text-coolgreen dark:border-coolgreen bg-primary text-white">
                        <option disabled value="">Choose a satellite...</option>
                        <option :value="SatelliteType.sentinels2l2a">Sentinel-2 L2A</option>
                        <option :value="SatelliteType.sentinels2l1c">Sentinel-2 L1C</option>
                        <option :value="SatelliteType.landsat8toa">Landsat-8 TOA</option>
                        <option :value="SatelliteType.landsat8sr">Landsat-8 SR</option>
                    </select>


                    <!-- <button @click="submit" class="btn btn-primary w-full">
                            Configure automatic layer computations
                        </button> -->

                    <!-- <info text="This is a default help text. Please provide your own." /> -->

                </div>

                <p class="mb-4 text-center text-slate-500">Upload the data you wish to label.
                    Geotiffs are currently the only supported format (one file per band).
                    Other formats (e.g., PNG, JPEG, BMP) will be available soon in the next version.
                    <!-- <NuxtLink class="text-primary dark:text-coolgreen"
                        to='/learn-more'>
                        Learn
                        more</NuxtLink> -->
                </p>

                <UploadFileUploadOptions />

                <!-- File Upload -->
                <div class="form-control w-full mb-4">
                    <div class="relative"
                        @dragenter.prevent="onDragEnter"
                        @dragleave.prevent="onDragLeave"
                        @dragover.prevent
                        @drop.prevent="handleDrop">
                        
                        <!-- Upload Area -->
                        <div :class="[
                            'border-2 border-dashed rounded-lg p-8 transition-all duration-200 flex flex-col items-center justify-center',
                            'relative z-10',
                            dragActive 
                                ? 'border-primary dark:border-coolgreen bg-base-200/50' 
                                : 'dark:border-coolgreen border-gray-300'
                        ]">
                            <!-- Upload Icon -->
                            <div class="mb-4">
                                <svg v-if="!dragActive" class="text-coolgreen" height="50px" width="50px" version="1.1" 
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184.69 184.69">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <g>
                                            <g>
                                                <g>
                                                    <path class="dark:fill-coolgreen fill-slate-900"
                                                        d="M149.968,50.186c-8.017-14.308-23.796-22.515-40.717-19.813 C102.609,16.43,88.713,7.576,73.087,7.576c-22.117,0-40.112,17.994-40.112,40.115c0,0.913,0.036,1.854,0.118,2.834 C14.004,54.875,0,72.11,0,91.959c0,23.456,19.082,42.535,42.538,42.535h33.623v-7.025H42.538 c-19.583,0-35.509-15.929-35.509-35.509c0-17.526,13.084-32.621,30.442-35.105c0.931-0.132,1.768-0.633,2.326-1.392 c0.555-0.755,0.795-1.704,0.644-2.63c-0.297-1.904-0.447-3.582-0.447-5.139c0-18.249,14.852-33.094,33.094-33.094 c13.703,0,25.789,8.26,30.803,21.04c0.63,1.621,2.351,2.534,4.058,2.14c15.425-3.568,29.919,3.883,36.604,17.168 c0.508,1.027,1.503,1.736,2.641,1.897c17.368,2.473,30.481,17.569,30.481,35.112c0,19.58-15.937,35.509-35.52,35.509H97.391 v7.025h44.761c23.459,0,42.538-19.079,42.538-42.535C184.69,71.545,169.884,53.901,149.968,50.186z">
                                                    </path>
                                                </g>
                                                <g>
                                                    <path class="dark:fill-coolgreen fill-slate-900"
                                                        d="M108.586,90.201c1.406-1.403,1.406-3.672,0-5.075L88.541,65.078 c-0.701-0.698-1.614-1.045-2.534-1.045l-0.064,0.011c-0.018,0-0.036-0.011-0.054-0.011c-0.931,0-1.85,0.361-2.534,1.045 L63.31,85.127c-1.403,1.403-1.403,3.672,0,5.075c1.403,1.406,3.672,1.406,5.075,0L82.296,76.29v97.227 c0,1.99,1.603,3.597,3.593,3.597c1.979,0,3.59-1.607,3.59-3.597V76.165l14.033,14.036 C104.91,91.608,107.183,91.608,108.586,90.201z">
                                                    </path>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </div>

                            <!-- Add loading indicator when processing -->
                            <div v-if="isProcessing" class="absolute inset-0 bg-base-200/50 dark:bg-gray-800/50 
                                flex items-center justify-center rounded-lg z-20">
                                <div class="loading loading-spinner loading-lg text-primary dark:text-coolgreen"></div>
                            </div>

                            <!-- Upload Text -->
                            <div class="text-center space-y-2">
                                <p class="text-base dark:text-coolgreen">
                                    <span class="font-semibold">Drop your folder here</span> or
                                </p>
                                <input type="file" id="file-upload" name="file-upload" 
                                    webkitdirectory multiple 
                                    class="hidden" 
                                    @change="handleFileUpload" />
                                <label for="file-upload"
                                    class="dark:text-coolgreen dark:bg-transparent dark:border-coolgreen dark:hover:bg-coolgreen/10 
                                        btn btn-primary hover:bg-slate-900 cursor-pointer inline-block">
                                    Browse Folder
                                </label>
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    Upload a folder containing your satellite images
                                </p>
                            </div>

                            <!-- Folder Structure Reminder -->
                            <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
                                <p>Expected structure:</p>
                                <pre class="mt-1 font-mono">
Root Folder/
  ├── SubfolderA/
  │   ├── Band1.tif
  │   ├── Band2.tif
  │   └── ...
  ├── SubfolderB/
  │   ├── Band1.tif
  │   ├── Band2.tif
  │   └── ...
  └── ...</pre>
                            </div>
                        </div>

                        <!-- Drag Overlay -->
                        <div v-if="dragActive" 
                            class="absolute inset-0 bg-primary/5 dark:bg-coolgreen/5 
                                rounded-lg z-0 pointer-events-none">
                        </div>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="form-control mt-4 dark:text-slate-300">
                    <Button @click="router.push('upload/preprocess')"
                        :disabled="uploadStore.uploadedFiles.length === 0">
                        Process Files {{ uploadStore.uploadedFiles.length === 0 ? "(No files uploaded)" : "" }}
                    </Button>
                </div>

                <!-- Uploaded Files List -->
                <!-- <div v-if="uploadStore.uploadedFiles.length" class="mb-4"> -->
                <h2 class="text-lg font-semibold dark:text-slate-400">Uploaded Files
                </h2>
                <UploadFileTree :uploadedFiles="uploadStore.uploadedFiles" />

                <!-- </div> -->
            </div>
        </div>
    </div>
    <!-- <div class="flex items-center justify-center min-h-screen bg-base-200">
            <div class="card shadow-xl bg-base-100 w-full max-w-lg p-6">
                <div class="card-body">
                    <h1 class="text-2xl font-bold text-center">Define Classes</h1>
                </div>
            </div>
        </div> -->
    <!-- </div> -->
</template>

<script setup lang="ts">
import { ref } from "vue";
import { fromUrl, fromArrayBuffer, fromBlob } from "geotiff";
import { useUploadStore } from "~/store/uploadStore";
import { SatelliteType } from "~/types";

const uploadStore = useUploadStore();
const dragActive = ref(false);
let dragCounter = 0;
const isProcessing = ref(false);

// Type for FileSystemEntry
interface FileSystemEntry {
    isFile: boolean;
    isDirectory: boolean;
    file: (callback: (file: File) => void) => void;
    createReader: () => FileSystemDirectoryReader;
    name: string;
    fullPath: string;
}

interface FileSystemDirectoryReader {
    readEntries: (callback: (entries: FileSystemEntry[]) => void) => void;
}


// Add dragenter handler


const router = useRouter();



// const uploadedFiles = ref([]);
// const selectedSatellite = ref("");



const handleFileUpload = (event) => {
    uploadStore.uploadedFiles = Array.from(event.target.files).filter(file => file.webkitRelativePath.split('/').length == 3);
};

// const handleFileDrop = (event) => {
//     event.preventDefault(); // Prevent default browser behavior
//     const files = Array.from(event.dataTransfer.files);

//     // Check for folder structure using webkitRelativePath
//     const hierarchicalFiles = files.map((file) => ({
//         name: file.name,
//         size: file.size,
//         fullPath: file.webkitRelativePath || file.name, // Use relative path if available
//     }));

//     console.log(hierarchicalFiles); // See detailed output including folder structure
//     uploadStore.uploadedFiles = hierarchicalFiles;
// };
const submit = () => {
    if (!uploadStore.uploadedFiles.length) {
        alert("Please upload files first!");
        return;
    }
    alert(`Processing ${uploadStore.uploadedFiles.length} file(s) for ${uploadStore.selectedSatellite.value || "unknown satellite"}.`);
};


const traverseDirectory = async (entry: FileSystemEntry, files: File[], rootPath: string) => {
    console.log('traverseDirectory', entry);
    try {
        if (entry.isFile) {
            const file = await getFileFromEntry(entry);
            
            // Skip .DS_Store and other hidden files
            if (file.name.startsWith('.')) {
                return;
            }

            // Get the path parts
            const pathParts = entry.fullPath.split('/').filter(Boolean); // Remove empty strings
            
            // Construct the relative path starting from the root folder
            const fullRelativePath = [rootPath, ...pathParts].join('/');
            
            // Create a custom file object
            const customFile = new File([file], file.name, {
                type: file.type,
                lastModified: file.lastModified
            });
            
            // Set the webkitRelativePath
            Object.defineProperty(customFile, 'webkitRelativePath', {
                value: fullRelativePath,
                writable: false
            });

            // Debug log
            console.log('Processing file:', fullRelativePath);
            files.push(customFile);
            
            // Check if file is at correct depth (root/subfolder/file)
            // For your structure: Northern_WS/sg_2017.../file.tif
            // const pathDepth = fullRelativePath.split('/').length;
            // if (pathDepth === 3 && file.name.endsWith('.tif')) {
            //     files.push(customFile);
            //     console.log('Added file:', fullRelativePath);
            // }
        } else if (entry.isDirectory) {
            // Skip .git and other hidden directories
            if (entry.name.startsWith('.')) {
                return;
            }

            const reader = entry.createReader();
            let entries: FileSystemEntry[] = [];
            
            // Read all entries in chunks
            let readEntries = await readEntriesPromise(reader);
            while (readEntries.length > 0) {
                entries = entries.concat(readEntries);
                readEntries = await readEntriesPromise(reader);
            }

            // Process all entries
            for (const childEntry of entries) {
                await traverseDirectory(childEntry, files, rootPath);
            }
        }
    } catch (error) {
        console.error('Error traversing directory:', error, entry);
    }
};

const getFileFromEntry = (entry: FileSystemEntry): Promise<File> => {
    return new Promise((resolve) => {
        entry.file((file: File) => {
            resolve(file);
        });
    });
};

const readEntriesPromise = (reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> => {
    return new Promise((resolve) => {
        reader.readEntries((entries: FileSystemEntry[]) => {
            resolve(entries);
        });
    });
};


</script>

<style scoped>
.drag-active {
    @apply border-primary dark:border-coolgreen bg-base-200/50;
}

pre {
    @apply bg-gray-100 dark:bg-gray-800/50 p-2 rounded;
}
</style>
