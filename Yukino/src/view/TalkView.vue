<template>
  <div
    ref="talkRef"
    class="fixed left-1/2 -translate-x-1/2 bottom-5 z-[10001] w-[min(720px,calc(100%-48px))] max-w-[720px] h-14 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[linear-gradient(150deg,rgba(18,18,20,0.92),rgba(10,10,12,0.82))] shadow-[0_8px_20px_rgba(0,0,0,0.6)] border border-white/[0.15] backdrop-blur-md backdrop-saturate-110 text-[#eaf2ff] overflow-visible max-sm:h-[52px] max-sm:px-2.5"
  >
    <!-- 留言输入区（不在页面显示留言列表） -->
    <input
      v-model="username"
      type="text"
      placeholder="用户名"
      class="flex-[0_0_96px] h-[30px] px-2 py-1.5 rounded-[10px] border border-white/10 bg-white/10 outline-none text-xs text-[#f5f8ff] focus:outline-none focus:border-[#ea5cb6] focus:shadow-[0_6px_18px_rgba(47,176,255,0.12)] focus:bg-white/[0.04] placeholder:text-[rgba(245,250,255,0.55)] placeholder:text-xs placeholder:opacity-100 max-sm:flex-[0_0_84px] max-sm:h-7 max-sm:text-xs"
    />
    <!-- 改为单行输入，Enter 发送 -->
    <input
      v-model="text"
      type="text"
      placeholder="说点什么吧"
      class="flex-[1_1_auto] h-[30px] min-h-[30px] px-2 py-1.5 rounded-[10px] border border-white/10 bg-white/10 text-xs text-[#f7fbff] leading-[1.2] overflow-hidden focus:outline-none focus:border-[#ea5cb6] focus:shadow-[0_6px_18px_rgba(47,176,255,0.12)] focus:bg-white/[0.04] placeholder:text-[rgba(245,250,255,0.55)] placeholder:text-xs placeholder:opacity-100 max-sm:h-7 max-sm:text-xs"
      @keydown.enter.prevent="handleSendClick"
      :maxlength="MAX"
    />

    <div class="flex-[0_0_auto] ml-2 text-[rgba(230,240,255,0.9)] text-xs px-2 py-1 rounded-lg bg-white/[0.02] select-none">{{ remaining }}/{{ MAX }}</div>
    <div class="flex gap-2 items-center justify-end">
      <button
        type="button"
        class="h-8 px-2.5 py-1.5 rounded-[10px] border-none bg-[linear-gradient(90deg,#ea5cb6,#d83e93)] text-white font-semibold flex items-center justify-center shadow-[0_6px_14px_rgba(47,176,255,0.14)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed max-sm:h-7 max-sm:px-2"
        @click="handleSendClick"
        :disabled="!canSend"
      >发送</button>
    </div>

    <!-- 横向飘动层（渲染到 body） -->
    <teleport to="body">
      <div
        class="fixed left-0 top-0 w-full h-full pointer-events-none z-[9998]"
        aria-hidden="true"
      >
        <div
          v-for="f in floats"
          :key="f.id"
          class="float-item fixed left-0 whitespace-nowrap bg-transparent p-0 border-none shadow-none translate-x-[100vw] will-change-[transform,opacity] pointer-events-none [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
          :data-fid="f.id"
          :style="{
            top: f.top + 'px',
            animationDuration: f.duration + 's',
            animationDelay: f.delay + 's',
            animationIterationCount: 'infinite',
            color: f.color,
            fontSize: f.size + 'px',
            opacity: f.opacity
          }"
          v-html="formatText(f.display)"
        ></div>
      </div>
    </teleport>
  </div>

  <!-- 验证码弹窗 -->
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="captchaModalVisible"
        class="fixed inset-0 z-[10010] flex items-center justify-center"
        @click.self="closeCaptchaModal"
      >
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- 弹窗主体 -->
        <div
          class="relative w-[min(400px,calc(100%-32px))] max-w-[400px] rounded-2xl bg-[linear-gradient(150deg,rgba(18,18,20,0.96),rgba(10,10,12,0.9))] shadow-[0_16px_40px_rgba(0,0,0,0.7)] border border-white/[0.15] backdrop-blur-xl backdrop-saturate-110 p-5 max-sm:p-4"
        >
          <h3 class="text-[#eaf2ff] text-base font-semibold mb-4 text-center max-sm:text-sm max-sm:mb-3">发送留言</h3>

          <!-- 内容摘要 -->
          <div class="mb-4 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 max-sm:mb-3">
            <div class="text-[#ea5cb6] text-xs font-semibold mb-1">{{ captchaSummary.name }}</div>
            <div class="text-[rgba(230,240,255,0.85)] text-xs leading-relaxed line-clamp-2">{{ captchaSummary.content }}</div>
          </div>

          <!-- 验证码图片 -->
          <div class="mb-3 flex items-center gap-3">
            <div
              class="flex-1 h-12 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center cursor-pointer overflow-hidden select-none transition-colors duration-200 hover:border-[#ea5cb6]/50"
              @click="refreshCaptcha"
              title="点击刷新验证码"
              v-html="captchaSvg"
            ></div>
            <button
              type="button"
              class="h-10 px-3 rounded-xl border border-white/[0.12] bg-white/[0.06] text-[rgba(230,240,255,0.8)] text-xs cursor-pointer transition-all duration-200 hover:bg-white/[0.12] hover:text-white active:scale-95"
              @click="refreshCaptcha"
            >刷新</button>
          </div>

          <!-- 验证码输入 -->
          <input
            v-model="captchaInput"
            type="text"
            placeholder="请输入验证码"
            maxlength="6"
            class="w-full h-10 px-3 rounded-xl border border-white/10 bg-white/10 text-sm text-[#f5f8ff] outline-none focus:border-[#ea5cb6] focus:shadow-[0_6px_18px_rgba(47,176,255,0.12)] focus:bg-white/[0.04] placeholder:text-[rgba(245,250,255,0.5)] placeholder:text-xs mb-4 max-sm:mb-3"
            @keydown.enter.prevent="confirmCaptcha"
          />

          <!-- 提示信息 -->
          <div v-if="captchaError" class="mb-3 text-[#ff6b6b] text-xs text-center">{{ captchaError }}</div>

          <!-- 按钮区 -->
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 h-9 rounded-xl border border-white/[0.12] bg-white/[0.06] text-[rgba(230,240,255,0.85)] text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-white/[0.12] hover:text-white active:scale-95"
              @click="closeCaptchaModal"
            >取消</button>
            <button
              type="button"
              class="flex-1 h-9 rounded-xl border-none bg-[linear-gradient(90deg,#ea5cb6,#d83e93)] text-white text-xs font-semibold cursor-pointer shadow-[0_6px_14px_rgba(47,176,255,0.14)] transition-all duration-200 hover:shadow-[0_8px_20px_rgba(47,176,255,0.22)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="confirmCaptcha"
              :disabled="!captchaInput.trim()"
            >确认发送</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- 留言列表已移除；仅保留飘动层 -->
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { watch } from "vue";
import { fetchTalks, postTalk, fetchCaptcha, type TalkMessage } from "../api/talk";

