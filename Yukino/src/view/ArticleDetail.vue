<template>
  <div class="min-h-screen text-[#9a9a9a] select-none w-full pt-0">
    <!-- 顶部导航栏 -->
    <div class="fixed top-0 left-0 right-0 h-16 z-20 flex items-center gap-3 px-6 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/10">
      <button
        @click="router.back()"
        class="bg-transparent border-none cursor-pointer size-9 rounded-full text-[#9a9a9a] flex items-center justify-center transition-colors duration-200 hover:bg-white/10 hover:text-white"
      >
        <svg
          class="block"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="w-px h-5 bg-white/10"></div>
      <img
        :src="currentArticle?.logo"
        class="size-6 object-contain"
      >
      <h1 class="m-0 text-base font-semibold text-[#e0e0e0]">{{ currentArticle?.name }}</h1>
    </div>

    <!-- 内容区域 -->
    <div class="flex pt-16 min-h-screen">
      <ArticleSider @param-change="handleParamChange" />
      <ArticleBody :name="currentParam" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ArticleSider from "../components/ArticleSider.vue";
import ArticleBody from "../components/ArticleBody.vue";
import vueLogo from "../assets/img/Vue.png";
import nodeLogo from "../assets/img/nodejs.png";
import es6Logo from "../assets/img/es6.png";

const route = useRoute();
const router = useRouter();
const currentParam = ref();

const detailList = [
  { id: "vue", name: "Vue3", logo: vueLogo },
  { id: "node", name: "Node.js", logo: nodeLogo },
  { id: "es6", name: "ES6", logo: es6Logo },
];

const handleParamChange = (name: string) => {
  currentParam.value = name;
};

const currentArticle = computed(() => {
  return detailList.find((item) => item.name === route.params.name);
});

onMounted(() => {
  // 自动选中第一篇
  if (!currentParam.value) {
    currentParam.value = "";
  }
});
</script>
