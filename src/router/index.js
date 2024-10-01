import { createRouter, createWebHistory } from 'vue-router'
import FrontPageView from "@/views/FrontPageView.vue";
import MainPageView from "@/views/MainPageView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: FrontPageView
    },
    {
      path: '/main',
      name: 'main',
      component: MainPageView
    }
  ]
})

export default router
