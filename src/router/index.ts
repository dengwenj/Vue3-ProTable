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
    }
  ]
})

export default router
