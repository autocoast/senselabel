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
  <!-- Info Icon -->
  <!-- <button @click="openModal" class="btn btn-ghost btn-circle">
    
  </button> -->

  <!-- You can open the modal using ID.showModal() method -->
  <!-- Open the modal using ID.showModal() method -->
  <button class="btn btn-ghost btn-circle btn-primary" onclick="helpmodal.showModal()">
    <span class="material-icons text-primary">info</span>
  </button>
  <dialog id="helpmodal" class="modal">
    <div class="modal-box">
      <h3 class="text-xl">{{ props.title }}</h3>
      <p class="py-4 text-lg font-normal text-justify">{{ props.text }}</p>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

// State for modal visibility
const isModalOpen = ref(false);

// Props for passing in helper text
const props = defineProps({
  title: {
    type: String,
    required: true,
    default: "Help Modal",
  },
  text: {
    type: String,
    required: true,
    default: "This is a default help text. Please provide your own.",
  },
});

// Methods to open and close the modal
const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};
</script>