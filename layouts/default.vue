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

    <body class="darkbg">
        <div class="drawer drawer-mobile">
            <!-- Drawer Content -->
            <input id="my-drawer" type="checkbox" class="drawer-toggle" v-model="drawerOpen" />
            <div class="drawer-content flex flex-col">
                <!-- Navbar -->
                <div class="navbar bg-base-100 dark:bg-transparent dark:text-coolgreen">
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
                <ul class="menu w-80 bg-white h-full text-base-content pt-5">
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

import { ref } from "vue";
import { version } from "~/package.json";

// State for drawer visibility
const drawerOpen = ref(false);

</script>

<style>
/* Dark mode */
@media (prefers-color-scheme: dark) {
    .darkbg {
        background: radial-gradient(circle at bottom, navy 0, black 100%);
    }
}
</style>