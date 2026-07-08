import { Router, Request, Response } from "express";
import {
  getArticles,
  getArticleTitles,
} from "../services/articleService.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const data = await getArticles();
    res.json(data);
  } catch (e) {
    console.error("GET /api/articles error", e);
    res.status(500).json([]);
  }
});

router.get("/titles/:articleId", async (req: Request, res: Response) => {
  try {
    const data = await getArticleTitles(req.params.articleId as string);
    res.json(data);
  } catch (e) {
    console.error("GET /api/articlesTitles error", e);
    res.status(500).json([]);
  }
});

export default router;
