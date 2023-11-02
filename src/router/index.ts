import { createRouter, createWebHistory } from 'vue-router'

import BaseTable from '@/views/BaseTable'
import AdvancedTable from '@/views/AdvancedTable'
import VirtualTable from '@/views/VirtualTable'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/basetable',
      component: BaseTable,
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
