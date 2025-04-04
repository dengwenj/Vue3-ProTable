import { createRouter, createWebHistory } from 'vue-router'

// import AdvancedTable from '@/views/AdvancedTable'
// import VirtualTable from '@/views/VirtualTable'
// import VueFile from '@/views/VueFile/index.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/advancedtable',
    },
    {
      path: '/advancedtable',
      component: import('@/views/AdvancedTable')
    },
    {
      path: '/virtualtable',
      component: import('@/views/VirtualTable')
    },
    {
      path: '/vuefile',
      component: import('@/views/VueFile/index.vue')
    },
    {
      path: '/vlist',
      component: import('@/views/VList/index.vue')
    },
    {
      path: '/vlist2',
      component: import('@/views/VList2/index.vue')
    },
    {
      path: '/vlist3',
      component: import('@/views/VList3/index.vue')
    }
  ]
})

export default router
