/**
 * @date 2023-11-02 PM 14:50
 * @author 朴睦
 * @description APP 入口页面
 */
import { defineComponent } from "vue"

import Layout from "./views/Layout"

import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import './App.less'
import { ConfigProvider } from "ant-design-vue"

export default defineComponent(function App() {
  return () => (
    <ConfigProvider locale={zhCN}>
      <Layout />
    </ConfigProvider>
  )
})
