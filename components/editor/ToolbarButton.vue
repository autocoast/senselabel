<template>
  <div class="indicator">
    <span v-if="editorStore.showHotkeys"
      class="indicator-item badge badge-primary dark:bg-slate-900 dark:border-slate-900 dark:text-coolgreen">{{
        hotkeyNameToShortcutName(props.hotkeyString) }}</span>
    <button class="btn w-12"
      :class="props.condition ? ' bg-slate-200 text-slate-950 border-slate-200 dark:border-slate-950 dark:bg-coolgreen' : 'dark:text-coolgreen'"
      @click="props.clickEvent" :style="{ border: props.borderCondition ? props.borderStyle : 'none' }">
      <Icon :name="props.iconName" class="dark:text-coolgreen text-slate-600"
        :class="props.condition ? 'dark:text-slate-600' : ''" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useEditorStore } from '~/store/editorStore';
import { useSettingsStore } from '~/store/settingStore';


const editorStore = useEditorStore();
const settingStore = useSettingsStore();

const props = defineProps<{
  iconName: string;
  tool: string;
  condition: boolean;
  clickEvent: () => void;
  hotkeyString: string;
  borderCondition?: boolean;
  borderStyle?: string;
}>();

function hotkeyNameToShortcutName(hotkeyName: string) {
  const setting = settingStore.settings.find(x => x.name === hotkeyName);
  return setting ? JSON.parse(setting.value).join(' + ') : '';
}


</script>

<style></style>