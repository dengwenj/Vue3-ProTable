/**
 * @date 2023-07-08 PM 23:48
 * @author 邓文杰
 * @description 虚拟列表封装
 */
import { defineComponent, useAttrs, type StyleValue, computed, onMounted, ref, watch } from "vue"

import VL from '../VL/index.vue'
import './index.less'

import type { VirtualListProps } from './types'
import type { TableColumnsType } from "../../types"

export default defineComponent<VirtualListProps>(function VirtualList() {
  const attrs = useAttrs() as unknown as VirtualListProps

  const rowItemWidth = ref(0)
  const thEls = ref()

  // 避免有子孩子，所以递归下
  const finallyColumns = computed(() => {
    const arr: TableColumnsType = []
    function rColumns(columns: TableColumnsType) {
      for (const item of columns) {
        if (item.children) {
          rColumns(item.children)
        } else {
          arr.push(item)
        }
      }
    }
    rColumns(attrs.notHideInTableColumns)
    return arr
  })

  onMounted(() => {
    getThEls()
  })

  watch(() => attrs.notHideInTableColumns, () => {
    getThEls()
  })

  const getThEls = () => {
    // 获取所有的 th，就能知道 th 的宽度
    const thList = document.querySelectorAll(`.${attrs.classKey} tr th`) as unknown as HTMLElement[]
    // 表格多选的 th 移除
    const thArray = [...thList].filter((item) => !item.className.includes('ant-table-selection-column'))
    const arr = [...thArray]

    // 有 children 子孩子
    if (arr.length !== attrs.notHideInTableColumns.length) {
      let flag = false
      for (let i = 0; i < thArray.length; i++) {
        const item = thArray[i]

        // 说明是子孩子
        if (Number(item.getAttribute('colstart')) < Number(thArray[i - 1]?.getAttribute('colstart'))) {
          flag = true
        }

        if (flag) {
          arr.splice(Number(item.getAttribute('colstart')), 0, item)
        }
      }

      // const res = arr.filter((item) => item.getAttribute('hassubcolumns') !== 'true').slice(0, finallyColumns.value.length)
      thEls.value = arr.filter((item) => item.getAttribute('hassubcolumns') !== 'true').slice(0, finallyColumns.value.length)

      // 表格多选的 th 移除
      // thEls.value = res.filter((item) => !item.className.includes('ant-table-selection-column'))
    } else {
      thEls.value = arr
    }


    // 获取行宽度
    rowItemWidth.value = [...thEls.value].reduce((pre, item) => pre + item.offsetWidth, 0)
  }

  return () => (
    <VL
      data={attrs.finallyDataSource}
      height={attrs.heightY}
      flxedBlockHeight={attrs.rowHeight || 26}
      pageMode={false}
      rowWidth={finallyColumns.value.reduce((pre, item) => pre + (item.width as number || 0), 0)}
      classKey={attrs.classKey || ''}
      initEmptyQuery={attrs.initEmptyQuery}
    >
      {{
        // item 是每一行的数据
        default: (item: Record<string, any>) => {
          return (
            <div
              class='row-item'
              style={{
                backgroundColor: attrs.selectedRowKeys?.includes(item.id) ? '#e6f4ff' : 'transparent',
                // 整行的宽度
                width: `${rowItemWidth.value || attrs.notHideInTableColumns.reduce((pre, item) => pre + (item.width as number || 0), 0)}px`,
              }}
              {...attrs.customRow?.(item, item.idx)}
            >
              {
                // attrs.notHideInTableColumns
                finallyColumns.value.map((itex, ity) => {
                  // itex 是 column 每一个数据
                  // 移动多少
                  const offset = [...thEls.value].filter((_, idz) => idz < ity).reduce((pre, item) => pre + (item.offsetWidth as number), 0)
                  const obj: StyleValue = itex.fixed ? {
                    zIndex: 1,
                    background: '#fff',
                    position: 'sticky',
                    [itex.fixed as 'left' | 'right']: `${itex.fixed === 'left' ? offset : 0}px`,
                    boxShadow: `${itex.fixed === 'left' ? 3 : -3}px 0px 6px #eee`,
                  } : {}

                  const cellProps = itex.customCell?.(item, item.idx, itex)
                  // rowSpan 为 undefined 或 0 时 td 就是默认的高度
                  // rowSpan 有值时，td 的高度为 rowSpan * rowHeight
                  const rowSpanStyle = cellProps?.rowSpan ? {
                    height: `${cellProps?.rowSpan * (attrs.rowHeight || 26)}px`,
                    zIndex: 999,
                    marginTop: `${(cellProps.rowSpan - 1) * (attrs.rowHeight || 26)}px`
                  } : {
                    height: `${(attrs.rowHeight || 26)}px`,
                    borderBottom: cellProps?.rowSpan === 0 ? "0px" : '1px solid #f0f0f0'
                  }
                  // 有 rowSpan td 的样式
                  const rowSpanTdStyle = cellProps?.rowSpan ? {
                    display: 'flex',
                    alignItems: 'center'
                  } : {}

                  return (
                    <div
                      class='td-item'
                      style={{
                        width: `${(thEls.value[ity]?.offsetWidth || itex.width)}px`,
                        ...obj,
                        ...rowSpanStyle,
                        ...cellProps?.style as Record<string, string>
                      }}
                      {...cellProps}
                    >
                      {
                        itex.customRender
                          ? (
                            <div
                              class={'custom-render'}
                              style={{
                                lineHeight: itex.isCustomRenderStyle !== false ? `${attrs.rowHeight || 26}px` : '',
                                padding: itex.isCustomRenderStyle !== false ? '0 10px' : '',
                                ...rowSpanTdStyle
                              }}
                            >
                              {cellProps?.rowSpan !== 0 && itex.customRender({
                                index: item.idx,
                                renderIndex: item.idx,
                                text: item[itex.dataIndex as string],
                                value: item[itex.dataIndex as string],
                                record: item,
                                column: itex,
                              })}
                            </div>
                          ) : (
                            <div
                              class='custom-render'
                              style={{
                                lineHeight: `${attrs.rowHeight || 26}px`,
                                padding: '0 10px',
                                ...rowSpanTdStyle
                              }}
                            >
                              {cellProps?.rowSpan !== 0 && item[itex.dataIndex as string]}
                            </div>
                          )
                      }
                    </div>
                  )
                })
              }
            </div>
          )
        }
      }}
    </VL>
  )
})
