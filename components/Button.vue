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

<script setup lang="ts">
interface Props {
  size?: "md" | "lg";
  block?: boolean;
  styleName?: "outline" | "primary" | "inverted";
  className?: string;
  [x: string]: any;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  styleName: "primary",
});

const size = props.size as keyof typeof sizes;

const sizes = {
  md: "px-5 py-2.5",
  lg: "px-6 py-3",
};

const styles = {
  outline: "border-2 border-black hover:bg-black text-black hover:text-white",
  primary:
    "bg-black text-white hover:bg-slate-900  border-2 border-transparent",
};
</script>

<template>
  <button :class="[
    'dark:text-coolgreen dark:bg-slate-900 dark:border-0 dark:hover:bg-slate-950 btn btn-primary w-full  hover:bg-slate-900',
    block && 'w-full',
    sizes[size],
    styles[styleName as keyof typeof styles],
    className,
  ]">
    <slot />
  </button>
</template>
