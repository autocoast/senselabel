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
    <li>
        <details class="dark:text-coolgreen text-md" v-if="props.node && typeof props.node === 'object'" open>
            <summary class="dark:text-coolgreen">{{ name }}</summary>
            <ul>
                <TreeNode v-for="(child, childName) in props.node" :key="childName" :node="child"
                    :name="childName + ''" />
            </ul>
        </details>
        <span v-else>{{ name }}</span>
    </li>
</template>

<script lang="ts" setup>
interface TreeNode {
    [key: string]: TreeNode | null;
}

const props = defineProps({
    node: {
        type: [Object, null] as PropType<TreeNode | null>,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
});

watch(() => props.node, () => {

});

</script>

<style>
.tree {
    --spacing: 1.5rem;
    --radius: 10px;
}

.tree li {
    display: block;
    position: relative;
    padding-left: calc(2 * var(--spacing) - var(--radius) - 2px);
}

.tree ul {
    margin-left: calc(var(--radius) - var(--spacing));
    padding-left: 0;
}

.tree ul li {
    border-left: 2px solid #ddd;
}

.tree ul li:last-child {
    border-color: transparent;
}

.tree ul li::before {
    content: '';
    display: block;
    position: absolute;
    top: calc(var(--spacing) / -2);
    left: -2px;
    width: calc(var(--spacing) + 2px);
    height: calc(var(--spacing) + 1px);
    border: solid #ddd;
    border-width: 0 0 2px 2px;
}

.tree summary {
    display: block;
    cursor: pointer;
}

.tree summary::marker,
.tree summary::-webkit-details-marker {
    display: none;
}

.tree summary:focus {
    outline: none;
}

.tree summary:focus-visible {
    outline: 1px dotted #000;
}

.tree li::after,
.tree summary::before {
    content: '';
    display: block;
    position: absolute;
    top: calc(var(--spacing) / 2 - var(--radius));
    left: calc(var(--spacing) - var(--radius) - 1px);
    width: calc(2 * var(--radius));
    height: calc(2 * var(--radius));
    border-radius: 50%;
    background: #8eff6f;
}

.tree summary::before {
    z-index: 1;
    background: rgb(93, 223, 93) url('expand-collapse.svg') 0 0;
}

.tree details[open]>summary::before {
    background-position: calc(-2 * var(--radius)) 0;
}
</style>