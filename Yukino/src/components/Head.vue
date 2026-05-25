<template>
  <div class="flex fixed items-center h-[12%] w-full bg-black top-0 left-0 z-[1000]">
    <div
      class="ml-[100px] select-none cursor-pointer text-[22px] text-[#9a9a9a]"
      @click="home"
    >首页</div>
    <div
      class="ml-[100px] select-none cursor-pointer text-[22px] text-[#9a9a9a]"
      @click="about"
    >文章</div>
    <div
      class="ml-[100px] select-none cursor-pointer text-[22px] text-[#9a9a9a]"
      @click="talk"
    >树洞</div>
    <div class="ml-auto mr-10 select-none text-xl text-[#9a9a9a] italic">Yukino's blog</div>
    <MusicPlayer />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import MusicPlayer from "./MusicPlayer.vue";
const router = useRouter();

const home = () => {
  router.push("/");
};
const about = () => {
  router.push("/article");
};
const talk = () => {
  router.push("/talk");
};
</script>