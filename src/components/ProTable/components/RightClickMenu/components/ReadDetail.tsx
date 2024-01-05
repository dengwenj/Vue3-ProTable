/**
 * @date 2023-12-21 PM 14:27
 * @author 朴睦
 * @description 右键菜单查看详情
 */
import { defineComponent, ref, inject, onMounted } from "vue"
import { Drawer, Descriptions } from 'ant-design-vue'

import type { DataInfo, TableColumnsType } from "@/components/ProTable/types"

export default defineComponent<{ onReadDetail: () => void }>(function ReadDetail(_, {
  expose,
  emit
}) {
  const dataInfo = inject('dataInfo') as DataInfo

  const isOpen = ref(false)

  onMounted(() => {
    setTimeout(() => {
      // 阻止冒泡
      document.querySelector('.read-detail')?.addEventListener('click', (e) => {
        e.stopPropagation()
      })
    })
  })

  /**
   * 关闭
   */
  const handleClose = () => {
    isOpen.value = false
    emit('readDetail')
  }

  const dom = () => {
    const cs: TableColumnsType = []
    // 处理成同一层级的
    function rColumns(columns: TableColumnsType) {
      for (const item of columns) {
        if (item.children?.length) {
          rColumns(item.children)
        } else {
          if (item.title !== '操作' && item.label !== '多选项') {
            cs.push(item)
          }
        }
      }
    }
    rColumns(dataInfo.notHideInTableColumns.value)

    return (
      <Descriptions
        bordered
        column={5}
        size='small'
        labelStyle={{ width: '100px' }}
      >
        {cs.map((item) => {
          const value = dataInfo.rightRecord.value[item.dataIndex as string]
          return (
            <Descriptions.Item label={typeof item.title === 'string' ? item.title : (item.label || item.originTitle)}>
              {item.customRender ? item.customRender({
                value,
                text: value,
                record: dataInfo.rightRecord.value,
                index: dataInfo.rightRowIdx.value,
                renderIndex: dataInfo.rightRowIdx.value,
                column: item
              }) : value}
            </Descriptions.Item>
          )
        })}
      </Descriptions>
    )
  }

  expose({
    open: () => {
      isOpen.value = true
    }
  })

  return () => (
    <>
      <Drawer
        class={'read-detail'}
        placement='bottom'
        title={`查看详情 - 第 ${dataInfo.rightRowIdx.value + 1} 行`}
        open={isOpen.value}
        onClose={handleClose}
      >
        {dom()}
      </Drawer>
    </>
  )
})
