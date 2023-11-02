/**
 * @date 2023-06-26 AM 10:55
 * @author 邓文杰
 * @description 获取表格的高度 hook
 */
import { onMounted, ref, type Ref } from "vue"

import type { TQProTableProps } from "../types"
interface useTableHeightProps {
  tQProFormRef: Ref
  attrs: TQProTableProps
  clientHeight: Ref<number>
}

export default function useTableHeight({
  tQProFormRef,
  attrs,
  clientHeight
}: useTableHeightProps): [Ref<number>, () => void] {
  // 表格可视区域高度
  const heightY = ref(0)

  onMounted(() => getHeight())

  const getHeight = () => {
    // 高度自适应，页面不要出现滚动条
    const docHeight = document.body.offsetHeight

    // + 10 是 form 下面的 marginBottom
    const formHeight = tQProFormRef.value?.$el.offsetHeight + 10 || 0
    // 公共顶部
    const header = 80
    const tableHeader = document.querySelector('.ant-table-title')?.clientHeight || 0
    const footer = attrs.isVirtual ? 10 : attrs.pagination !== false ? 40 : 10
    const tableHeaderEl = document.querySelector('.ant-table-thead') 
    const tableHeaderHeight = attrs.tableHeader || tableHeaderEl!.clientHeight
    // 底部高度
    let tableFooter = 0
    if (attrs.footer || attrs.isVirtual) {
      const footerEl = document.querySelector('.ant-table-footer')
      tableFooter = footerEl!.clientHeight
    }
    heightY.value = docHeight - header - tableHeader - formHeight - tableHeaderHeight - footer - tableFooter

    // 可视区域的高度
    clientHeight.value = heightY.value
  }
  
  return [heightY, () => getHeight()]
}
