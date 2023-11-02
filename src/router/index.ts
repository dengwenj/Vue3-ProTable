import { createRouter, createWebHistory } from 'vue-router'

import AdvancedTable from '@/views/AdvancedTable'
import VirtualTable from '@/views/VirtualTable'
import Home from '@/views/Home'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      component: Home
    },
    {
      path: '/advancedtable',
      component: AdvancedTable
    },
    {
      path: '/virtualtable',
      component: VirtualTable
    }
  ]
})

export default router
