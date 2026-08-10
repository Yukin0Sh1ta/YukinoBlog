<template>
  <div class="flex-1 ml-[200px] p-8 overflow-y-auto body-scroll h-[calc(100vh-4rem)]">
    <!-- 加载骨架屏 -->
    <div v-if="loading" class="max-w-[800px] mx-auto flex flex-col gap-4">
      <div class="h-8 rounded-lg bg-white/5 animate-pulse"></div>
      <div class="h-4 rounded-lg bg-white/5 animate-pulse w-3/4"></div>
      <div class="h-4 rounded-lg bg-white/5 animate-pulse w-1/2"></div>
      <div class="h-4 rounded-lg bg-white/5 animate-pulse"></div>
      <div class="h-4 rounded-lg bg-white/5 animate-pulse w-5/6"></div>
      <div class="h-4 rounded-lg bg-white/5 animate-pulse w-2/3"></div>
      <div class="h-4 rounded-lg bg-white/5 animate-pulse"></div>
      <div class="h-4 rounded-lg bg-white/5 animate-pulse w-4/5"></div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="max-w-[800px] mx-auto flex flex-col items-center justify-center py-20 gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-[#9a9a9a]/40">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
      <div class="text-sm text-[#9a9a9a]">{{ error }}</div>
    </div>

    <!-- 文章内容 -->
    <div v-else class="max-w-[800px] mx-auto rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg p-8 max-sm:p-5">
      <div
        class="text-base leading-[1.9] text-[#b3b9c0] whitespace-pre-wrap break-words"
        v-text="content"
      ></div>
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
    if (!props.name) return;
    try {
      loading.value = true;
      error.value = "";
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
  },
  { immediate: true }
);
</script>

<style scoped>
.body-scroll::-webkit-scrollbar {
  width: 6px;
}
.body-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.body-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
.body-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(234, 92, 182, 0.3);
}
</style>
