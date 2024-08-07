import { createRouter, createWebHistory } from 'vue-router'

import AdvancedTable from '@/views/AdvancedTable'
import VirtualTable from '@/views/VirtualTable'
import VueFile from '@/views/VueFile/index.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/advancedtable',
    },
    {
      path: '/advancedtable',
      component: AdvancedTable
    },
    {
      path: '/virtualtable',
      component: VirtualTable
    },
    {
      path: '/vuefile',
      component: VueFile
    }
  ]
})

export default router
