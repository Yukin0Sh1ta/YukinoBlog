import express, { Request, Response } from "express";
import cors from "cors";
import talkRouter from "./routes/talk.js";
import articleRouter from "./routes/article.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/talk", talkRouter);
app.use("/api/articles", articleRouter);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
