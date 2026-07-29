import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

export interface Song {
  name: string;
  artist: string;
  id: string; // 网易云歌曲 ID
}

// 通过后端代理获取音频流，避免 mixed content 和 403。
function songUrl(id: string): string {
  return `http://localhost:3000/api/music/url/${id}`;
}

// ====== 播放列表 ======
const playlist: Song[] = [
  {
    name: "サターン",
    artist: "歌手 A",
    id: "2126406625",
  },
  {
    name: "嘘じゃない",
    artist: "歌手 B",
    id: "2159057240",
  },
  {
    name: "海馬成長痛",
    artist: "歌手 C",
    id: "2622088764",
  },
];

const STORAGE_KEY = "Yukino_music_state";

interface PersistedState {
  currentIndex: number;
  volume: number;
  muted: boolean;
}

function loadState(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      currentIndex:
        typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0,
      volume: typeof parsed.volume === "number" ? parsed.volume : 0.5,
      muted: typeof parsed.muted === "boolean" ? parsed.muted : false,
    };
  } catch (e) {
    console.warn("读取音乐状态失败:", e);
    return null;
  }
}

export const useMusicStore = defineStore("music", () => {
  const restored = loadState();

  // ====== State ======
  const currentIndex = ref<number>(restored?.currentIndex ?? 0);
  const playing = ref<boolean>(false); // 不持久化，刷新后默认暂停
  const volume = ref<number>(restored?.volume ?? 0.5);
  const muted = ref<boolean>(restored?.muted ?? false);
  const currentTime = ref<number>(0); // 不持久化，audio 需重新加载

  // audio 实例与初始化标志放在 store 内部，生命周期跟随 store。
  const audio = new Audio();
  let audioInited = false;

  // ====== Getters ======
  const currentSong = computed<Song | null>(() =>
    playlist.length > 0 ? playlist[currentIndex.value] ?? null : null
  );

  // ====== 持久化 ======
  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentIndex: currentIndex.value,
          volume: volume.value,
          muted: muted.value,
        })
      );
    } catch (e) {
      console.warn("写入音乐状态失败:", e);
    }
  }

  // volume / muted / currentIndex 变化时写入 localStorage
  watch([currentIndex, volume, muted], persist);

  // ====== Actions ======

  /**
   * 初始化：从 localStorage 恢复状态、绑定 audio 事件监听、设置音量。
   * 幂等，只执行一次（通过 audioInited 标志）。
   */
  function init() {
    if (audioInited) return;
    audioInited = true;

    audio.volume = muted.value ? 0 : volume.value;

    audio.addEventListener("play", () => {
      playing.value = true;
    });
    audio.addEventListener("pause", () => {
      playing.value = false;
    });
    audio.addEventListener("ended", () => {
      next();
    });
    audio.addEventListener("timeupdate", () => {
      currentTime.value = audio.currentTime;
    });
    audio.addEventListener("error", () => {
      console.warn("音频加载失败:", currentSong.value?.id);
      playing.value = false;
    });
  }

  function loadAndPlay(index: number) {
    if (index < 0 || index >= playlist.length) return;
    init();
    currentIndex.value = index;
    audio.src = songUrl(playlist[index].id);
    audio.load();
    audio.play().catch((e) => {
      console.warn("播放失败:", e);
      playing.value = false;
    });
  }

  function togglePlay() {
    if (!currentSong.value) return;
    init();
    if (playing.value) {
      audio.pause();
    } else {
      const url = songUrl(currentSong.value.id);
      if (!audio.src || audio.src !== url) {
        audio.src = url;
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

  function setVolume(v: number) {
    const clamped = Math.max(0, Math.min(1, v));
    volume.value = clamped;
    audio.volume = clamped;
    if (clamped > 0) muted.value = false;
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

  function seek(time: number) {
    if (Number.isFinite(time)) {
      audio.currentTime = time;
      currentTime.value = time;
    }
  }

  return {
    // state
    currentIndex,
    playing,
    volume,
    muted,
    currentTime,
    // getters
    currentSong,
    playlist,
    // actions
    init,
    togglePlay,
    next,
    prev,
    loadAndPlay,
    setVolume,
    toggleMute,
    seek,
  };
});
