<template>
  <div ref="talkRef" class="fixed left-1/2 -translate-x-1/2 bottom-5 z-[10001] w-[min(720px,calc(100%-48px))] max-w-[720px] h-14 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[linear-gradient(150deg,rgba(18,18,20,0.92),rgba(10,10,12,0.82))] shadow-[0_8px_20px_rgba(0,0,0,0.6)] border border-white/[0.15] backdrop-blur-md backdrop-saturate-110 text-[#eaf2ff] overflow-visible max-sm:h-[52px] max-sm:px-2.5">
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
      @keydown.enter.prevent="postMessage"
      :maxlength="MAX"
    />

    <div class="flex-[0_0_auto] ml-2 text-[rgba(230,240,255,0.9)] text-xs px-2 py-1 rounded-lg bg-white/[0.02] select-none">{{ remaining }}/{{ MAX }}</div>
    <div class="flex gap-2 items-center justify-end">
      <button
        type="button"
        class="h-8 px-2.5 py-1.5 rounded-[10px] border-none bg-[linear-gradient(90deg,#ea5cb6,#d83e93)] text-white font-semibold shadow-[0_6px_14px_rgba(47,176,255,0.14)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed max-sm:h-7 max-sm:px-2"
        @click="postMessage"
        :disabled="!canSend"
      >发送</button>
    </div>
    <div class="absolute right-3 -top-7 bg-black/50 text-white px-2 py-1 rounded-xl text-xs z-[10003] flex items-center gap-1 whitespace-nowrap">
      得分: {{ score }} &nbsp;|&nbsp; 最高: {{ highScore }}
      <button
        class="bg-white/[0.15] border-none text-white cursor-pointer size-5 rounded-full text-sm leading-none flex items-center justify-center p-0 transition-colors duration-200 hover:bg-white/[0.35]"
        @click="resetGame"
        title="重置游戏"
      >↺</button>
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

    <!-- 游戏元素渲染到 body -->
    <teleport to="body">
      <div
        class="fixed left-0 top-0 w-full h-full pointer-events-none z-[10002]"
        aria-hidden="false"
      >
        <div
          ref="paddleEl"
          class="fixed h-px bg-white pointer-events-auto cursor-ew-resize rounded-[1px]"
          :style="{ left: paddleX + 'px', top: paddleY + 'px', width: paddleW + 'px' }"
        ></div>
        <svg
          v-if="true"
          class="aim-canvas"
          :style="{ position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }"
        >
          <defs>
            <marker
              id="aimArrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,10 L10,5 z"
                fill="rgba(255,255,255,0.95)"
              />
            </marker>
          </defs>
          <line
            v-if="isAiming"
            :x1="aimStartX"
            :y1="aimStartY"
            :x2="aimX"
            :y2="aimY"
            stroke="rgba(255,255,255,0.9)"
            stroke-width="3"
            stroke-linecap="round"
            marker-end="url(#aimArrow)"
          />
        </svg>
        <div
          ref="ballEl"
          class="fixed size-5 bg-white rounded-full pointer-events-auto cursor-pointer shadow-[0_6px_18px_rgba(255,255,255,0.08),0_2px_6px_rgba(0,0,0,0.4)] translate-z-0"
          :style="{ left: (ballX - ballR) + 'px', top: (ballY - ballR) + 'px', width: ballR*2 + 'px', height: ballR*2 + 'px' }"
        ></div>
      </div>
    </teleport>
  </div>

  <!-- 留言列表已移除；仅保留飘动层 -->
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, Ref } from "vue";
import { watch } from "vue";
import { fetchTalks, postTalk, type TalkMessage } from "../api/talk";

const STORAGE_KEY = "Yukino_talk_messages";
const NAME_KEY = "Yukino_talk_username";
const HIGH_SCORE_KEY = "Yukino_high_score";
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
  _hit?: boolean;
}

