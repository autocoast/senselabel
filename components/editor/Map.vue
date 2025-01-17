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
    <!-- <client-only> -->
    <div id="map"></div>
    <!-- <canvas id="drawingCanvas"></canvas> -->
    <!-- </client-only> -->
</template>

<script lang="ts" setup>
import { useEditorStore } from '~/store/editorStore';



// import { useClient } from '#imports'

let savedState = {
    lat: 0,
    lng: 0,
    zoom: 0
};

const map: Ref<L.Map | null> = ref(null);

const editorStore = useEditorStore();

watch(() => editorStore.cornerCoordinates, () => {
    resetMap();
    if (editorStore.mapIsActive) {
        drawMap();
    } else {
        hideMap();
    }
});

async function drawMap() {

    document.getElementById('map')!.style.display = 'block';
    document.getElementById('map')!.style.pointerEvents = 'auto';

    if (typeof window !== 'undefined') {

        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        if (map.value === null) {
            let savedLon = savedState.lng;
            let savedLat = savedState.lat;

            if (savedLon === 0 && savedLat === 0) {
                map.value = L.map('map', {
                    center: [editorStore.cornerCoordinates[0].y, editorStore.cornerCoordinates[0].x],
                    zoom: 13
                });
            } else {
                map.value = L.map('map', {
                    center: [savedLat, savedLon],
                    zoom: savedState.zoom
                });
            }


            L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.google.com">Google Maps</a>'
            }).addTo(map.value);
            // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            //     maxZoom: 19,
            //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            // }).addTo(map.value);
        }


        if (map.value) {
            map.value.on('contextmenu', (event) => {
                const { lat, lng } = event.latlng;
                showContextMenu(editorStore.cornerCoordinates[0].y, editorStore.cornerCoordinates[0].x);
            });

            latLngBounds.value = L.latLngBounds([
                [editorStore.cornerCoordinates[0].y, editorStore.cornerCoordinates[0].x],
                [editorStore.cornerCoordinates[3].y, editorStore.cornerCoordinates[3].x]
            ]);
            // let latLngBoundsPatch = L.latLngBounds(patchMapBounds.value);

            L.rectangle(latLngBounds.value, { fill: false }).addTo(map.value);

        }
    }
}

const latLngBounds: Ref<L.LatLngBounds | null> = ref(null);

function resetMap(forgetSavedState: boolean = false) {
    try {
        if (forgetSavedState) {
            savedState = {
                lat: 0,
                lng: 0,
                zoom: 0
            };
        }

        map.value!.remove();
        map.value = null;
    } catch (error: any) {
    }
    if (map.value !== null) {
        map.value = null;
        latLngBounds.value = null;

    }
}

async function drawOverlay() {

    const L = await import('leaflet'); // Dynamically import Leaflet
    await import('leaflet/dist/leaflet.css'); // Dynamically import Leaflet CSS

    const canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
    const bounds: L.LatLngBounds = L.latLngBounds([[40.799311, -74.118464], [40.68202047785919, -74.33]]);
    canvas.width = 800;  // Adjust size as needed
    canvas.height = 800; // Adjust size as needed
    let canvasOverlay: L.ImageOverlay | null = null;
    if (map.value) {
        const canvasDataUrl = canvas.toDataURL();
        canvasOverlay = L.imageOverlay(canvasDataUrl, bounds, {
            interactive: true
        }).addTo(map.value);
    }
}

watch(() => editorStore.redrawMap, () => {
    drawMap();
});

watch(() => editorStore.redrawOverlay, () => {
    drawOverlay();
});

watch(() => editorStore.mapIsActive, active => {
    if (!active) {
        hideMap();
    } else {
        resetMap();
        drawMap();
    }
});


function hideMap() {
    if (map.value) {
        let center = map.value.getCenter();
        let zoom = map.value.getZoom();

        // Save these values for later
        savedState = {
            lat: center.lat,
            lng: center.lng,
            zoom: zoom
        };
    }
    document.getElementById('map')!.style.display = 'none';
    document.getElementById('map')!.style.pointerEvents = 'none';
}

