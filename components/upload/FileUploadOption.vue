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
    <div
        class="dark:bg-transparent dark:text-coolgreen border-dashed border-gray-200 dark:border-coolgreen border cursor-pointer rounded-md card shadow-md bg-base-100 w-50 transition-transform transform hover:bg-black-100 hover:shadow-2xl hover:shadow-black-300 duration-200">
        <div class="card-body">
            <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">{{ title }}</h2>
                <slot name="icon"></slot>
            </div>
            <p class="text-sm">{{ description }}</p>
            <pre class="text-xs leading-tight">{{ details }}</pre>
            <slot name="actions">
                <Button @click="handleExampleButtonClick">Example</Button>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: String,
    description: String,
    details: String,
    onClick: {
        type: Function,
        default: null,
    },
    onExampleClick: {
        type: Function,
        default: null,
    }
});

function handleExampleClick() {
    if (props.onExampleClick) {
        props.onExampleClick();
    }
}

function handleClick() {
    if (props.onClick) {
        props.onClick();
    }
}
function handleExampleButtonClick() {
    window.location.href = 'https://senselabel.vercel.app/editor?example=true';
}
</script>