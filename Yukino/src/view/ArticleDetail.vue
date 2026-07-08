<template>
  <div class="p-8 text-[#9a9a9a] select-none w-full h-full pt-20">
    <div class="fixed top-20 left-2.5 flex items-center gap-4 m-2.5 px-6 py-3 z-10 w-full">
      <button
        @click="router.back()"
        class="bg-transparent border-none cursor-pointer size-10 rounded-full text-[#9a9a9a] flex items-center justify-center transition-colors duration-200 hover:bg-[#f5f5f5]"
      >
        <svg
          class="block"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <img
        :src="currentArticle?.logo"
        class="size-7.5 object-contain"
      >
      <h1 class="m-0 text-xl font-semibold">{{ currentArticle?.name }}</h1>
    </div>

    <ArticleSider @param-change="handleParamChange" />
    <ArticleBody :name="currentParam" />

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
const currentParam = ref(); // 默认值

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
</script>
