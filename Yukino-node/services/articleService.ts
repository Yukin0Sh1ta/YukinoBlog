import pool from "../db/index.js";

export interface Article {
  id: number;
  name: string;
  logo_url: string;
}

export interface ArticleTitle {
  id: number;
  title_name: string;
}

export interface ArticleDetail {
  body: string;
  publish_date: string;
}

export interface FullArticle {
  meta: { name: string; logo_url: string };
  sections: { title: string; content: string; date: string }[];
}

export async function getArticles(): Promise<Article[]> {
  const [articles] = await pool.query(
    "SELECT id, name, logo_url FROM article",
  );
  return articles as Article[];
}

export async function getArticleTitles(article_name: string): Promise<ArticleTitle[]> {
  const [titles] = await pool.query(
    "SELECT id, title_name FROM article_title WHERE article_name = ?",
    [article_name],
  );
  return titles as ArticleTitle[];
}

export async function getArticleDetails(title_name: string): Promise<ArticleDetail[]> {
  const [details] = await pool.query(
    "SELECT body, publish_date FROM article_detail WHERE title_name = ?",
    [title_name],
  );
  return details as ArticleDetail[];
}

export async function getFullArticle(articleId: number): Promise<FullArticle> {
  const [result] = await pool.query(
    `
    SELECT 
      a.name,
      a.logo_url,
      at.title_name,
      ad.body,
      ad.publish_date 
    FROM article a
    LEFT JOIN article_title at ON a.id = at.article_id 
    LEFT JOIN article_detail ad ON at.id = ad.title_id 
    WHERE a.id = ?
    ORDER BY at.order_num, ad.publish_date DESC
  `,
    [articleId],
  );

  const rows = result as any[];
  return rows.reduce<FullArticle>((acc, row) => {
    if (!acc.meta) {
      acc.meta = {
        name: row.name,
        logo_url: row.logo_url,
      };
      acc.sections = [];
    }
    acc.sections.push({
      title: row.title_name,
      content: row.body,
      date: row.publish_date,
    });
    return acc;
  }, {} as FullArticle);
}
