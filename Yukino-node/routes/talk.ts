import { Router, Request, Response } from "express";
import { getTalks, addTalk, TalkMessage } from "../services/talkService.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const data = await getTalks();
    res.json(data);
  } catch (e) {
    console.error("GET /api/talk error", e);
    res.status(500).json([]);
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { username, text } = req.body || {};
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
