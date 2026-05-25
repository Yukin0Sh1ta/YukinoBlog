<template>
  <div class="fixed top-25 right-5 z-10010 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg select-none">
    <!-- 音乐图标 -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="text-[#9a9a9a] shrink-0"
      :class="{ 'text-[#ea5cb6]': playing }"
    >
      <path d="M9 18V5l12-2v13" />
      <circle
        cx="6"
        cy="18"
        r="3"
      />
      <circle
        cx="18"
        cy="16"
        r="3"
      />
    </svg>

    <!-- 歌曲名（可点击切歌） -->
    <span
      class="text-xs text-[#9a9a9a] truncate max-w-[120px] cursor-pointer hover:text-[#e0e0e0] transition-colors"
      :title="currentSong?.name || '未选择'"
      @click="next"
    >
      {{ currentSong?.name || '未选择' }}
    </span>

    <!-- 控制按钮组 -->
    <div class="flex items-center gap-1.5">
      <!-- 上一首 -->
      <button
        @click="prev"
        class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border-none cursor-pointer flex items-center justify-center text-[#9a9a9a] hover:text-white transition-colors"
        title="上一首"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      <!-- 播放/暂停 -->
      <button
        @click="togglePlay"
        class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border-none cursor-pointer flex items-center justify-center text-[#e0e0e0] hover:text-white transition-colors"
        :title="playing ? '暂停' : '播放'"
      >
        <svg
          v-if="playing"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <!-- 下一首 -->
      <button
        @click="next"
        class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border-none cursor-pointer flex items-center justify-center text-[#9a9a9a] hover:text-white transition-colors"
        title="下一首"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    </div>

    <!-- 音量控制 -->
    <div class="flex items-center gap-1.5 group/vol">
      <svg
        @click="toggleMute"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-[#9a9a9a] hover:text-white cursor-pointer transition-colors shrink-0"
      >
        <template v-if="volume === 0 || muted">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line
            x1="23"
            y1="9"
            x2="17"
            y2="15"
          />
          <line
            x1="17"
            y1="9"
            x2="23"
            y2="15"
          />
        </template>
        <template v-else-if="volume < 0.5">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </template>
        <template v-else>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </template>
      </svg>
      <input
        type="range"
        min="0"
        max="100"
        :value="Math.round(volume * 100)"
        @input="setVolume"
        class="w-16 h-1 accent-[#ea5cb6] cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
        title="音量"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";

interface Song {
  name: string;
  artist: string;
  url: string;
}

// ====== 播放列表（替换 URL 为你自己的音乐链接） ======
const playlist: Song[] = [
  {
    name: "サターン",
    artist: "歌手 A",
    url: "http://music.163.com/song/media/outer/url?id=2126406625.mp3",
  },
  {
    name: "嘘じゃない",
    artist: "歌手 B",
    url: "http://music.163.com/song/media/outer/url?id=2159057240.mp3",
  },
  {
    name: "海馬成長痛",
    artist: "歌手 C",
    url: "http://music.163.com/song/media/outer/url?id=2622088764.mp3",
  },
];

const currentIndex = ref(0);
const playing = ref(false);
const volume = ref(0.5);
const muted = ref(false);

const audio = new Audio();
audio.volume = volume.value;
let audioInited = false;

const currentSong = ref<Song | null>(playlist.length > 0 ? playlist[0] : null);

function initAudio() {
  if (audioInited) return;
  audioInited = true;

  audio.addEventListener("ended", () => next());
  audio.addEventListener("error", () => {
    console.warn("音频加载失败:", currentSong.value?.url);
    playing.value = false;
  });
  audio.addEventListener("play", () => {
    playing.value = true;
  });
  audio.addEventListener("pause", () => {
    playing.value = false;
  });
}

function loadAndPlay(index: number) {
  if (index < 0 || index >= playlist.length) return;
  initAudio();
  currentIndex.value = index;
  currentSong.value = playlist[index];
  audio.src = playlist[index].url;
  audio.load();
  audio.play().catch((e) => {
    console.warn("播放失败:", e);
    playing.value = false;
  });
}

function togglePlay() {
  if (!currentSong.value) return;
  initAudio();
  if (playing.value) {
    audio.pause();
  } else {
    if (!audio.src || audio.src !== currentSong.value.url) {
      audio.src = currentSong.value.url;
      audio.load();
    }
    audio.play().catch((e) => {
      console.warn("播放失败:", e);
      playing.value = false;
    });
  }
}

function next() {
  loadAndPlay((currentIndex.value + 1) % playlist.length);
}

function prev() {
  loadAndPlay((currentIndex.value - 1 + playlist.length) % playlist.length);
}

function setVolume(e: Event) {
  const v = Number((e.target as HTMLInputElement).value) / 100;
  volume.value = v;
  audio.volume = v;
  if (v > 0) muted.value = false;
}

function toggleMute() {
  if (volume.value === 0) {
    volume.value = 0.5;
    audio.volume = 0.5;
    muted.value = false;
  } else {
    muted.value = !muted.value;
    audio.volume = muted.value ? 0 : volume.value;
  }
}

onBeforeUnmount(() => {
  audio.pause();
  audio.src = "";
});
</script>
