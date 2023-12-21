/**
 * @date 2023-12-07 AM 10:20
 * @author 朴睦
 * @description 右键菜单
 */
import { defineComponent, inject, nextTick, ref, useAttrs } from "vue"
import { ReadOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons-vue'

import { Operate, operateList } from './conf'
import ReadDetail from "./components/ReadDetail"

import './index.less'

import type { DataInfo, TableColumnsType } from "../../types"

interface RightClickMenuProps {
  rightRowEv?: MouseEvent
}

export interface RightClickMenuInstance {
  open: () => void
  isShow: boolean
}

export default defineComponent<RightClickMenuProps>(function RightClickMenu(_, {
  expose
}) {
  const attrs = useAttrs() as unknown as RightClickMenuProps
  const dataInfo = inject('dataInfo') as DataInfo

  const isShow = ref(false)
  const isShowReadDetail = ref(false)
  const readDetailRef = ref()
  const isCopy = ref(false)

  // 点击操作
  const handleOperate = (item: { title: string; value: Operate }) => {
    const map: Record<Operate, () => void> = {
      [Operate.ReadDetail]: () => {
        isShowReadDetail.value = true
        nextTick(() => readDetailRef.value.open())
      },
      [Operate.Copy]: copyRecord
    }

    map[item.value]?.()
  }

  // 复制该行
  const copyRecord = () => {
    // 创建 table
    const tableEl = document.createElement('table')
    const tbodyEl = document.createElement('tbody')
    const trEl = document.createElement('tr')
    tableEl.id = 'copy-record'
    // 创建文档片段，将标签全部放入该片段中，再统一插入doucment，这样只会渲染一次
    const fragment = document.createDocumentFragment()

    const cs: TableColumnsType = []
    // 处理成同一层级的
    function rColumns(columns: TableColumnsType) {
      for (const item of columns) {
        if (item.children?.length) {
          rColumns(item.children)
        } else {
          if (item.title !== '操作') {
            cs.push(item)
          }
        }
      }
    }
    rColumns(dataInfo.notHideInTableColumns.value)

    for (const item of cs) {
      const td = document.createElement('td')
      td.innerText = dataInfo.rightRecord.value[item.dataIndex as string]
      fragment.appendChild(td)
    }
    trEl.appendChild(fragment)
    tbodyEl.appendChild(trEl)
    tableEl.appendChild(tbodyEl)
    document.body.appendChild(tableEl)

    // 复制
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.value = tableEl.innerText
    textarea.select()
    if (document.execCommand('copy')) {
      document.execCommand('copy')
      isCopy.value = true
      document.body.removeChild(textarea)
      document.body.removeChild(tableEl)
      setTimeout(() => {
        isCopy.value = false
      }, 3000)
    }
  }

  // 点开右键菜单
  const open = () => {
    isShow.value = true

    function handleClickDoc(e: MouseEvent) {
      isShow.value = false
      document.removeEventListener('click', handleClickDoc)
    }
    document.addEventListener('click', handleClickDoc)
  }

  expose({
    open,
    isShow
  })

  return () => (
    <>
      <div
        class='right-click-menu'
        style={{
          position: 'absolute',
          left: `${attrs.rightRowEv?.clientX || 0}px`,
          top: `${attrs.rightRowEv?.clientY || 0}px`,
          display: isShow.value ? 'block' : 'none'
        }}
        onClick={(e) => {
          // 设置除了该元素外点击其他地方生效
          e.stopPropagation()
        }}
      >
        <div style={{ marginLeft: '6px' }}>行号：{dataInfo.rightRowIdx.value + 1}</div>
        <div class='right-menu-content'>
          {
            operateList.map((item) => {
              const mapIcon: Record<string, any> = {
                [Operate.ReadDetail]: <ReadOutlined />,
                [Operate.Copy]: isCopy.value ? <CheckOutlined /> : <CopyOutlined />
              }
              return (
                <div class='right-menu-item' onClick={() => handleOperate(item)}>
                  <div class='right-menu-left'>{mapIcon[item.value]}</div>
                  <div key={item.value}>{item.title}</div>
                </div>
              )
            })
          }
        </div>
      </div>

      {/* 查看详情 */}
      {isShowReadDetail.value && <ReadDetail ref={readDetailRef} />}
    </>
  )
})
