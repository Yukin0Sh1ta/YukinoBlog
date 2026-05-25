import { Router } from "express";
import {
  getArticles,
  getArticleTitles,
  getArticleDetails,
} from "../services/articleService.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const data = await getArticles();
    res.json(data);
  } catch (e) {
    console.error("GET /api/articles error", e);
    res.status(500).json([]);
  }
});

router.get("/titles/:articleId", async (_req, res) => {
  try {
    const data = await getArticleTitles(_req.params.articleId);
    res.json(data);
  } catch (e) {
    console.error("GET /api/articlesTitles error", e);
    res.status(500).json([]);
  }
});

// router.get("/detail/:titleName", async (_req, res) => {
//   try {
//     const data = await getArticleDetails(_req.params.titleName);
//     res.json(data);
//   } catch (e) {
//     console.error("GET /api/articlesDetails error", e);
//     res.status(500).json([]);
//   }
// });

export default router;
