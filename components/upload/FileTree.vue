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
    <div v-if="tree">
        <ul class="tree">
            <UploadTreeNode :node="tree" name="root" />
        </ul>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import TreeNode from "./TreeNode.vue";
import { useUploadStore } from "~/store/uploadStore";

interface UploadedFile {
    webkitRelativePath: string;
}

interface TreeNode {
    [key: string]: TreeNode | null;
}

const props = defineProps({
    uploadedFiles: {
        type: Array as PropType<UploadedFile[]>,
        required: true,
    },
});

const buildTree = (files: UploadedFile[]): TreeNode => {
    const tree: TreeNode = {};
    files.forEach((file) => {
        const parts = file.webkitRelativePath.split("/");
        let current = tree;
        parts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = index === parts.length - 1 ? null : {};
            }
            current = current[part] as TreeNode;
        });
    });
    return tree;
};

// const tree = computed(() => buildTree(props.uploadedFiles));

const tree = ref<TreeNode | null>(null);

const uploadStore = useUploadStore();

watch(() => uploadStore.uploadedFiles, (newFiles) => {
    tree.value = buildTree(newFiles);
});
</script>