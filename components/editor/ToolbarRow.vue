<template>
    {{ toolbarButtons[0] }}
    <div class="m-1" />
    {{ toolbarButtons[1] }}
</template>

<script lang="ts" setup>
import { defineProps, type Component } from 'vue';

const props = defineProps<{
    toolbarButtons: Component[];
}>();

</script>

<style></style>
