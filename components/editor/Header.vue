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
        <div class="drawer drawer-mobile ">
            <!-- Drawer Content -->
            <input id="my-drawer" type="checkbox" class="drawer-toggle" v-model="navStore.editorDrawerOpen" />
            <div class="drawer-content flex flex-col">
                <!-- Navbar -->
                <div class="navbar bg-base-100 dark:bg-transparent dark:text-coolgreen">
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
                        <a class="btn btn-ghost normal-case text-xl" href="/">SenseLabel</a>
                        <span>v{{ version }}</span>
                    </div>
                    <p>{{ _.has(route.query, 'example') ? 'Example file' : 'Current file: ' +
                        navStore.links[navStore.currentLinkIndex] }}</p>
                </div>

                <!-- Page Content -->
                <main class="p-1">
                    <slot></slot>
                </main>
            </div>

            <!-- Sidebar Dummy -->
            <div class="drawer-side z-50">
                <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay "></label>
                <ul class="menu dark:bg-slate-950 bg-white overflow-hidden text-base-content min-h-full w-80 p-4">

                    <li class="dark:text-coolgreen" @click="() => {
                        navStore.currentLinkIndex = index;
                        navStore.editorDrawerOpen = false;

                    }" :class="navStore.editorDrawerOpen ? 'block' : 'hidden'" v-for="(link, index) in navStore.links"
                        :key="index">
                        <!-- <div class="tooltip tooltip-open" :data-tip="link"> -->
                        <a href="#">{{ link }}</a>
                        <!-- </div> -->
                    </li>

                </ul>
            </div>
        </div>
    </body>
</template>

<script lang="ts" setup>

import { useNavStore } from "~/store/navStore";
import { version } from "~/package.json";
import _ from "lodash";

const route = useRoute();

// State for drawer visibility
const navStore = useNavStore();

</script>

<style>
/* Dark mode */
@media (prefers-color-scheme: dark) {
    .darkbg {
        background: radial-gradient(circle at bottom, navy 0, black 100%);
    }
}
</style>