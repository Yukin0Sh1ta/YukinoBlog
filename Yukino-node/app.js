import express from "express";
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

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`11111111Server running on http://localhost:${PORT}`);
});
