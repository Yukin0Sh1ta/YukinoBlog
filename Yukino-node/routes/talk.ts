import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { getTalks, addTalk, TalkMessage } from "../services/talkService.js";
import { createCaptcha, verifyCaptcha } from "../services/captchaService.js";

const router = Router();

const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too many requests, try later" },
});

const captchaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too many captcha requests" },
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const data = await getTalks();
    res.json(data);
  } catch (e) {
    console.error("GET /api/talk error", e);
    res.status(500).json([]);
  }
});

router.get("/captcha", captchaLimiter, (_req: Request, res: Response) => {
  const { captchaId, svg } = createCaptcha();
  res.json({ captchaId, svg });
});

router.post("/", postLimiter, async (req: Request, res: Response) => {
  const { username, text, captchaId, captcha } = req.body || {};
  if (
    !captchaId ||
    typeof captchaId !== "string" ||
    !captcha ||
    typeof captcha !== "string"
  ) {
    res.status(400).json({ error: "captcha invalid" });
    return;
  }
  if (!verifyCaptcha(captchaId, captcha)) {
    res.status(400).json({ error: "captcha invalid" });
    return;
  }
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "invalid text" });
    return;
  }
  const cleanedText = String(text).trim().slice(0, 200);
  const name = (username && String(username).trim()) || "匿名";
  const msg: TalkMessage = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    username: name,
    text: cleanedText,
    time: Date.now(),
  };
  try {
    const saved = await addTalk(msg);
    res.status(201).json(saved);
  } catch (e) {
    console.error("POST /api/talk error", e);
    res.status(500).json({ error: "server error" });
  }
});

export default router;
