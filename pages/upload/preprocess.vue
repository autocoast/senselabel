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
    <div class="flex justify-center min-h-screen bg-base-200">
        <div
            class="card shadow-xl dark:bg-coolgreen-900 dark:bg-opacity-10 w-full max-w-4xl dark:border-coolgreen border border-dashed">
            <div class="card-body">
                <div class="flex justify-center mt-4">
                    <div class="w-52">
                        <Button @click="() => {
                            saveToCache();
                            router.push('/upload/classes')
                        }">Save & Continue</Button>
                    </div>
                </div>
                <ul class="steps">
                    <li class="step dark:text-coolgreen dark:step-success step-primary text-sm cursor-pointer" @click="() => {
                        router.push('/')
                    }">Upload
                        files
                    </li>
                    <li class="step dark:text-coolgreen dark:step-success step-primary text-sm">Configure Satellite
                    </li>
                    <li class="step dark:text-coolgreen dark:step-success step-primary text-sm">Define Classes</li>
                    <li class="step dark:text-coolgreen dark:step-success step-primary text-sm">Label</li>
                </ul>
                <div class="m-2"></div>
                <h1 v-if="uploadStore.selectedSatellite === SatelliteType.sentinels2l2a"
                    class="text-2xl font-bold text-center text-primary dark:text-slate-300">Configure Sentinel S2 L2A</h1>
                <h1 v-if="uploadStore.selectedSatellite === SatelliteType.sentinels2l1c"
                    class="text-2xl font-bold text-center text-primary dark:text-slate-300">Configure Sentinel S2 L1C</h1>
                <h1 v-if="uploadStore.selectedSatellite === SatelliteType.landsat8toa"
                    class="text-2xl font-bold text-center text-primary dark:text-slate-300">Configure Landsat 8 TOA</h1>
                <h1 v-if="uploadStore.selectedSatellite === SatelliteType.landsat8sr"
                    class="text-2xl font-bold text-center text-primary dark:text-slate-300">Configure Landsat 8 SR</h1>
                <hr class="my-4">
                </hr>
                <div v-if="selectableTifFiles.length === 0">
                    <p class="text-gray-400 text-center">No GeoTiffs were found, computing RGB and spectral indices
                        won't
                        be performed. We recommend to provide GeoTiffs for automatic RGB and spectral indices
                        computation.</p>
                </div>
                <div v-else>
                    <h2 class="text-lg font-semibold text-primary  dark:text-slate-300">Assign bands to uploaded files
                    </h2>
                    <p class="text-gray-400 text-center mt-5 mb-5">Select the bands corresponding to the uploaded
                        files.<br />Your
                        settings will be saved for future uploads, provided the file structure remains unchanged. {{
                            uploadStore.multipleFilesUpload ? 'We assume that every folder has the same structure.' : '' }}
                    </p>
                    <div v-if="uploadStore.selectedSatellite === SatelliteType.sentinels2l2a" class="flex flex-col">
                        <div class="flex items-center mb-4  bg-slate-50 rounded-xl p-3 dark:bg-slate-900"
                            v-for="band in bands">
                            <div class="w-10/12">
                                <p class="text-primary">{{ band.name }}</p>
                                <p class="text-gray-300">{{ band.description }}, {{ band.centralWaveLength }}nm</p>
                            </div>
                            <div class="form-control w-full mb-0">
                                <select @change="() => {
                                }" v-model="uploadStore.sentinels2aAssignment[band.name]"
                                    class="select select-bordered select-primary dark:bg-transparent dark:text-coolgreen dark:border-coolgreen bg-primary text-white">
                                    <option :value="file.name" v-for="file in selectableTifFiles">
                                        {{ file.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div v-if="uploadStore.selectedSatellite === SatelliteType.sentinels2l1c" class="flex flex-col">
                        <div class="flex items-center mb-4  bg-slate-50 rounded-xl p-3 dark:bg-slate-900"
                            v-for="band in bands">
                            <div class="w-10/12">
                                <p class="text-primary">{{ band.name }}</p>
                                <p class="text-gray-300">{{ band.description }}, {{ band.centralWaveLength }}nm</p>
                            </div>
                            <div class="form-control w-full mb-0">
                                <select @change="() => {
                                }" v-model="uploadStore.sentinels2cAssignment[band.name]"
                                    class="select select-bordered select-primary dark:bg-transparent dark:text-coolgreen dark:border-coolgreen bg-primary text-white">
                                    <option :value="file.name" v-for="file in selectableTifFiles">
                                        {{ file.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div v-if="uploadStore.selectedSatellite === SatelliteType.landsat8toa" class="flex flex-col">
                        <div class="flex items-center mb-4  bg-slate-50 rounded-xl p-3 dark:bg-slate-900"
                            v-for="band in bands">
                            <div class="w-10/12">
                                <p class="text-primary">{{ band.name }}</p>
                                <p class="text-gray-300">{{ band.description }}, {{ band.centralWaveLength }}nm</p>
                            </div>
                            <div class="form-control w-full mb-0">
                                <select @change="() => {
                                }" v-model="uploadStore.landsat8toaAssignment[band.name]"
                                    class="select select-bordered select-primary dark:bg-transparent dark:text-coolgreen dark:border-coolgreen bg-primary text-white">
                                    <option :value="file.name" v-for="file in selectableTifFiles">
                                        {{ file.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div v-if="uploadStore.selectedSatellite === SatelliteType.landsat8sr" class="flex flex-col">
                        <div class="flex items-center mb-4  bg-slate-50 rounded-xl p-3 dark:bg-slate-900"
                            v-for="band in bands">
                            <div class="w-10/12">
                                <p class="text-primary">{{ band.name }}</p>
                                <p class="text-gray-300">{{ band.description }}, {{ band.centralWaveLength }}nm</p>
                            </div>
                            <div class="form-control w-full mb-0">
                                <select @change="() => {
                                }" v-model="uploadStore.landsat8srAssignment[band.name]"
                                    class="select select-bordered select-primary dark:bg-transparent dark:text-coolgreen dark:border-coolgreen bg-primary text-white">
                                    <option :value="file.name" v-for="file in selectableTifFiles">
                                        {{ file.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <hr class="my-4">
                    <h2 class="text-lg font-semibold text-primary dark:text-slate-300">Which spectral indices to
                        compute?</h2>
                    <p class="text-gray-400 text-center">Based on the selected bands, we can compute the following
                        spectral indices. Select the ones you want to compute.</p>
                    <div class="flex flex-col">
                        <div class="flex">
                            <div class="form-control">
                                <label class="cursor-pointer label">
                                    <input type="checkbox" v-model="uploadStore.useNdvi"
                                        class="checkbox checkbox-primary" />
                                    <span class="label-text ml-9 dark:text-slate-300">NDVI</span>
                                </label>
                            </div>
                        </div>
                        <div class="flex">
                            <div class="form-control">
                                <label class="cursor-pointer label">
                                    <input type="checkbox" v-model="uploadStore.useNdwi"
                                        class="checkbox checkbox-primary" />
                                    <span class="label-text ml-9 dark:text-slate-300">NDWI</span>
                                </label>
                            </div>
                        </div>
                        <div class="flex">
                            <div class="form-control">
                                <label class="cursor-pointer label">
                                    <input type="checkbox" v-model="uploadStore.useAgriculture"
                                        class="checkbox checkbox-primary" />
                                    <span class="label-text ml-9 dark:text-slate-300">Agriculture</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { useUploadStore } from '~/store/uploadStore';
import config, { type Band } from '~/config/config';
import { fromArrayBuffer } from 'geotiff';
import _ from 'lodash'
import { parse } from 'vue/compiler-sfc';
import { SatelliteType } from '~/types';

const uploadStore = useUploadStore();

const bands = ref<Band[]>([]);

const selectableTifFiles = ref<File[]>([]);

const router = useRouter();

function probablyHasBandName(bandName: string): string {

    // check if assignmnet is in the cache
    let bandAssignments = localStorage.getItem('bandAssignments');
    if (bandAssignments) {
        let parsedBandAssignments = JSON.parse(bandAssignments);
        if (uploadStore.selectedSatellite == SatelliteType.sentinels2l2a) {

            let s2aPreAssignment = parsedBandAssignments['sentinels2a'];

            if (!_.isEmpty(s2aPreAssignment)) {
                for (let band of bands.value) {
                    if (band.name === bandName) {
                        for (const [key, value] of Object.entries(s2aPreAssignment)) {
                            if (band.name === key) {
                                let foundFn = uploadStore.uploadedFiles.find(x => x.name == value);
                                if (foundFn) {
                                    return foundFn.name;
                                }
                            }
                        }
                    }
                };
            }
        } else if (uploadStore.selectedSatellite == SatelliteType.landsat8toa) {
            let l8PreAssignment = parsedBandAssignments['landsat8'];
            if (!_.isEmpty(l8PreAssignment)) {
                for (let band of bands.value) {
                    if (band.name === bandName) {
                        for (const [key, value] of Object.entries(l8PreAssignment)) {
                            if (band.name === key) {
                                let foundFn = uploadStore.uploadedFiles.find(x => x.name == value);
                                if (foundFn) {
                                    return foundFn.name;
                                }
                            }
                        }
                    }
                };
            }
        } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
            let s2cPreAssignment = parsedBandAssignments['sentinels2c'];
            if (!_.isEmpty(s2cPreAssignment)) {
                for (let band of bands.value) {
                    if (band.name === bandName) {
                        for (const [key, value] of Object.entries(s2cPreAssignment)) {
                            if (band.name === key) {
                                let foundFn = uploadStore.uploadedFiles.find(x => x.name == value);
                                if (foundFn) {
                                    return foundFn.name;
                                }
                            }
                        }
                    }
                };
            }
        }
        else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
            let l8srPreAssignment = parsedBandAssignments['landsat8sr'];
            if (!_.isEmpty(l8srPreAssignment)) {
                for (let band of bands.value) {
                    if (band.name === bandName) {
                        for (const [key, value] of Object.entries(l8srPreAssignment)) {
                            if (band.name === key) {
                                let foundFn = uploadStore.uploadedFiles.find(x => x.name == value);
                                if (foundFn) {
                                    return foundFn.name;
                                }
                            }
                        }
                    }
                }
            };
        }
    }

    if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
        let bandSplit = bandName.split(' ');  // e.g. Band 1
        let candidate1 = 'B' + bandSplit[1] + '.tif';
        let candidate2 = 'B' + bandSplit[1] + '.tiff';

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (filename.includes(candidate1) || filename.includes(candidate2)) {
                uploadStore.sentinels2aAssignment[bandName] = filename;
                return filename;
            }
        }

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (filename.includes(bandSplit[1])) {
                uploadStore.sentinels2aAssignment[bandName] = filename;
                return filename;
            }
        }

        const regex1 = new RegExp(`(^|[^0-9])${bandSplit[1]}([^0-9]|$)`);
        const regex2 = new RegExp(`(^|[^0-9])0${bandSplit[1]}([^0-9]|$)`);
        // return regex.test(str);


        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (regex1.test(filename) || regex2.test(filename)) {
                uploadStore.sentinels2aAssignment[bandName] = filename;
                return filename;
            }
        }

    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {
        let bandSplit = bandName.split(' ');  // e.g. Band 1
        let candidate1 = 'B' + bandSplit[1] + '.tif';
        let candidate2 = 'B' + bandSplit[1] + '.tiff';

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (filename.includes(candidate1) || filename.includes(candidate2)) {
                uploadStore.landsat8toaAssignment[bandName] = filename;
                return filename;
            }
        }

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (filename.includes(bandSplit[1])) {
                uploadStore.landsat8toaAssignment[bandName] = filename;
                return filename;
            }
        }

        const regex1 = new RegExp(`(^|[^0-9])${bandSplit[1]}([^0-9]|$)`);
        const regex2 = new RegExp(`(^|[^0-9])0${bandSplit[1]}([^0-9]|$)`);
        // return regex.test(str);

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (regex1.test(filename) || regex2.test(filename)) {
                uploadStore.sentinels2aAssignment[bandName] = filename;
                return filename;
            }
        }

    } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
        let bandSplit = bandName.split(' ');  // e.g. Band 1
        let candidate1 = 'B' + bandSplit[1] + '.tif';
        let candidate2 = 'B' + bandSplit[1] + '.tiff';

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (filename.includes(candidate1) || filename.includes(candidate2)) {
                uploadStore.sentinels2cAssignment[bandName] = filename;
                return filename;
            }
        }

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (filename.includes(bandSplit[1])) {
                uploadStore.sentinels2cAssignment[bandName] = filename;
                return filename;
            }
        }

        const regex1 = new RegExp(`(^|[^0-9])${bandSplit[1]}([^0-9]|$)`);
        const regex2 = new RegExp(`(^|[^0-9])0${bandSplit[1]}([^0-9]|$)`);
        // return regex.test(str);

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (regex1.test(filename) || regex2.test(filename)) {
                uploadStore.sentinels2cAssignment[bandName] = filename;
                return filename;
            }
        }

    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
        let bandSplit = bandName.split(' ');  // e.g. Band 1
        let candidate1 = 'B' + bandSplit[1] + '.tif';
        let candidate2 = 'B' + bandSplit[1] + '.tiff';

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (filename.includes(candidate1) || filename.includes(candidate2)) {
                uploadStore.landsat8srAssignment[bandName] = filename;
                return filename;
            }
        }

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (filename.includes(bandSplit[1])) {
                uploadStore.landsat8srAssignment[bandName] = filename;
                return filename;
            }
        }

        const regex1 = new RegExp(`(^|[^0-9])${bandSplit[1]}([^0-9]|$)`);
        const regex2 = new RegExp(`(^|[^0-9])0${bandSplit[1]}([^0-9]|$)`);
        // return regex.test(str);

        for (let i = 0; i < selectableTifFiles.value.length; i++) {
            let filename = selectableTifFiles.value[i].name;
            if (regex1.test(filename) || regex2.test(filename)) {
                uploadStore.sentinels2aAssignment[bandName] = filename;
                return filename;
            }
        }
    }


    return '';

}

