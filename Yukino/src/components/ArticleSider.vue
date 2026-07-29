<template>
  <div class="sidebar-layout">
    <div class="flex flex-col w-[180px] h-[75%] p-2.5 border border-[#ac9f9f] rounded-lg m-2.5 left-2.5 top-[150px] fixed">
      <nav>
        <ul class="list-none p-0 m-0">
          <li
            v-for="(item, index) in titles"
            :key="item.id"
            :class="{ 'bg-[#817b7b] text-black font-medium': activeIndex === index }"
            class="relative py-[0.6rem] px-[0.2rem] cursor-pointer flex items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-[5px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:translate-y-0 active:shadow-none"
            @click="handleClick(index, item.title_name)"
          >
            {{ index + 1 }}.{{ item.title_name }}
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
  emit("param-change", name); // 向父组件传递参数
};

onMounted(async () => {
  const articleName = route.params.name as string;
  try {
    const res = await fetchArticlesTitle(articleName);
    if (Array.isArray(res)) {
      titles.value = res;
    }
  } catch (e) {
    console.error("Failed to fetch article titles:", e);
  }
});
</script>