function showContextMenu(lat: number, lng: number) {
    // For simplicity, using browser's context menu
    const navigate = confirm(`Do you want to navigate to this location on Google Maps?\nLatitude: ${lat}\nLongitude: ${lng}`);
    if (navigate) {
        window.open(`https://www.google.com/maps/?q=${lat},${lng}`, '_blank');
    }
}

// if (useClient()) {
onMounted(async () => {

    // drawMap();

    // document.getElementById('map')!.style.display = 'block';
    // document.getElementById('map')!.style.pointerEvents = 'auto';

    // const L = await import('leaflet'); // Dynamically import Leaflet
    // await import('leaflet/dist/leaflet.css'); // Dynamically import Leaflet CSS

    // if (map.value) {
    //     map.value.on('contextmenu', (event) => {
    //         console.log(event);
    //         const { lat, lng } = event.latlng;
    //         showContextMenu(lat, lng);
    //     });

    // latLngBounds.value = L.latLngBounds([
    //     [image!.leftLower[1], image!.leftLower[0]],
    //     [image!.rightUpper[1], image!.rightUpper[0]],
    //     // [65.52716011280192, 22.178610070089565],
    //     // [65.5334762650674, 22.193766993119137]
    // ]);
    // L.rectangle(latLngBounds.value, { fill: false }).addTo(map.value);
    //     if (savedState.lat === 0 && savedState.lng === 0 && savedState.zoom === 0) {
    //     map.value.setView([image!.leftLower[1], image!.leftLower[0]], 13);
    // } else {
    //     map.value.setView([savedState.lat, savedState.lng], savedState.zoom);
    // }

    // }

    // if (typeof window !== 'undefined') {
    //     if (map.value === null && typeof window !== 'undefined') {
    //         map.value = L.map('map', {
    //             center: [40.799311, -74.118464],
    //             zoom: 13
    //         })
    //         L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //             maxZoom: 19,
    //             attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    //         }).addTo(map.value);


    //         // const bounds: L.LatLngBoundsLiteral = [[51.49, -0.1], [51.52, -0.08]];
    //         const bounds: L.LatLngBounds = L.latLngBounds([[40.799311, -74.118464], [40.68202047785919, -74.33]]);
    //         const canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
    //         if (canvas && map.value !== null) {

    //             canvas.width = 800;  // Adjust size as needed
    //             canvas.height = 800; // Adjust size as needed
    //             // canvas.style.position = 'absolute';
    //             // canvas.style.zIndex = '1000';
    //             // canvas.style.backgroundColor = 'red'; // For debugging
    //             const canvasDataUrl = canvas.toDataURL();

    //             // const image = new Image();
    //             // image.src = canvasDataUrl;
    //             // image.onload = () => {
    //             //     const canvasOverlay = L.imageOverlay(canvasDataUrl, bounds, {
    //             //         interactive: true
    //             //     }).addTo(map.value);
    //             // }

    //             const imageUrl = 'https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg';

    //             let canvasOverlay: L.ImageOverlay | null = null;
    //             setTimeout(() => {
    //                 if (map.value) {
    //                     console.log('b')
    //                     const canvasDataUrl = canvas.toDataURL();
    //                     canvasOverlay = L.imageOverlay(canvasDataUrl, bounds, {
    //                         interactive: true
    //                     }).addTo(map.value);
    //                 }
    //             }, 2000);


    //             map.value.on('move zoom', () => {
    //                 if (canvasOverlay !== null) {
    //                     // const newBounds = map.value!.getBounds();
    //                     canvasOverlay.setBounds(bounds);
    //                 }
    //             });


    //             // canvas.addEventListener('mouseenter', () => map.value.dragging.disable());
    //             // canvas.addEventListener('mouseleave', () => map.dragging.enable());

    //         }



    //     }
    // }
});
// }


</script>

<style>
#map {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    /* z-index: 1000; */
}
</style>