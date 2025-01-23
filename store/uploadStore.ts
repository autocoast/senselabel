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

import { defineStore } from "pinia";
import { SatelliteType, type UploadStore, type UploadStoreActions, type UploadStoreGetters } from "~/types";
// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export const useUploadStore = defineStore<'uploadStore', UploadStore, UploadStoreGetters, UploadStoreActions>('uploadStore', {
    state: () => ({
        singleFilesUpload: true,
        multipleFilesUpload: false,
        uploadedFiles: [] as File[],
        selectedSatellite: SatelliteType.sentinels2l2a as SatelliteType,
        useNdvi: true,
        useNdwi: true,
        useAgriculture: true,
        sentinels2aAssignment: {
            'Band 1': '',
            'Band 2': '',
            'Band 3': '',
            'Band 4': '',
            'Band 5': '',
            'Band 6': '',
            'Band 7': '',
            'Band 8': '',
            'Band 8a': '',
            'Band 9': '',
            'Band 11': '',
            'Band 12': ''
        } as Record<string, string>,
        sentinels2cAssignment: {
            'Band 1': '',
            'Band 2': '',
            'Band 3': '',
            'Band 4': '',
            'Band 5': '',
            'Band 6': '',
            'Band 7': '',
            'Band 8': '',
            'Band 8a': '',
            'Band 9': '',
            'Band 10': '',
            'Band 11': '',
            'Band 12': ''
        } as Record<string, string>,
        landsat8toaAssignment: {
            'Band 1': '',
            'Band 2': '',
            'Band 3': '',
            'Band 4': '',
            'Band 5': '',
            'Band 6': '',
            'Band 7': '',
            'Band 8': '',
            'Band 9': '',
            'Band 10': '',
            'Band 11': ''
        } as Record<string, string>,
        classes: [
            {
                id: 1,
                className: 'Building',
                color: '#FF0000'
            }, {
                id: 2,
                className: 'Vegetation',
                color: '#44AA44'
            }, {
                id: 3,
                className: 'Water',
                color: '#0000FF'
            },
            {
                id: 4,
                className: 'Bare Ground',
                color: '#FFE000'
            }
        ] as {
            id: number;
            className: string,
            color: string
        }[]
    }),
    actions: {
        hexColorToClassNumber(hexColor: string) {
            let found = this.classes.find((c) => c.color.toLowerCase() === hexColor.toLowerCase());
            if (found) {
                return found.id;
            }
            return 0;
        }
    },
})