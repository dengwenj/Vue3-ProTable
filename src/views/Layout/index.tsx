/**
 * @date 2023-11-02 PM 17:31
 * @author 朴睦
 * @description 布局
 */
import { defineComponent, onMounted, ref } from "vue"
import { RouterView, useRoute, useRouter } from "vue-router"
import { Layout, LayoutContent, LayoutHeader, LayoutSider, Menu } from "ant-design-vue"

import menuList from "./conf"

import './index.less'
import type { MenuInfo } from "ant-design-vue/es/menu/src/interface"

export default defineComponent(function myLayout() {
  const router = useRouter()
  const route = useRoute()

  const selectedKeys = ref([route.path])

  onMounted(() => {
    setTimeout(() => {
      selectedKeys.value = [route.path]
    })
  })

  const handleMenu = (data: MenuInfo) => {
    router.push(data.key as string)
    selectedKeys.value = [data.key as string]
  }

  return () => (
    <Layout>
      <LayoutSider>
        <div class='logo'>ProTable</div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuList}
          selectedKeys={selectedKeys.value}
          onClick={handleMenu}
        />
      </LayoutSider>
      <LayoutContent>
        <div
          class='content1'
          style={{ marginLeft: '200px' }}
        >
          <RouterView />
        </div>
      </LayoutContent>
    </Layout>
  )
})