import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import MainView from "../view/MainView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "MainView",
    component: MainView,
  },
  {
    path: "/article",
    name: "Article",
    component: () => import("../view/ArticleView.vue"),
  },
  {
    path: "/talk",
    name: "TalkView",
    component: () => import("../view/TalkView.vue"),
  },
   {
      path: '/detail/:name',
      name: 'article-detail',
      component: () => import('../view/ArticleDetail.vue'),
      props: true
    }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
export default router;
