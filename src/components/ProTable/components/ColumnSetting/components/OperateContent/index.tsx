/**
 * @date 2023-07-15 PM 20:14
 * @author 邓文杰
 * @description 操作的内容
 */
import { defineComponent, reactive, ref, useAttrs, watch } from "vue"
import { Button, Checkbox, CheckboxGroup } from "ant-design-vue"
import { HolderOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue'

import './index.less'

import type { OperateContentProps, Emit } from './types'
import type { PMSetupContext } from "@/components/ProTable/types"

export default defineComponent<OperateContentProps>(function OperateContent(_, {
  emit
}: PMSetupContext<any, Emit>) {
  const attrs = useAttrs() as unknown as OperateContentProps

  const initColumnsTitleList = ref([...attrs.notHideInTableColumns.map((item) =>
    `${item.label || item.originTitle || item.title}$${item.fixed}`)
  ])
  // 需要 fixed 做判断
  const columnsTitleList = ref([...attrs.notHideInTableColumns.map((item) =>
    `${item.label || item.originTitle || item.title}$${item.fixed}`)
  ])
  const checkAllState = reactive({
    indeterminate: false,
    checked: true,
    checkList: columnsTitleList.value
  })
  const initColumnsList = ref([...attrs.notHideInTableColumns])
  // 防止直接修改 proTable 里 notHideInTableColumns 的数据，重新给个引用
  const columnsList = ref([...attrs.notHideInTableColumns])

  watch(() => attrs.notHideInTableColumns, (val) => {
    // 回到初始化
    if (attrs.notHideInTableColumns.every((item) => item.delFlag === undefined)) {
      columnsTitleList.value = [...initColumnsTitleList.value]
      columnsList.value = [...initColumnsList.value]

      checkAllState.indeterminate = false
      checkAllState.checked = true
      checkAllState.checkList = columnsTitleList.value
    }
  })

  /**
   * 点击列展示
   */
  const handleColumnsShow = (e: any) => {
    // 勾选
    if (e.target.checked) {
      checkAllState.checked = true
      checkAllState.checkList = columnsTitleList.value
    } else {
      // 取消勾选
      checkAllState.checked = false
      checkAllState.checkList = []
    }
    checkAllState.indeterminate = false

    columnsList.value = columnsList.value.map((item) => ({
      ...item,
      // 删除
      delFlag: e.target.checked ? 0 : 1
    }))
    emit('changeColumns', columnsList.value)
  }

  /**
   * 点击 Checkbox
   */
  const handleCheckbox = (checkedValue: any[]) => {
    let checked
    let indeterminate
    let checkList

    // 说明全部勾选上了
    if (checkedValue.length === columnsTitleList.value.length) {
      checked = true
      indeterminate = false
      checkList = checkedValue
    } else {
      if (checkedValue.length === 0) {
        indeterminate = false
      } else {
        indeterminate = true
      }
      checked = false
      checkList = checkedValue
    }

    checkAllState.checkList = checkList
    checkAllState.checked = checked
    checkAllState.indeterminate = indeterminate

    // 逻辑删除
    columnsList.value = columnsList.value.map((item) => {
      return {
        ...item,
        // 1 代表删除, 为 true 说明是勾选的就是 0
        delFlag: checkedValue.includes(`${item.label || item.originTitle || item.title}$${item.fixed}`) ? 0 : 1
      }
    })
    emit('changeColumns', columnsList.value)
  }

  /**
   * 点击重置
   */
  const handleReset = () => {
    // 回到初始化时候
    columnsTitleList.value = [...initColumnsTitleList.value]
    columnsList.value = [...initColumnsList.value]

    checkAllState.checked = true
    checkAllState.indeterminate = false
    checkAllState.checkList = columnsTitleList.value
    emit('changeColumns', columnsList.value)
  }

  /**
   * 拖拽到哪个元素去的
   */
  const handleDrop = (e: DragEvent) => {
    const elFromData = e.dataTransfer?.getData('idx_title')

    function rEl(el: HTMLElement): HTMLElement {
      if (el.id) return el
      return rEl(el.parentNode as HTMLElement)
    }
    const elTo = rEl(e.target as HTMLElement)

    if (columnsList.value[Number(elTo.id.split('$')[0])].fixed) {
      return
    }

    // 交换位置
    const oldIdx = Number(elFromData?.split('$')[0])
    const newIdx = Number(elTo.id.split('$')[0])
    const oldItem = columnsList.value[oldIdx]
    const newItem = columnsList.value[newIdx]
    const titleOldItem = columnsTitleList.value[oldIdx]
    const titleNewItem = columnsTitleList.value[newIdx]

    columnsList.value.splice(oldIdx, 1, newItem)
    columnsList.value.splice(newIdx, 1, oldItem)
    columnsTitleList.value.splice(oldIdx, 1, titleNewItem)
    columnsTitleList.value.splice(newIdx, 1, titleOldItem)

    // 为了上面 watch， notHideInTableColumns 为 delFlag 为 undefined 时才重置
    if (columnsList.value[newIdx].delFlag !== 1 && columnsList.value[oldIdx].delFlag !== 1) {
      columnsList.value[newIdx].delFlag = 2
      columnsList.value[oldIdx].delFlag = 2
    }
    emit('changeColumns', columnsList.value)
  }

  /**
   * 向上下移动
   */
  const handleUpOrDown = (upDown: 'up' | 'down', index: number) => {
    const oldItem = columnsList.value[index]
    const titleOldItem = columnsTitleList.value[index]
    let newItem
    let titleNewItem
    let newIdx

    if (upDown === 'up') {
      // 相当于和前一个交换位置
      newIdx = index - 1
      newItem = columnsList.value[newIdx]
      titleNewItem = columnsTitleList.value[newIdx]
    } else {
      newIdx = index + 1
      newItem = columnsList.value[newIdx]
      titleNewItem = columnsTitleList.value[newIdx]
    }

    if (columnsList.value[newIdx].fixed) {
      return
    }

    // 为了上面 watch， notHideInTableColumns 为 delFlag 为 undefined 时才重置
    if (columnsList.value[newIdx].delFlag !== 1 && columnsList.value[index].delFlag !== 1) {
      columnsList.value[newIdx].delFlag = 2
      columnsList.value[index].delFlag = 2
    }

    columnsList.value.splice(newIdx, 1, oldItem)
    columnsList.value.splice(index, 1, newItem)
    columnsTitleList.value.splice(newIdx, 1, titleOldItem)
    columnsTitleList.value.splice(index, 1, titleNewItem)
    emit('changeColumns', columnsList.value)
  }

  return () => (
    <div class='operate-content'>
      <div class='top'>
        <div>
          <Checkbox
            indeterminate={checkAllState.indeterminate}
            onChange={handleColumnsShow}
            checked={checkAllState.checked}
          >
            列展示
          </Checkbox>
        </div>
        <div><Button type='link' onClick={handleReset}>重置</Button></div>
      </div>
      <div class='content'>
        <CheckboxGroup
          value={checkAllState.checkList}
          onChange={handleCheckbox}
        >
          {
            columnsTitleList.value.map((item, index) => {
              const title = item.split('$')[0]
              const isFixed = item.split('$')[1] === 'undefined' ? false : true

              return (
                <div
                  id={`${index}$${title}`}
                  class='item'
                  // 固定了不能拖动
                  draggable={isFixed ? 'false' : 'true'}
                  onDragstart={(e) => {
                    // 从哪个元素拖拽的
                    e.dataTransfer?.setData('idx_title', (e.target as any).id)
                  }}
                  onDragover={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div class='icon'><HolderOutlined style={{ color: isFixed ? '#b8b8b8' : 'none' }} /></div>
                  <Checkbox disabled={isFixed} value={item}>{title}</Checkbox>
                  <div class='top-bottom'>
                    <div>
                      {
                        index !== 0 && !isFixed && !columnsList.value?.[index - 1].fixed && (
                          <ArrowUpOutlined
                            style={{ color: '#3875f6', marginRight: '5px', padding: '0 2px' }}
                            onClick={() => handleUpOrDown('up', index)}
                          />
                        )
                      }
                      {
                        index !== columnsList.value.length - 1 && !isFixed && !columnsList.value?.[index + 1].fixed && (
                          <ArrowDownOutlined style={{ color: '#3875f6', padding: '0 2px' }} onClick={() => handleUpOrDown('down', index)} />
                        )
                      }
                    </div>
                  </div>
                </div>
              )
            })
          }
        </CheckboxGroup>
      </div>
    </div>
  )
})
