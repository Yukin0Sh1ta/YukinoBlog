<template>
  <div class="p-8 overflow-y-auto flex w-full justify-center">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <pre
        class="w-full max-w-[900px] p-8 rounded-[10px] shadow-[0_6px_24px_rgba(30,41,59,0.06)] font-sans text-base leading-[1.85] text-[#9a9a9a] whitespace-pre-wrap break-words overflow-auto antialiased max-sm:p-4 max-sm:text-[15px] max-sm:max-w-full max-sm:rounded-lg"
        v-text="content"
      ></pre>
    </div>
  </div>
</template>
 
<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const props = defineProps<{
  name: string;
}>();

const content = ref("");
const loading = ref(false);
const error = ref("");

watch(
  () => props.name,
  async () => {
    try {
      loading.value = true;
      const response = await import(
        `../data/article/${route.params.name}/${props.name}.txt?raw`
      );
      content.value = response.default;
    } catch (e) {
      error.value = `加载失败: ${props.name}.txt`;
      console.error(e);
    } finally {
      loading.value = false;
    }
  }
);
</script>