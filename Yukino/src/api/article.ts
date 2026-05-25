import apiClient from "../utils/request";

export interface Article {
    id: string;
    name: string;
    logoUrl: string;
}
export interface ArticleTitle{
    id: string;
    title_name: string;
}

export async function fetchArticles(): Promise<Article[]> {
  return apiClient.get(`/api/articles`);
}

export async function fetchArticlesTitle(articleId: string): Promise<ArticleTitle[]> {
  return apiClient.get(`/api/articles/titles/${articleId}`);
}


