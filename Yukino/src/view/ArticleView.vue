<template>
  <div class="flex justify-center items-center h-screen gap-10 select-none">
    <!-- <div class="article-container"> -->
    <div
      v-for="item in articles"
      :key="item.id"
      class="group flex flex-col items-center transition duration-300 cursor-pointer p-8 w-50 rounded-lg bg-[#3d3c3c] hover:-translate-y-3"
      @click="goToDetail(item.name)"
    >
      <img
        class="w-30 h-25 object-contain mb-4 transition-transform duration-300 group-hover:scale-110"
        :src="item.logo"
        :alt="item.name"
      >
      <div class="text-xl font-semibold text-[#b3b9c0]">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import vueLogo from "../assets/img/Vue.png";
import nodeLogo from "../assets/img/nodejs.png";
import es6Logo from "../assets/img/es6.png";

const router = useRouter();

const articles = [
  { id: "vue", name: "Vue3", logo: vueLogo },
  { id: "node", name: "Node.js", logo: nodeLogo },
  { id: "es6", name: "ES6", logo: es6Logo },
];

const goToDetail = (name: string) => {
  router.push(`/detail/${name}`);
};
</script>
