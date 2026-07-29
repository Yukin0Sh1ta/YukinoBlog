import crypto from "node:crypto";
import svgCaptcha from "svg-captcha";

interface CaptchaEntry {
  text: string;
  expiresAt: number;
}

const store = new Map<string, CaptchaEntry>();

const TTL = 5 * 60 * 1000;

export function createCaptcha(): { captchaId: string; svg: string } {
  const captcha = svgCaptcha.create({
    size: 4,
    noise: 2,
    color: true,
    background: "#cc9966",
  });
  const captchaId = crypto.randomUUID();
  store.set(captchaId, { text: captcha.text, expiresAt: Date.now() + TTL });
  return { captchaId, svg: captcha.data };
}

export function verifyCaptcha(captchaId: string, input: string): boolean {
  const entry = store.get(captchaId);
  if (!entry) return false;
  store.delete(captchaId);
  if (Date.now() > entry.expiresAt) return false;
  return entry.text.toLowerCase() === input.toLowerCase();
}

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (now > entry.expiresAt) store.delete(id);
  }
}, 5 * 60 * 1000);
