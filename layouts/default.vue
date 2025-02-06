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

    <body :class="[themeStore.theme === 'dark' ? 'darkbg dark' : 'light']">
        <div class="drawer drawer-mobile">
            <!-- Drawer Content -->
            <input id="my-drawer" type="checkbox" class="drawer-toggle" v-model="drawerOpen" />
            <div class="drawer-content flex flex-col">
                <!-- Navbar -->
                <div class="navbar bg-base-100 dark:bg-gray-800 dark:text-white">
                    <!-- <div class="flex-none">
                        <label for="my-drawer" class="btn btn-ghost swap swap-rotate">
                            
                            <input type="checkbox" />

                            
                            <svg class="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                viewBox="0 0 512 512">
                                <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
                            </svg>

                            
                            <svg class="swap-on fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                viewBox="0 0 512 512">
                                <polygon
                                    points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                            </svg>
                        </label>
                    </div> -->
                    <div class="flex-1">
                        <a class="btn btn-ghost normal-case text-xl" href="/">SenseLabel</a>
                        <span>v{{ version }}</span>
                    </div>

                    <!-- Theme toggle button -->
                    <label class="swap swap-rotate">
                        <input type="checkbox" @click="themeStore.toggleTheme()" :checked="themeStore.theme === 'dark'" />
                        
                        <svg class="swap-on h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                        </svg>

                        <svg class="swap-off h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                        </svg>
                    </label>

                    <!-- <div class="flex-none">
                        <button class="btn btn-square btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                class="inline-block w-6 h-6 stroke-current">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z">
                                </path>
                            </svg>
                        </button>
                    </div> -->
                </div>

                <!-- Page Content -->
                <main class="p-1">
                    <slot></slot>
                </main>
            </div>

            <!-- Sidebar -->
            <div class="drawer-side">
                <label for="my-drawer" class="drawer-overlay"></label>
                <ul class="menu w-80 bg-white dark:bg-gray-800 dark:text-white h-full text-base-content pt-5">
                    <!-- Sidebar content here -->
                    <li class="menu-title">
                        <span>Navigation</span>
                    </li>
                    <li><a href="#upload-files">Upload Files</a></li>
                    <li><a href="#define-classes">Define Classes</a></li>
                    <li><a href="#configure-layers">Configure Layers</a></li>
                    <li class="menu-title">
                        <span>Settings</span>
                    </li>
                    <li><a href="#profile">Profile</a></li>
                    <li><a href="#logout">Logout</a></li>
                </ul>
            </div>
        </div>
    </body>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { version } from "~/package.json";
import { useThemeStore } from '~/stores/theme';

const themeStore = useThemeStore();
const drawerOpen = ref(false);

onMounted(() => {
    themeStore.initTheme();
});
</script>

<style>
/* Update dark mode styles */
.darkbg {
    background: radial-gradient(circle at bottom, navy 0, black 100%);
}

/* Add some transition for smooth theme switching */
body {
    transition: background-color 0.3s ease;
}

.dark .navbar,
.dark .drawer-side ul {
    transition: background-color 0.3s ease, color 0.3s ease;
}
</style>