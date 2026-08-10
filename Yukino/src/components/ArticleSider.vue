<template>
  <div class="fixed top-16 left-0 bottom-0 w-[200px] p-4 z-10">
    <div class="h-full flex flex-col rounded-xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden">
      <div class="px-4 pt-4 pb-2 text-xs font-semibold text-[#9a9a9a] uppercase tracking-wider">目录</div>
      <nav class="flex-1 overflow-y-auto sider-scroll px-2 pb-2">
        <ul class="list-none p-0 m-0 flex flex-col gap-0.5">
          <li
            v-for="(item, index) in titles"
            :key="item.id"
            :class="{
              'bg-[#3a3a3a] text-[#e0e0e0] font-medium': activeIndex === index,
              'text-[#9a9a9a] hover:bg-white/5 hover:text-[#e0e0e0]': activeIndex !== index
            }"
            class="relative py-2.5 px-3 cursor-pointer rounded-lg flex items-center gap-2 text-sm transition-all duration-200 hover:-translate-y-[2px]"
            @click="handleClick(index, item.title_name)"
          >
            <span
              :class="activeIndex === index ? 'opacity-100' : 'opacity-0'"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[#5a5a5a] transition-opacity duration-200"
            ></span>
            <span class="text-xs opacity-50">{{ index + 1 }}</span>
            <span class="truncate">{{ item.title_name }}</span>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchArticlesTitle, type ArticleTitle } from "../api/article";

const route = useRoute();
const router = useRouter();
const name = route.params.name as string;
const titles = ref<ArticleTitle[]>([]);
const activeIndex = ref<number | null>(null);

interface NavItem {
  id: string;
  label: string;
}

const handleClick = (index: number, name: string) => {
  activeIndex.value = index;
  emit("param-change", name);
};

const emit = defineEmits<{
  (e: "param-change", name: string): void;
}>();

const siderItems = computed(() =>
  titles.value.map((t) => ({
    id: t.id,
    titleName: t.title_name,
  }))
);

const emitParam = (name: string) => {
  emit("param-change", name);
};

onMounted(async () => {
  const articleName = route.params.name as string;
  try {
    const res = await fetchArticlesTitle(articleName);
    if (Array.isArray(res)) {
      titles.value = res;
      // 自动选中第一篇
      if (res.length > 0) {
        activeIndex.value = 0;
        emit("param-change", res[0].title_name);
      }
    }
  } catch (e) {
    console.error("Failed to fetch article titles:", e);
  }
});
</script>

<style scoped>
.sider-scroll::-webkit-scrollbar {
  width: 4px;
}
.sider-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.sider-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
.sider-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(234, 92, 182, 0.3);
}
</style>
