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
    <div :class="[themeStore.theme === 'dark' ? 'dark' : 'light']">
        <div class="drawer drawer-mobile">
            <!-- Drawer Content -->
            <input id="my-drawer" type="checkbox" class="drawer-toggle" v-model="navStore.editorDrawerOpen" />
            <div class="drawer-content flex flex-col dark:bg-gray-900 bg-gray-50">
                <!-- Navbar -->
                <div class="navbar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex-none">
                        <label for="my-drawer" class="btn btn-ghost swap swap-rotate">
                            <!-- this hidden checkbox controls the state -->
                            <input type="checkbox" />

                            <!-- hamburger icon -->
                            <svg class="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                viewBox="0 0 512 512">
                                <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
                            </svg>

                            <!-- close icon -->
                            <svg class="swap-on fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                viewBox="0 0 512 512">
                                <polygon
                                    points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                            </svg>
                        </label>
                    </div>
                    <div class="flex-1">
                        <a class="btn btn-ghost normal-case text-xl text-gray-800 dark:text-white" href="/">SenseLabel</a>
                        <span class="text-gray-800 dark:text-white">v{{ version }}</span>
                    </div>
                    <p class="text-gray-800 dark:text-white">{{ _.has(route.query, 'example') ? 'Example file' : 'Current file: ' +
                        navStore.links[navStore.currentLinkIndex] }}</p>

                    <!-- Theme toggle button -->
                    <label class="swap swap-rotate ml-4">
                        <input type="checkbox" @click="themeStore.toggleTheme()" :checked="themeStore.theme === 'dark'" />
                        <svg class="swap-on h-6 w-6 fill-current text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                        </svg>
                        <svg class="swap-off h-6 w-6 fill-current text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                        </svg>
                    </label>
                </div>

                <!-- Page Content -->
                <main class="p-1">
                    <slot></slot>
                </main>
            </div>

            <!-- Sidebar -->
            <div class="drawer-side z-50">
                <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
                <ul class="menu bg-white dark:bg-gray-800 overflow-hidden min-h-full w-80 p-4 border-r border-gray-200 dark:border-gray-700">
                    <!-- Move title and total files to the top -->
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-lg font-semibold text-gray-800 dark:text-white">Available Files</span>
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Total: {{ navStore.links.length }}
                        </span>
                    </div>
                    
                    <div class="divider my-2 dark:before:bg-gray-700 dark:after:bg-gray-700"></div>
                    
                    <!-- Update list items -->
                    <li v-for="(link, index) in navStore.links"
                        :key="index"
                        :class="[
                            navStore.editorDrawerOpen ? 'block' : 'hidden',
                            'mb-2 rounded-lg transition-all duration-200 group',
                            navStore.currentLinkIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''
                        ]"
                        @click="() => {
                            navStore.currentLinkIndex = index;
                            navStore.editorDrawerOpen = false;
                        }">
                        <a class="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <Icon name="mdi:file-image" class="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                            <!-- Filename container with hover effect -->
                            <div class="overflow-hidden relative flex-1">
                                <span class="text-gray-700 dark:text-gray-200 text-ellipsis overflow-hidden whitespace-nowrap block">
                                    {{ link }}
                                </span>
                                <!-- Hover tooltip -->
                                <div class="opacity-0 group-hover:opacity-100 absolute left-0 -top-8 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded text-sm whitespace-nowrap transition-opacity duration-200 z-50">
                                    {{ link }}
                                </div>
                            </div>
                            <span v-if="navStore.currentLinkIndex === index" 
                                class="ml-2 text-primary flex-shrink-0">
                                <Icon name="mdi:check" class="w-5 h-5" />
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>

import { useNavStore } from "~/store/navStore";
import { useThemeStore } from "~/stores/theme";
import { version } from "~/package.json";
import _ from "lodash";

const route = useRoute();

// State for drawer visibility
const navStore = useNavStore();
const themeStore = useThemeStore();

// Initialize theme on component mount
onMounted(() => {
    themeStore.initTheme();
});

</script>

<style>
/* Theme transitions */
.drawer-content,
.navbar,
.drawer-side,
.menu,
.btn-ghost,
a,
span,
p,
svg {
    @apply transition-colors duration-200;
}

/* Base styles */
.navbar.bg-base-100 {
    @apply bg-white dark:bg-gray-800;
}

.text-base-content {
    @apply text-gray-800 dark:text-white;
}

.drawer-content {
    @apply bg-gray-50 dark:bg-gray-900;
}

/* Menu styles */
.menu li a {
    @apply text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 relative;
}

.swap-rotate svg {
    @apply text-gray-800 dark:text-white;
}

/* Title and divider */
.menu-title {
    @apply text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-xs;
}

.divider {
    @apply my-2 h-px bg-gray-200 dark:bg-gray-700;
}

/* List item transitions and effects */
.menu li {
    @apply transition-all duration-200;
}

.menu li.active {
    @apply bg-gray-100 dark:bg-gray-700;
}

.menu li a svg {
    @apply transition-colors duration-200;
}

/* Group hover effects */
.group:hover {
    @apply z-10;
}

/* Ensure proper text overflow */
.text-ellipsis {
    text-overflow: ellipsis;
}

/* Tooltip transitions */
.group-hover\:opacity-100 {
    @apply transition-opacity duration-200;
}
</style>