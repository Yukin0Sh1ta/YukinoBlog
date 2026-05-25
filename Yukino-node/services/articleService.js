import pool from "../db/index.js";

export async function getArticles() {
  try {
    const [articles] = await pool.query(
      "SELECT id, name, logo_url FROM article",
    );
    return articles;
  } catch (e) {
    console.error("Error fetching articles:", e);
    throw e;
  }

  return articles;
}

export async function getArticleTitles(article_name) {
  try {
    const [titles] = await pool.query(
      "SELECT id, title_name FROM article_title WHERE article_name = ?",
      [article_name],
    );
    return titles;
  } catch (e) {
    console.error("Error fetching article titles:", e);
    throw e;
  }
}

export async function getArticleDetails(title_name) {
  try {
    const [details] = await pool.query(
      "SELECT body, publish_date FROM article_detail WHERE title_name = ?",
      [title_name],
    );
    return details;
  } catch (e) {
    console.error("Error fetching article details:", e);
    throw e;
  }
}

// 2026年新增：联合查询优化
export async function getFullArticle(articleId) {
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

  return result.reduce((acc, row) => {
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
  }, {});
}