const STORAGE_KEY = "Yukino_talk_messages";
const NAME_KEY = "Yukino_talk_username";
const MAX = 30;
const MAX_FLOATS = 60;

interface FloatItem {
  id: number | string;
  display: string;
  top: number;
  duration: number;
  color: string;
  size: number;
  delay: number;
  opacity: number;
  startTime: number;
}

const username = ref<string>("");
const text = ref<string>("");
const messages = ref<TalkMessage[]>([]);
const floats = ref<FloatItem[]>([]);

// 验证码弹窗状态
const captchaModalVisible = ref(false);
const captchaSvg = ref("");
const captchaId = ref("");
const captchaInput = ref("");
const captchaError = ref("");
const captchaSummary = ref({ name: "", content: "" });

function escapeHtml(s = ""): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function formatText(t = ""): string {
  return escapeHtml(t).replace(/\n/g, "<br>");
}

const remaining = computed(() => Math.max(0, MAX - (text.value?.length || 0)));
const canSend = computed(
  () => (text.value ?? "").trim().length > 0 && (text.value?.length || 0) <= MAX
);

function makeFloatFromMsg(msg: Partial<TalkMessage> | any): FloatItem | null {
  try {
    const vh = Math.max(
      document.body.clientHeight || 0,
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );
    const headerEl = document.querySelector(
      "header, .head, #head, .header, #header"
    );
    const headerBottom = headerEl
      ? Math.max(0, headerEl.getBoundingClientRect().bottom)
      : 8;
    const talkTop = talkRef.value
      ? Math.max(0, talkRef.value.getBoundingClientRect().top)
      : Math.max(0, vh - 120);
    const minTop = Math.max(8, headerBottom + 8);
    const maxTop = Math.max(minTop + 20, talkTop - 12);
    const top = Math.floor(
      minTop + Math.random() * Math.max(0, maxTop - minTop)
    );
    const baseDuration = 14;
    const duration = Math.min(
      60,
      baseDuration + Math.max(0, (msg.text?.length || 0) / 4)
    );
    const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 45%)`;
    const size = 12 + Math.floor(Math.random() * 8);
    const delay = 0;
    return {
      id: msg.id ?? Date.now(),
      display: `${msg.username ?? "匿名"}: ${msg.text ?? ""}`,
      top,
      duration,
      color,
      size,
      delay,
      opacity: 1,
      startTime: performance.now() + delay * 1000,
    };
  } catch {
    return null;
  }
}

function addFloat(f: FloatItem | null): void {
  if (!f) return;
  floats.value.push(f);
  // 限制最大浮动物品数量，防止 DOM 节点无限增长
  while (floats.value.length > MAX_FLOATS) {
    floats.value.shift();
  }
}

async function refreshCaptcha(): Promise<void> {
  try {
    const data = await fetchCaptcha();
    captchaId.value = data.captchaId;
    captchaSvg.value = data.svg;
    captchaError.value = "";
  } catch (e) {
    captchaError.value = "获取验证码失败，请重试";
  }
}

function openCaptchaModal(): void {
  const content = (text.value ?? "").trim();
  const name = username.value?.trim() || "匿名";
  if (!content || content.length > MAX) return;

  captchaSummary.value = { name, content };
  captchaInput.value = "";
  captchaError.value = "";
  captchaModalVisible.value = true;
  refreshCaptcha();
}

function closeCaptchaModal(): void {
  captchaModalVisible.value = false;
  captchaInput.value = "";
  captchaError.value = "";
}

async function confirmCaptcha(): Promise<void> {
  const content = captchaSummary.value.content;
  const name = captchaSummary.value.name;
  if (!content || !captchaInput.value.trim()) return;

  try {
    const saved = await postTalk({
      username: name,
      text: content,
      captchaId: captchaId.value,
      captcha: captchaInput.value.trim(),
    });
    messages.value.unshift(saved);
    const f = makeFloatFromMsg(saved);
    addFloat(f);
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {}
    text.value = "";
    closeCaptchaModal();
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 429) {
      captchaError.value = "操作过于频繁，请稍后再试";
      refreshCaptcha();
    } else if (status === 400) {
      captchaError.value = "验证码错误";
      refreshCaptcha();
    } else {
      captchaError.value = "发送失败，请重试";
      refreshCaptcha();
    }
  }
}

function handleSendClick(): void {
  const content = (text.value ?? "").trim();
  if (!content || content.length > MAX) return;

  if (!captchaId.value) {
    openCaptchaModal();
    return;
  }

  // 如果已有 captchaId（之前验证过），直接打开弹窗复用
  openCaptchaModal();
}

async function loadRemoteMessages(): Promise<void> {
  try {
    const data = await fetchTalks();
    if (Array.isArray(data)) {
      messages.value = data;
      for (const m of messages.value) {
        if (!floats.value.find((f) => f.id === m.id)) {
          const f = makeFloatFromMsg(m);
          addFloat(f);
        }
      }
    }
  } catch (e) {
    console.warn("loadRemoteMessages error", e);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && !messages.value.length) messages.value = JSON.parse(raw);
    } catch {}
  }
}

const talkRef = ref<HTMLElement | null>(null);

onMounted(() => {
  loadRemoteMessages().finally(() => {
    try {
      const name = localStorage.getItem(NAME_KEY);
      if (name) username.value = name;
    } catch {}
    try {
      for (const m of messages.value) {
        if (!floats.value.find((f) => f.id === m.id)) {
          const f = makeFloatFromMsg(m);
          addFloat(f);
        }
      }
    } catch {}
  });

  // 持久化 messages 到本地存储，兼容文件回退场景
  watch(
    messages,
    (val: TalkMessage[]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
      } catch {}
    },
    { deep: true }
  );
});

onBeforeUnmount(() => {
  // 无游戏相关清理
});
</script>

<style scoped>
/* 动画关键帧 */
.float-item {
  animation-name: floatLeft;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes floatLeft {
  0% {
    transform: translateX(100vw);
    opacity: 1;
  }
  70% {
    opacity: 0.75;
  }
  100% {
    transform: translateX(-100vw);
    opacity: 0;
  }
}

/* 弹窗淡入动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from .relative,
.modal-fade-leave-to .relative {
  transform: scale(0.92) translateY(8px);
}
</style>