function saveToCache() {

    let bandAssignments = localStorage.getItem('bandAssignments');

    if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
        if (bandAssignments) {
            let parsedBandAssignments: Record<string, any> = JSON.parse(bandAssignments);

            if (_.has(parsedBandAssignments, 'sentinels2a')) {
                let s2aPreAssignment: Record<string, string> = parsedBandAssignments['sentinels2a'];

                s2aPreAssignment = _.cloneDeep(uploadStore.sentinels2aAssignment);
                parsedBandAssignments['sentinels2a'] = s2aPreAssignment;

                // save
                localStorage.setItem('bandAssignments', JSON.stringify(parsedBandAssignments));
            } else {
                parsedBandAssignments['sentinels2a'] = _.cloneDeep(uploadStore.sentinels2aAssignment);
                // save
                localStorage.setItem('bandAssignments', JSON.stringify(parsedBandAssignments));
            }

        } else {
            let newAssignment = {
                'sentinels2a': _.cloneDeep(uploadStore.sentinels2aAssignment)
            };
            localStorage.setItem('bandAssignments', JSON.stringify(newAssignment));
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {
        if (bandAssignments) {
            let parsedBandAssignments: Record<string, any> = JSON.parse(bandAssignments);

            if (_.has(parsedBandAssignments, 'landsat8')) {
                let l8PreAssignment: Record<string, string> = parsedBandAssignments['landsat8'];

                l8PreAssignment = _.cloneDeep(uploadStore.landsat8toaAssignment);
                parsedBandAssignments['landsat8'] = l8PreAssignment;

                // save
                localStorage.setItem('bandAssignments', JSON.stringify(parsedBandAssignments));
            } else {
                parsedBandAssignments['landsat8'] = _.cloneDeep(uploadStore.landsat8toaAssignment);
                // save
                localStorage.setItem('bandAssignments', JSON.stringify(parsedBandAssignments));
            }

        } else {
            let newAssignment = {
                'landsat8': _.cloneDeep(uploadStore.landsat8toaAssignment)
            };
            localStorage.setItem('bandAssignments', JSON.stringify(newAssignment));
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
        if (bandAssignments) {
            let parsedBandAssignments: Record<string, any> = JSON.parse(bandAssignments);

            if (_.has(parsedBandAssignments, 'sentinels2c')) {
                let s2cPreAssignment: Record<string, string> = parsedBandAssignments['sentinels2c'];

                s2cPreAssignment = _.cloneDeep(uploadStore.sentinels2cAssignment);
                parsedBandAssignments['sentinels2c'] = s2cPreAssignment;

                // save
                localStorage.setItem('bandAssignments', JSON.stringify(parsedBandAssignments));
            } else {
                parsedBandAssignments['sentinels2c'] = _.cloneDeep(uploadStore.sentinels2cAssignment);
                // save
                localStorage.setItem('bandAssignments', JSON.stringify(parsedBandAssignments));
            }

        } else {
            let newAssignment = {
                'sentinels2c': _.cloneDeep(uploadStore.sentinels2cAssignment)
            };
            localStorage.setItem('bandAssignments', JSON.stringify(newAssignment));
        }
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
        if (bandAssignments) {
            let parsedBandAssignments: Record<string, any> = JSON.parse(bandAssignments);

            if (_.has(parsedBandAssignments, 'landsat8sr')) {
                let l8srPreAssignment: Record<string, string> = parsedBandAssignments['landsat8sr'];

                l8srPreAssignment = _.cloneDeep(uploadStore.landsat8srAssignment);
                parsedBandAssignments['landsat8sr'] = l8srPreAssignment;

                // save
                localStorage.setItem('bandAssignments', JSON.stringify(parsedBandAssignments));
            } else {    
                parsedBandAssignments['landsat8sr'] = _.cloneDeep(uploadStore.landsat8srAssignment);
                // save
                localStorage.setItem('bandAssignments', JSON.stringify(parsedBandAssignments));
            }
        } else {
            let newAssignment = {
                'landsat8sr': _.cloneDeep(uploadStore.landsat8srAssignment)
            };
            localStorage.setItem('bandAssignments', JSON.stringify(newAssignment));
        }
    }

    // if (uploadStore.selectedSatellite === 'sentinel-2') {
    //     // check if assignmnet is in the cache
    //     if (bandAssignments) {
    //         let parsedBandAssignments: Record<string, any> = JSON.parse(bandAssignments);

    //         if (_.has(parsedBandAssignments, 'sentinels2a')) {
    //             let s2aPreAssignment: Record<string, string> = parsedBandAssignments['sentinels2a'];

    //             s2aPreAssignment = _.cloneDeep(uploadStore.sentinels2aAssignment);
    //         } else {
    //             parsedBandAssignments['sentinels2a'] = _.cloneDeep(uploadStore.sentinels2aAssignment);
    //         }

    //     } else {
    //         bandAssignments = {};
    //         bandAssignments['sentinels2a'] = _.cloneDeep(uploadStore.sentinels2aAssignment);

    //     }
    // }
    // localStorage.setItem('bandAssignments', JSON.stringify(bandAssignments));
}

const loadGeoTIFF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const width = image.getWidth();
    const height = image.getHeight();
    const rasters = await image.readRasters();
    return { width, height, rasters };
};

onMounted(async () => {


    if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
        bands.value = config['sentinel-s2-l1c-bands'];
    } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
        bands.value = config['sentinel-s2-l2a-bands'];
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {
        bands.value = config['landsat-8-toa-bands'];
    } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
        bands.value = config['landsat-8-sr-bands'];
    }

    let files = [];

    let folderName = ''
    for (let i = 0; i < uploadStore.uploadedFiles.length; i++) {
        let file = uploadStore.uploadedFiles[i];
        if (folderName === '') {
            folderName = file.webkitRelativePath.split('/')[1];
        } else if (folderName !== file.webkitRelativePath.split('/')[1]) {
            break;

        }
        if (file.name.endsWith('.tif') || file.name.endsWith('.tiff')) {
            const { width, height, rasters } = await loadGeoTIFF(file);
            if (rasters.length > 1) {
                for (let j = 0; j < rasters.length; j++) {
                    let modifiedFile = new File([file], `[Channel ${j}] ${file.name}`, { type: file.type });
                    files.push(modifiedFile);
                }
            } else {
                files.push(file);
            }
        }
    }

    selectableTifFiles.value = files;

    bands.value.forEach(band => {
        const initialSelection = probablyHasBandName(band.name);
        if (initialSelection) {
            if (uploadStore.selectedSatellite === SatelliteType.landsat8toa) {
                uploadStore.landsat8toaAssignment[band.name] = initialSelection;
            } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l2a) {
                uploadStore.sentinels2aAssignment[band.name] = initialSelection;
            } else if (uploadStore.selectedSatellite === SatelliteType.sentinels2l1c) {
                uploadStore.sentinels2cAssignment[band.name] = initialSelection;
            } else if (uploadStore.selectedSatellite === SatelliteType.landsat8sr) {
                uploadStore.landsat8srAssignment[band.name] = initialSelection;
            }
        }
    });

});
</script>