const username = ref<string>("");
const text = ref<string>("");
const messages = ref<TalkMessage[]>([]);
const floats = ref<FloatItem[]>([]);
const score = ref<number>(0);
const highScore = ref<number>(0);

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
    const baseDuration = 36;
    const duration = Math.min(
      240,
      baseDuration + Math.max(0, (msg.text?.length || 0) / 2)
    );
    const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 45%)`;
    const size = 12 + Math.floor(Math.random() * 8);
    const delay = 0.2 + Math.random() * 1.2;
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

async function postMessage(): Promise<void> {
  const content = (text.value ?? "").trim();
  if (!content || content.length > MAX) return;
  const name = username.value?.trim() || "匿名";

  try {
    const saved = await postTalk({ username: name, text: content });
    messages.value.unshift(saved);
    const f = makeFloatFromMsg(saved);
    addFloat(f);
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {}
    text.value = "";
  } catch (e) {
    const msg: TalkMessage = {
      id: Date.now(),
      username: name,
      text: content,
      time: Date.now(),
    };
    messages.value.unshift(msg);
    const f = makeFloatFromMsg(msg);
    addFloat(f);
    text.value = "";
  }
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

// --- 游戏逻辑 ---
const ballEl: Ref<HTMLElement | null> = ref(null);
const paddleEl: Ref<HTMLElement | null> = ref(null);
const talkRef: Ref<HTMLElement | null> = ref(null);

let vw = 0,
  vh = 0;
const ballR = 10;
const ballX = ref<number>(0);
const ballY = ref<number>(0);
let vx = 0,
  vy = 0;
const BALL_SPEED = 6; // 恒定速度
let animId = 0;
const paddleW = 250;
const paddleH = 10;
const paddleX = ref<number>(0);
const paddleY = ref<number>(0);
let running = false;
const homeX = ref<number>(0);
const homeY = ref<number>(0);

// aiming state
const isAiming = ref(false);
const aimStartX = ref<number>(0);
const aimStartY = ref<number>(0);
const aimX = ref<number>(0);
const aimY = ref<number>(0);
let aimTimeout: any = null;
let activePointerId: number | null = null;

function normalizeVelocity(): void {
  const speed = Math.hypot(vx, vy);
  if (speed > 0) {
    vx = (vx / speed) * BALL_SPEED;
    vy = (vy / speed) * BALL_SPEED;
  }
}

function checkFloatCollisions(): void {
  try {
    for (const f of floats.value) {
      if (f._hit) continue;
      const el = document.querySelector(
        `[data-fid="${f.id}"]`
      ) as HTMLElement | null;
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // 跳过还没进入屏幕的浮动物品
      if (rect.right < 0 || rect.left > vw) continue;
      const fx = rect.left + rect.width / 2;
      const fy = rect.top + rect.height / 2;
      const dx = fx - ballX.value;
      const dy = fy - ballY.value;
      const dist = Math.hypot(dx, dy);
      // 放宽碰撞阈值，让碰撞更容易触发
      const threshold = ballR + Math.max(14, rect.height / 2 + 6);
      if (dist <= threshold) {
        f._hit = true;
        score.value += 1;
        el.classList.add("float-hit");
        // 基于碰撞法线反射，保持恒定速度
        if (dist > 0.001) {
          const nx = dx / dist;
          const ny = dy / dist;
          const dot = vx * nx + vy * ny;
          vx = vx - 2 * dot * nx;
          vy = vy - 2 * dot * ny;
        }
        normalizeVelocity();
        setTimeout(() => {
          const idx = floats.value.findIndex((it) => it.id === f.id);
          if (idx >= 0) floats.value.splice(idx, 1);
        }, 360);
      }
    }
  } catch (e) {
    // ignore DOM errors
  }
}

function updateViewport(): void {
  vw =
    (window.visualViewport && window.visualViewport.width) ||
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth ||
    0;
  vh =
    (window.visualViewport && window.visualViewport.height) ||
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight ||
    0;
  if (!vw || !vh) {
    const rect = document.documentElement.getBoundingClientRect();
    vw = vw || rect.width || 0;
    vh = vh || rect.height || 0;
  }
  homeX.value = vw / 2;
  homeY.value = vh / 2;
  if (talkRef.value) {
    const r = talkRef.value.getBoundingClientRect();
    paddleX.value = Math.round(r.left + r.width / 2 - paddleW / 2);
    paddleY.value = Math.round(r.top - 3 - paddleH);
  } else {
    paddleX.value = Math.round(vw / 2 - paddleW / 2);
    paddleY.value = 8;
  }
  // 小球初始位置：正上方于横线平台中心
  if (!running) {
    ballX.value = paddleX.value + paddleW / 2;
    ballY.value = paddleY.value - ballR - 2;
    vx = 0;
    vy = 0;
  }
}

function pointerToPage(p: PointerEvent) {
  return { x: p.pageX, y: p.pageY };
}

function onBallPointerDown(e: PointerEvent) {
  if (!ballEl.value) return;
  // only left button
  if (e.button && e.button !== 0) return;
  // start a short long-press delay
  aimTimeout = setTimeout(() => {
    isAiming.value = true;
    // start point is current ball center
    aimStartX.value = ballX.value;
    aimStartY.value = ballY.value;
    aimX.value = e.pageX;
    aimY.value = e.pageY;
    try {
      ballEl.value?.setPointerCapture(e.pointerId);
      activePointerId = e.pointerId;
    } catch {}
    window.addEventListener("pointermove", onBallPointerMove);
    window.addEventListener("pointerup", onBallPointerUp);
  }, 180);
  // prevent clicks from triggering native behavior
  e.preventDefault();
}

function onBallPointerMove(e: PointerEvent) {
  if (!isAiming.value) return;
  // pull vector = ball center - pointer => launch direction
  const px = e.pageX;
  const py = e.pageY;
  let dx = aimStartX.value - px;
  let dy = aimStartY.value - py;
  const d = Math.hypot(dx, dy) || 1;
  dx /= d;
  dy /= d;
  const arrowLen = 120;
  aimX.value = Math.round(aimStartX.value + dx * arrowLen);
  aimY.value = Math.round(aimStartY.value + dy * arrowLen);
}

function onBallPointerUp(e: PointerEvent) {
  if (aimTimeout) {
    clearTimeout(aimTimeout);
    aimTimeout = null;
  }
  window.removeEventListener("pointermove", onBallPointerMove);
  window.removeEventListener("pointerup", onBallPointerUp);
  if (activePointerId !== null) {
    try {
      ballEl.value?.releasePointerCapture(activePointerId);
    } catch {}
    activePointerId = null;
  }
  if (isAiming.value) {
    // compute launch direction from arrow (aim vector from start -> aim)
    const dx = aimX.value - aimStartX.value;
    const dy = aimY.value - aimStartY.value;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    vx = nx * BALL_SPEED;
    vy = ny * BALL_SPEED;
    isAiming.value = false;
    startLoop();
  } else {
    onBallClick();
  }
}

function startLoop(): void {
  if (running) return;
  running = true;
  let last = performance.now();
  function loop(now: number) {
    const dt = (now - last) / 16.6667;
    last = now;
    step(dt);
    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);
}
function stopLoop(): void {
  running = false;
  cancelAnimationFrame(animId);
}

function step(dt = 1): void {
  // 限制最大 dt，防止切标签页后球瞬移
  dt = Math.min(dt, 3);
  // 子步长：防止球在单帧内穿过浮动物品（隧道效应）
  const substeps = Math.ceil(dt);
  const subDt = dt / substeps;
  for (let s = 0; s < substeps; s++) {
    ballX.value += vx * subDt;
    ballY.value += vy * subDt;

    // 顶部/左右墙壁反弹，保持恒定速度
    if (ballY.value - ballR <= 0) {
      ballY.value = ballR;
      vy = Math.abs(vy);
      normalizeVelocity();
    }
    if (ballX.value - ballR <= 0) {
      ballX.value = ballR;
      vx = Math.abs(vx);
      normalizeVelocity();
    } else if (ballX.value + ballR >= vw) {
      ballX.value = vw - ballR;
      vx = -Math.abs(vx);
      normalizeVelocity();
    }

    // 浮动物品碰撞
    try {
      checkFloatCollisions();
    } catch {}

    // 挡板碰撞
    const pLeft = paddleX.value;
    const pRight = paddleX.value + paddleW;
    const pTop = paddleY.value;
    if (
      ballY.value + ballR >= pTop &&
      ballY.value - ballR <= pTop + paddleH &&
      ballX.value >= pLeft - ballR &&
      ballX.value <= pRight + ballR
    ) {
      ballY.value = pTop - ballR;
      vy = -Math.abs(vy);
      normalizeVelocity();
    }

    // 掉落底部：记录最高分，得分清零，重置小球
    if (ballY.value + ballR >= vh) {
      if (score.value > highScore.value) {
        highScore.value = score.value;
        try {
          localStorage.setItem(HIGH_SCORE_KEY, String(highScore.value));
        } catch {}
      }
      score.value = 0;
      updateViewport();
      ballX.value = paddleX.value + paddleW / 2;
      ballY.value = paddleY.value - ballR - 2;
      vx = 0;
      vy = 0;
      stopLoop();
      return;
    }
  }
}

function onBallClick(): void {
  if (!running) {
    updateViewport();
    ballX.value = paddleX.value + paddleW / 2;
    ballY.value = paddleY.value - ballR - 2;
    vx = 0;
    vy = -BALL_SPEED;
    startLoop();
  }
}

function resetGame(): void {
  stopLoop();
  score.value = 0;
  updateViewport();
  ballX.value = paddleX.value + paddleW / 2;
  ballY.value = paddleY.value - ballR - 2;
  vx = 0;
  vy = 0;
}

function onKeyDown(e: KeyboardEvent): void {
  const key = e.key.toLowerCase();
  if (key === "a") {
    paddleX.value = Math.max(3, paddleX.value - 12);
    if (!running) {
      ballX.value = paddleX.value + paddleW / 2;
      ballY.value = paddleY.value - ballR - 2;
    }
  } else if (key === "d") {
    paddleX.value = Math.min(vw - paddleW - 3, paddleX.value + 12);
    if (!running) {
      ballX.value = paddleX.value + paddleW / 2;
      ballY.value = paddleY.value - ballR - 2;
    }
  }
}

let dragging = false;
let dragOffsetX = 0;
function onPaddleMouseDown(e: MouseEvent): void {
  dragging = true;
  dragOffsetX = e.clientX - paddleX.value;
  e.preventDefault();
}
function onGlobalMouseMove(e: MouseEvent): void {
  if (!dragging) return;
  paddleX.value = Math.min(
    Math.max(2, e.clientX - dragOffsetX),
    Math.max(2, vw - paddleW - 2)
  );
  if (!running) {
    ballX.value = paddleX.value + paddleW / 2;
    ballY.value = paddleY.value - ballR - 2;
  }
}
function onGlobalMouseUp(): void {
  dragging = false;
}

onMounted(() => {
  // 加载最高分
  try {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) highScore.value = Number(saved) || 0;
  } catch {}

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

  requestAnimationFrame(() => updateViewport());

  const onResize = () => requestAnimationFrame(updateViewport);
  window.addEventListener("resize", onResize);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("mousemove", onGlobalMouseMove);
  document.addEventListener("mouseup", onGlobalMouseUp);

  nextTick(() => {
    if (paddleEl.value)
      paddleEl.value.addEventListener("mousedown", onPaddleMouseDown);
    if (ballEl.value)
      ballEl.value.addEventListener("pointerdown", onBallPointerDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("mousemove", onGlobalMouseMove);
    document.removeEventListener("mouseup", onGlobalMouseUp);
    if (paddleEl.value)
      paddleEl.value.removeEventListener("mousedown", onPaddleMouseDown);
    if (ballEl.value)
      ballEl.value.removeEventListener("pointerdown", onBallPointerDown);
    window.removeEventListener("pointermove", onBallPointerMove);
    window.removeEventListener("pointerup", onBallPointerUp);
    if (aimTimeout) {
      clearTimeout(aimTimeout);
      aimTimeout = null;
    }
    stopLoop();
  });
});
</script>

<style scoped>
/* 动画关键帧 */
.float-item {
  animation-name: floatLeft;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.float-hit {
  animation: floatHit 360ms forwards;
}

@keyframes floatHit {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.35) translateY(-8px);
    opacity: 0.9;
  }
  100% {
    transform: scale(0.6) translateY(-14px);
    opacity: 0;
  }
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
</style>