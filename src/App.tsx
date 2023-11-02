/**
 * @date 2023-11-02 PM 14:50
 * @author 朴睦
 * @description APP 入口页面
 */
import { computed, defineComponent } from "vue"

import ProTable from "./components/ProTable"
import Layout from "./views/Layout"

import './App.less'

import type { TableColumnsType } from "./components/ProTable/types"

export default defineComponent(function App() {
  const columns = computed<TableColumnsType>(() => {
    return [
      {
        title: 'test1',
        dataIndex: 'test1',
      },
      {
        title: 'test2',
        dataIndex: 'test2'
      },
      {
        title: 'test3',
        dataIndex: 'test3'
      },
      {
        title: 'test4',
        dataIndex: 'test4'
      },
    ]
  })

  return () => (
    <div style={{ height: '100%' }}>
      <Layout />
    </div>
  )
})
