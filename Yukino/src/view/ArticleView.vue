<template>
  <div class="flex flex-col items-center justify-center min-h-screen select-none px-6 py-16">
    <!-- 标题 -->
    <div class="mb-12 text-center">
      <h1 class="text-3xl font-bold text-[#e0e0e0] mb-2">文章</h1>
      <p class="text-sm text-[#9a9a9a]">学习笔记与技术分享</p>
    </div>

    <!-- 卡片列表 -->
    <div class="flex flex-wrap justify-center gap-8 max-w-4xl w-full">
      <div
        v-for="item in articles"
        :key="item.id"
        class="group flex flex-col items-center gap-4 p-8 w-[220px] rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-[#ea5cb6]/40 hover:shadow-[0_12px_40px_rgba(234,92,182,0.15)] hover:bg-white/[0.07]"
        @click="goToDetail(item.name)"
      >
        <div class="w-16 h-16 flex items-center justify-center rounded-xl bg-white/5 transition-transform duration-300 group-hover:scale-110">
          <img
            class="w-10 h-10 object-contain"
            :src="item.logo"
            :alt="item.name"
          >
        </div>
        <div class="text-lg font-semibold text-[#e0e0e0] transition-colors duration-300 group-hover:text-[#ea5cb6]">
          {{ item.name }}
        </div>
        <div class="text-xs text-[#9a9a9a] text-center leading-relaxed">
          {{ item.description }}
        </div>
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
  { id: "vue", name: "Vue3", logo: vueLogo, description: "渐进式 JavaScript 框架，响应式数据与组件化开发" },
  { id: "node", name: "Node.js", logo: nodeLogo, description: "基于 V8 引擎的服务端 JavaScript 运行时" },
  { id: "es6", name: "ES6", logo: es6Logo, description: "ECMAScript 2015+ 现代语法特性与最佳实践" },
];

const goToDetail = (name: string) => {
  router.push(`/detail/${name}`);
};
</script>
