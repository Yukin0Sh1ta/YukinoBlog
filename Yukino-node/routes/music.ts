import { Router, Request, Response } from "express";

const router = Router();

const NETEASE_OUTER_URL = "http://music.163.com/song/media/outer/url";

/**
 * GET /api/music/url/:id
 * 代理网易云音乐外链，解决：
 * 1. HTTPS 站点的 mixed content 拦截
 * 2. 缺少 Referer 头导致的 403
 */
router.get("/url/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!/^\d+$/.test(id)) {
    res.status(400).json({ error: "无效的歌曲 ID" });
    return;
  }

  try {
    const response = await fetch(`${NETEASE_OUTER_URL}?id=${id}.mp3`, {
      headers: {
        Referer: "https://music.163.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      res.status(response.status).json({ error: `获取音乐失败: ${response.status}` });
      return;
    }

    const contentType = response.headers.get("content-type") || "audio/mpeg";
    const contentLength = response.headers.get("content-length");

    res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.setHeader("Cache-Control", "public, max-age=3600");

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (e) {
    console.error("音乐代理失败:", e);
    if (!res.headersSent) {
      res.status(500).json({ error: "音乐代理失败" });
    }
  }
});

export default router;
