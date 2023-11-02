/**
 * @date 2023-11-02 PM 14:50
 * @author 朴睦
 * @description APP 入口页面
 */
import { defineComponent } from "vue"

import Layout from "./views/Layout"

import './App.less'

export default defineComponent(function App() {
  return () => <Layout />
})
