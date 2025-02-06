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
    <div :class="[themeStore.theme === 'dark' ? 'dark' : 'light']" class="min-h-screen">
        <!-- Main Content -->
        <main class="dark:bg-gray-900 bg-gray-50 min-h-screen">
            <slot></slot>
        </main>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useThemeStore } from '~/stores/theme';

const themeStore = useThemeStore();

onMounted(() => {
    themeStore.initTheme();
});
</script>

<style>
/* Theme transitions */
.dark,
.light {
    transition: background-color 0.3s ease;
}

/* Sidebar styles */
/* Left sidebar */
.dark .left-sidebar {
    @apply bg-gray-800 text-white border-r border-gray-700;
}

.light .left-sidebar {
    @apply bg-white text-gray-800 border-r border-gray-200;
}

/* Right sidebar */
.dark .right-sidebar {
    @apply bg-gray-800 text-white border-l border-gray-700;
}

.light .right-sidebar {
    @apply bg-white text-gray-800 border-l border-gray-200;
}

/* Tool buttons in sidebars */
.dark .sidebar-button {
    @apply bg-gray-700 hover:bg-primary text-white border border-gray-600;
}

.light .sidebar-button {
    @apply bg-white hover:bg-gray-100 text-gray-800 border border-gray-200;
}

/* Layer panels */
.dark .layer-panel {
    @apply bg-gray-800 text-white;
}

.light .layer-panel {
    @apply bg-white text-gray-800;
}

/* Drawing tools panel */
.dark .tools-panel {
    @apply bg-gray-800 text-white;
}

.light .tools-panel {
    @apply bg-white text-gray-800;
}

/* Controls and inputs */
.dark .control-input {
    @apply bg-gray-700 text-white border-gray-600;
}

.light .control-input {
    @apply bg-gray-50 text-gray-800 border-gray-200;
}

/* Layer controls */
.dark .layer-controls {
    @apply bg-gray-700 text-white;
}

.light .layer-controls {
    @apply bg-gray-50 text-gray-800;
}

/* Current class indicator */
.dark .current-class {
    @apply bg-primary text-white px-2 py-1 rounded;
}

.light .current-class {
    @apply bg-primary text-white px-2 py-1 rounded;
}

/* Sliders and range inputs */
.dark input[type="range"] {
    @apply bg-gray-700;
}

.light input[type="range"] {
    @apply bg-gray-100;
}

/* Common transitions */
.sidebar-button,
.layer-item,
.tools-panel,
.layer-panel,
.control-input {
    @apply transition-colors duration-200;
}

/* Hotkeys panel */
.dark .hotkeys-panel {
    @apply bg-gray-800 text-white border-gray-700;
}

.light .hotkeys-panel {
    @apply bg-white text-gray-800 border-gray-200;
}

/* Layer visibility and opacity controls */
.dark .layer-visibility,
.dark .layer-opacity {
    @apply text-white;
}

.light .layer-visibility,
.light .layer-opacity {
    @apply text-gray-800;
}

/* Tool specific controls */
.dark .tool-control {
    @apply bg-gray-700 text-white border-gray-600;
}

.light .tool-control {
    @apply bg-gray-50 text-gray-800 border-gray-200;
}
</style>
