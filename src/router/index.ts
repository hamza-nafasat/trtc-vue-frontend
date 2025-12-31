import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import TRTCCallWindow from '../components/TRTCCallWindow.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tencent-video-call',
  },
  {
    path: '/tencent-video-call',
    name: 'home',
    component: TRTCCallWindow,
  },
  {
    path: '/invite',
    name: 'invite',
    component: () => import(/* webpackChunkName: "about" */ '../views/Invite.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
