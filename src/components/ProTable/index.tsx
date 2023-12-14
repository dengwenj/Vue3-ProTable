/**
 * @date 2023-06-06 PM 19:57
 * @author 邓文杰
 * @description ProTable 高级表格
 */
import {
  defineComponent,
  nextTick,
  onMounted,
  ref,
  watch,
} from "vue"
import { Table, Tooltip, type TablePaginationConfig, Checkbox, Space, Empty, InputSearch } from "ant-design-vue"
import { ReloadOutlined, CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons-vue'

import FilterDropdown from "./components/filterDropdown"
import TQProForm from "../ProForm"
import Copyable from "./components/Copyable"
import VirtualList from "./components/VirtualList"
import ColumnSetting from "./components/ColumnSetting"
import RightClickMenu from "./components/RightClickMenu"
import useTableHeight from "./hooks/useTableHight"
import useBatchCopy from "./hooks/useBatchCopy"
import { formatNumber, stringDateFormat } from "./utils"
import { SortOrder, ThemeColor } from "./conf"
import './index.less'

import type { TQProTableProps, TableColumnsType, TableEmit, FilterDropdownProps, TQColumnType } from './types'
import type { TableCurrentDataSource } from "ant-design-vue/es/table/interface"
import type { FormInstance } from "../ProForm/types"
import type { Opt, TQSetupContext } from "./types"

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

export default defineComponent<TQProTableProps>(function TQProTable(_, {
  attrs,
  emit,
  expose,
  slots
}: TQSetupContext<TQProTableProps, TableEmit>) {
  const {
    isInitRequest = true,
    request,
    onChange,
    isVirtual = false,
    rowHeight: rHeight = 26,
    isShowToolRender = true,
    isSearch = true
  } = attrs

  const current = ref(1)
  const pageSize = ref(10)
  // 最开始的源数据，在用虚拟列表的时候，筛选时有用
  const originDataSource = ref<Record<string, any>[]>(isVirtual ? attrs.dataSource || [] : [])
  // 请求的源数据
  const finallyDataSource = ref<Record<string, any>[]>(attrs.dataSource || [])
  const total = ref(0)
  const tQProFormRef = ref<FormInstance>()
  // 要展示的 table 列
  const notHideInTableColumns = ref<Record<string, any>[]>([])
  // 要展示的 form 表单
  const notHideInSearchColumns = ref<Record<string, any>[]>(attrs.columns?.filter((item) => {
    if (!item.hideInSearch) return item
  }) || [])
  const loading = ref(false)
  // 每行的高度
  const rowHeight = ref(rHeight)
  // 可视区域的高度
  const clientHeight = ref(0)
  // 筛选的条件数据
  const filtersData = ref<Record<string, any>>({})
  // 排序的条件数据
  const sorterData = ref<Record<string, any>>({})
  // 表头筛选是否挂载
  const isFilterDropDownMount = ref(true)
  // 获取表格高度
  const [heightY, setheightY] = useTableHeight({
    tQProFormRef,
    attrs,
    clientHeight
  })
  // row 选择
  const selectedRowKeys = ref<any[]>([])
  const selectedRows = ref<Record<string, any>[]>([])
  const initEmptyQuery = ref(false)
  const searchAll = ref('')
  // 1 源数据 2升序 3降序
  const vSortOrder = ref<SortOrder>(1)
  const oldSortOrder = ref<string>('')
  // 单元格背景色
  const cellPosition = ref('')
  // 背景变色
  const bgcList = ref<string[]>([])
  const isUserSelect = ref(false)
  // 获取 table 元素
  const tableRef = ref()
  // columns 有子孩子处理成同一级的
  const sameLevelList = ref<TableColumnsType>([])
  // 批量选中复制 hook
  const {
    bList,
    moveCall,
    upCall
  } = useBatchCopy({
    tableRef,
    sameLevelList,
    finallyDataSource,
    rowKey: typeof attrs.rowKey === 'string' ? attrs.rowKey : 'id'
  })
  // 是否显示右键菜单
  const isShowRightClickMenu = ref(false)

  onMounted(() => {
    // 首次是否发送请求
    if (isInitRequest) {
      let obj: Record<string, any> = {}
      for (const item of attrs.columns!) {
        if (item.valueType === 'doubleDatePicker') {
          obj[item.doubleFieldList![0]] = item.initialValue?.[0] ?? undefined
          obj[item.doubleFieldList![1]] = item.initialValue?.[1] ?? undefined
        }
        // initialValue 为 undefined 或 null 就不进
        if (item.initialValue ?? false) {
          obj[item.dataIndex as string] = item.initialValue
        }
      }
      initEmptyQuery.value = false
      requestCall(obj)
    } else {
      initEmptyQuery.value = true
    }

    // 鼠标移动的回调
    moveCall(() => {
      bgcList.value = bList.value

      if (cellPosition.value) {
        cellPosition.value = ''
      }

      // 批量选中大于等于 2 个
      if (bList.value.length >= 2) {
        isUserSelect.value = true
      }
    })
    // 鼠标弹起的回调
    upCall(() => {
      isUserSelect.value = false
    })
  })

  // 排序点击的 DOM
  const sortVirtualNode = (item: TQColumnType) => {
    const style = (so: SortOrder) => ({
      fontSize: '12px',
      color: (vSortOrder.value === so && oldSortOrder.value === item.dataIndex) ? ThemeColor : '#9b9c9e'
    })
    return (
      <div class='sort_virtual'>
        <span>{item.originTitle}</span>
        <div class='ad' onClick={() => handleSortVirtual(item)}>
          {/* 升序 */}
          <CaretUpOutlined style={style(SortOrder.Ascend)} />
          {/* 降序 */}
          <CaretDownOutlined style={style(SortOrder.Descend)} />
        </div>
      </div>
    )
  }

  /**
   * columns 改变
   * 初始化做的事情  notHideInTableColumns 只有在初始化用了，业务组件 columns 变了也要跟着变...TODO，「别数据污染很重要!!!」
   */
  watch(() => attrs.columns, () => {
    // 要展示的 table 列
    notHideInTableColumns.value = attrs.columns?.filter((item) => { if (!item.hideInTable) return item }) || []
    // 要展示的 form 表单
    notHideInSearchColumns.value = attrs.columns?.filter((item) => { if (!item.hideInSearch) return item }) || []

    // 列编号
    if (attrs.isSerialNumber) {
      notHideInTableColumns.value.unshift({
        title: "序号",
        dataIndex: "序号",
        fixed: 'left',
        width: 60,
        customRender(opt: Opt) {
          return <div>{(opt.record.idx ? opt.record.idx + 1 : undefined) ?? opt.index + 1}</div>
        }
      })
    }

    // 如果有子孩子，递归处理成同一级的
    const sameLevel: any[] = []
    function rSameLevel(columns: TableColumnsType) {
      for (const item of columns) {
        if (item.children?.length) {
          rSameLevel(item.children)
        } else {
          sameLevel.push(item)
        }
      }
    }
    rSameLevel(notHideInTableColumns.value)
    sameLevelList.value = sameLevel

    let checkboxColumns: any[] = [];
    (notHideInTableColumns.value as TableColumnsType).forEach((item, index) => {
      // 自定义的 body 没有选项，自己加
      if (
        isVirtual
        && attrs.rowSelection
        && notHideInTableColumns.value[0].dataIndex !== 'checkbox'
        // 只来一次
        && checkboxColumns.length === 0
      ) {
        checkboxColumns.unshift({
          // title: () => {
          //   return <Checkbox  />
          // },
          label: '多选项',
          width: 40,
          dataIndex: 'checkbox',
          fixed: 'left',
          customRender(opt: Opt) {
            return (
              <Checkbox
                checked={attrs.rowSelection?.selectedRowKeys?.includes(opt.record[attrs.rowKey as string || 'rowKeyId'])}
                value={opt.record[attrs.rowKey as string || 'rowKeyId']}
                onChange={(e) => {
                  if (e.target.checked) {
                    // 判断单选还是多选
                    if (attrs.rowSelection?.type === 'radio') {
                      // 单选只有一个
                      selectedRowKeys.value = [e.target.value]
                      selectedRows.value = [opt.record]
                    } else {
                      // 多选 push
                      selectedRowKeys.value.push(e.target.value)
                      selectedRows.value.push(opt.record)
                    }
                  } else {
                    selectedRowKeys.value = selectedRowKeys.value.filter((item) => item !== e.target.value)
                    selectedRows.value = selectedRows.value.filter((item) => item[attrs.rowKey as string || 'rowKeyId'] !== e.target.value)
                  }

                  attrs.rowSelection?.onChange?.(selectedRowKeys.value, selectedRows.value)
                }}
                {...attrs.rowSelection?.getCheckboxProps?.(opt.record)}
              />
            )
          },
        })
      }

      // 数字靠右保留两位小数
      function rValueIsNumber(columnsItem: TQColumnType) {
        if (columnsItem.children?.length) {
          for (const itez of columnsItem.children) {
            rValueIsNumber(itez)
          }
        } else {
          if (!columnsItem.customRender && columnsItem.valueIsNumber) {
            columnsItem.customRender = (opt) => {
              return (
                <div style={{ textAlign: 'right', width: '100%' }}>
                  {opt.text && formatNumber(opt.text, 2)}
                </div>
              )
            }
          }
        }
      }
      rValueIsNumber(item)

      item.resizable = true
      // 给自定义筛选数据加上初始值
      if (isVirtual) {
        // item.resizable = true

        if (!item.customFilters || item.customFilters.length === 0) {
          item.customFilters = originDataSource.value
            .map((itex) => itex[item.dataIndex as string])
            .reduce((pre, item) => {
              if (pre.some((itex: any) => itex === item)) {
                return pre
              }

              // 每一项不为空
              if (item !== '' && (item ?? false)) {
                pre.push(item)
              }
              return pre
            }, [] as string[])
        }
      } else {
        // 没有虚拟列表才开启，性能问题
        // 省略号...
        if (item.ellipsis && !item.customRender) {
          item.customRender = (opt: Opt) => (
            <div class='ellipsis'>
              <div class='tooltip'>
                {/* 只有备注有泡泡 */}
                {
                  (item.title as string).includes('备注')
                    ? <Tooltip placement="topLeft" title={opt.text}>{opt.text}</Tooltip>
                    : opt.text
                }
              </div>
              {opt.text && item.copy && <div>{<Copyable opt={opt} />}</div>}
            </div>
          )
        }

        // 是否有复制
        if (item.copy && !item.ellipsis) {
          item.customRender = (opt) => <div>{opt.text}{opt.text && <Copyable opt={opt} />}</div>
        }
      }

      /**
       * 递归添加索引做个标识在哪个位置，有子孩子
       */
      function rIdx(columnsItem: TQColumnType) {
        // 找到当前这个拿到索引
        const findIdx = sameLevel.findIndex((itex) => itex.dataIndex === columnsItem.dataIndex)

        const { children } = columnsItem
        if (children?.length) {
          for (let i = 0; i < children.length; i++) {
            rIdx(children[i])
          }
        } else {
          columnsItem.idx = findIdx
        }
      }
      rIdx(item)

      // title 是否为 字符串
      if (typeof item.title === 'function') {
        function rTitle(obj: Record<string, any>): string {
          if (obj?.children instanceof Array) {
            return rTitle(obj.children[0])
          }
          return obj?.children
        }
        item.label = rTitle((item as any).title())
      }

      // 虚拟列表是否有排序
      if (item.virtualSort) {
        item.originTitle ?? (item.originTitle = item.title)
        item.title = sortVirtualNode(item)
      }

      /**
       * 递归添加单元格点击事件
       */
      function rCell(columnsItem: TQColumnType) {
        if (columnsItem.children?.length) {
          for (const cItex of columnsItem.children) {
            rCell(cItex)
          }
        } else {
          // 说明没有孩子
          // 如果外层有先把外层的保存起来
          const outCustomCell = columnsItem.customCell
          // console.log(item, 'outCustomCell');
          // 点击单元格
          columnsItem.customCell = (record, rowIndx, column) => {
            const props = outCustomCell?.(record, rowIndx, column)
            const click = props?.onClick
            const style = props?.style as any
            delete props?.onClick
            delete props?.style

            const bgc = cellPosition.value === `${column?.dataIndex}${rowIndx}` ? {
              backgroundColor: ThemeColor
            } : {}

            const id = `${column?.dataIndex}$${(column as any).idx}$${rowIndx}`
            const bgc2 = bgcList.value.includes(id) ? { backgroundColor: ThemeColor } : {}

            // 数据有 children 加上 data-id 属性, 做个标识
            let dataIdProps: Record<string, any> = {}
            if ('children' in finallyDataSource.value?.[0]) {
              const key = typeof attrs.rowKey === 'string' ? attrs.rowKey : 'id'
              dataIdProps[`data-${key}`] = record[key]
            }

            return {
              onClick(e) {
                bgcList.value = []

                click?.(e)
                if (column?.title === '操作' || attrs.cellBGC === false) {
                  return
                }
                cellPosition.value = `${column?.dataIndex}${rowIndx}`
              },
              style: {
                ...bgc,
                ...bgc2,
                ...style
              },
              id,
              ...dataIdProps,
              // 外层写的 customCell 返回的属性值
              ...props
            }
          }
        }
      }
      rCell(item)
    })
    notHideInTableColumns.value = [
      ...checkboxColumns,
      ...notHideInTableColumns.value
    ]
  }, { immediate: true })

  /**
   * 排序监听
   */
  watch(() => vSortOrder.value, () => {
    notHideInTableColumns.value = notHideInTableColumns.value.map((item) => {
      return {
        ...item,
        title: ['function', 'string', 'undefined'].includes(typeof item.title) ? item.title : sortVirtualNode(item)
      }
    })
  })

  /**
   * 判断全选取消全选(多选才展示)
   */
  watch(() => attrs.rowSelection?.selectedRowKeys, (val) => {
    // body 自定义的
    if (attrs.isVirtual) {
      // 全选 和 取消全选
      if (attrs.rowSelection?.selectedRowKeys?.length === finallyDataSource.value.length) {
        selectedRowKeys.value = val as any[]
        selectedRows.value = finallyDataSource.value
      }
      if (attrs.rowSelection?.selectedRowKeys?.length === 0) {
        selectedRowKeys.value = []
        selectedRows.value = []
      }
    }
  })

  /**
   * 监听 dataSource 的变化
   */
  watch(() => attrs.dataSource, (val) => {
    if (!val) return

    // 说明有选择，加上 rowKeyId
    if (attrs.rowSelection) {
      finallyDataSource.value = val.map((item, idx) => {
        return {
          ...item,
          idx,
          // 有 id 还是用 id，没就用索引，判断是否分页
          rowKeyId: item.id ?? (attrs.isVirtual ? idx : (current.value - 1) * pageSize.value + idx)
        }
      })
    } else {
      finallyDataSource.value = val.map((item, idx) => ({
        ...item,
        idx
      }))
    }

    // TODO
    if (attrs.isVirtual) {
      originDataSource.value = val
    }
  }, { deep: true })

  /**
   * 调用请求
   */
  const requestCall = async (params: Record<string, any>) => {
    loading.value = true
    const res = request ? await request?.({
      current: current.value,
      pageSize: pageSize.value,
      ...params
    }) : { data: attrs.dataSource, total: attrs.dataSource?.length }
    loading.value = false

    // 说明有选择，加上 rowKeyId
    if (attrs.rowSelection) {
      res.data = res.data?.map((item, idx) => {
        return {
          ...item,
          // 有 id 还是用 id，没就用索引，判断是否分页
          rowKeyId: item.id ?? (attrs.isVirtual ? idx : (current.value - 1) * pageSize.value + idx)
        }
      })
    }

    // 给 originDataSource，的原因是做筛选
    originDataSource.value = res?.data || originDataSource.value
    if (isVirtual) {
      // 加上数据
      notHideInTableColumns.value = notHideInTableColumns.value.map((item) => {
        return {
          ...item,
          // 自定义筛选数据
          customFilters: originDataSource.value
            .map((itex) => itex[item.dataIndex as string])
            .reduce((pre, item) => {
              if (pre.some((itex: any) => itex === item)) {
                return pre
              }

              // 每一项不为空
              if (item !== '' && (item ?? false)) {
                pre.push(item)
              }
              return pre
            }, [] as string[])
        }
      })

      // 表头筛选列表挂载
      isFilterDropDownMount.value = true

      const filterList = dataSourceFilter(res?.data || finallyDataSource.value, filtersData.value)
      finallyDataSource.value = filterList.map((item, idx) => ({ ...item, idx }))
    } else {
      // 分页的
      finallyDataSource.value = res?.data || finallyDataSource.value
    }

    total.value = res?.total ?? total.value
    initEmptyQuery.value = false
  }

  /**
   * 点击分页逻辑
   */
  const paginateCall = (pagination: TablePaginationConfig) => () => {
    // 说明是 pageSize 改变了
    if (pageSize.value !== pagination.pageSize) {
      // 当前页变为 1
      current.value = 1
    } else {
      current.value = pagination.current || 1
    }
    pageSize.value = pagination.pageSize || 20
  }

  /**
   * 数据筛选
   */
  const dataSourceFilter = (data: Record<string, any>[], filters: Record<string, any>) => {
    // 都没有筛选
    if (Object.values(filters).every((item) => item === null)) {
      // 筛 search
      if (searchAll.value) {
        handleSearchAllData(searchAll.value, data)
        data = finallyDataSource.value
      }
      return data
    }

    let filterList = filterFn(data, filters)

    // 筛 search
    if (searchAll.value) {
      handleSearchAllData(searchAll.value, filterList, false)
      filterList = finallyDataSource.value
    }

    return filterList
  }

  /**
   * 根据表头进行筛选
   */
  const filterFn = (data: Record<string, any>[], filters: Record<string, any>) => {
    // 筛选后的 list
    let filterList: Record<string, any>[] = []
    // 看筛过一次没有
    let isFistFilter = false
    for (const key of Object.keys(filters)) {
      // 说明有值筛选了，不为 null
      if (filters[key]) {
        filtersData.value[key] = filters[key]

        // 说明一次都没筛过
        if (!isFistFilter) {
          filterList = data.filter((item) => {
            for (const itex of filters[key]) {
              if ((item[key] || '') === itex) {
                return item
              }
            }
          })

          // 筛过了就设为 true
          isFistFilter = true
        } else {
          filterList = filterList.filter((item) => {
            for (const itex of filters[key]) {
              // (item[key] || '').includes(itex)
              if ((item[key] || '') === itex) {
                return item
              }
            }
          })
        }

        // 筛选了，一个都没筛到就退出，后面就不用筛了
        if (filterList.length === 0) break
      }
    }

    return filterList
  }

  /**
   * 点击表头筛选逻辑
   */
  const filterCall = (filters: Record<string, any>) => () => {
    // 有虚拟列表
    if (isVirtual) {
      const filterList = dataSourceFilter(originDataSource.value, filters)
      // 把筛选 list 传递给业务组件
      emit('filterListChange', filterList)
      finallyDataSource.value = filterList.map((item, idx) => ({ ...item, idx }))
      // filter 受控的，更新 columns，不更新筛选不会变
      notHideInTableColumns.value = notHideInTableColumns.value.map((item) => {
        return {
          ...item,
          // 受控
          filteredValue: filtersData.value[item.dataIndex as string]
        }
      })
    }
  }

  /**
   * 点击表头排序逻辑
   */
  const sortCall = (sorter: Record<string, any>) => () => {
    // TODO
  }

  /**
   * 虚拟列表排序
   */
  const handleSortVirtual = (item: TQColumnType) => {
    if (finallyDataSource.value.length === 0) {
      return
    }

    // 说明是不是点击的同一列，排序就重新排
    if (item.dataIndex !== oldSortOrder.value && oldSortOrder.value !== '') {
      vSortOrder.value = SortOrder.Origin
    }
    oldSortOrder.value = item.dataIndex as string

    if (vSortOrder.value === SortOrder.Descend) {
      vSortOrder.value = SortOrder.Origin
    } else {
      // +1
      vSortOrder.value += 1
    }

    // 排序日期没有带横杠处理下
    const dateFormat = ([date1, date2]: [string, string]) => {
      // 说明不带横杠
      if (date1.length <= 8) {
        date1 = stringDateFormat(date1) || ''
        date2 = stringDateFormat(date2) || ''
      }
      return [date1, date2]
    }

    let dataSource: Record<string, any>[] = []
    // 1 源数据 2升序 3降序
    if (vSortOrder.value === SortOrder.Ascend) {
      // 升序
      dataSource = finallyDataSource.value
        .sort((a, b) => {
          // 判断是不是日期
          if (item.virtualSort instanceof Object) {
            if (item.virtualSort.isFieldDate) {
              const [date1, date2] = dateFormat([a[item.dataIndex as string], b[item.dataIndex as string]])
              return new Date(date1).getTime() - new Date(date2).getTime()
            }
          }
          return a[item.dataIndex as string] - b[item.dataIndex as string]
        })
        .map((item, idx) => {
          const obj = { ...item }
          // 判断有没有 originIdx 没有就添加，有就不管
          // 加上这个 originIdx 的原因是，排序回归到原始时知道位置
          obj.originIdx ?? (obj.originIdx = item.idx)
          obj.idx = idx
          return obj
        })
    } else if (vSortOrder.value === SortOrder.Descend) {
      // 降序
      dataSource = finallyDataSource.value
        .sort((a, b) => {
          // 判断是不是日期
          if (item.virtualSort instanceof Object) {
            if (item.virtualSort.isFieldDate) {
              const [date1, date2] = dateFormat([a[item.dataIndex as string], b[item.dataIndex as string]])
              return new Date(date2).getTime() - new Date(date1).getTime()
            }
          }
          return b[item.dataIndex as string] - a[item.dataIndex as string]
        })
    } else {
      // 源数据
      dataSource = finallyDataSource.value.sort((a, b) => a.originIdx - b.originIdx)
    }

    finallyDataSource.value = [...dataSource]
  }

  /**
   * 分页、排序、筛选变化时触发
   */
  const handleChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, any>,
    sorter: Record<string, any>,
    { currentDataSource, action }: TableCurrentDataSource
  ) => {
    // 受控
    filtersData.value = filters
    sorterData.value = sorter

    const map: Record<"sort" | "filter" | "paginate", any> = {
      paginate: paginateCall(pagination),
      filter: filterCall(filters),
      sort: sortCall(sorter)
    }
    if (map[action]) map[action]()

    // 用了虚拟列表后台就一次性把数据返回回来了，不需要再去发送请求，反之
    if (!isVirtual && action === 'paginate') {
      requestCall(tQProFormRef.value!.formRef.getFieldsValue())
    }
  }

  /**
   * 重新加载reload
   */
  const reload = (values?: Record<string, any>) => {
    requestCall(tQProFormRef.value?.formRef.getFieldsValue() || {})
  }

  /**
   * 点击重置
   */
  const handleReset = () => {
    const vals = tQProFormRef.value!.formRef.getFieldsValue()
    const isReset = Object.values(vals).some((val) => val !== undefined)
    searchAll.value = ''
    vSortOrder.value = SortOrder.Origin
    oldSortOrder.value = ''

    let isFlag = false
    if (isReset || current.value !== 1) {
      tQProFormRef.value?.formRef.resetFields()
      const newVals = tQProFormRef.value!.formRef.getFieldsValue()

      current.value = 1
      emit('reset')
      requestCall(newVals)
      isFlag = true
    }

    // 外层重置了把表头筛选列表卸载
    isFilterDropDownMount.value = false
    // 有一个不为 null 就要清除
    if (Object.values(filtersData.value).some((item) => item !== null)) {
      filtersData.value = {}
      // filter 受控的，更新 columns，不更新筛选不会变
      notHideInTableColumns.value = notHideInTableColumns.value.map((item) => {
        return {
          ...item,
          // 受控
          filteredValue: null
        }
      })

      // 说明没进上面 if，那就赋值下，进了就不用会去重新发送请求
      if (!isFlag) {
        finallyDataSource.value = originDataSource.value.map((item, idx) => ({ ...item, idx }))
      }
    }

    // 排序受控
    if (Object.values(sorterData.value).some((item) => item !== null)) {
      sorterData.value = {}
      notHideInTableColumns.value = notHideInTableColumns.value.map((item) => {
        return {
          ...item,
          // 受控
          sortOrder: null
        }
      })
    }
  }

  /**
   * 点击查询
   */
  const handleQuery = (values: Record<string, any>) => {
    // 点击查询 current 也要为1
    current.value = 1
    emit('query', values, () => {
      // requestCall(values)
    })
    requestCall(values)
  }

  /**
   * 搜索数据
   */
  const handleSearchAllData = (
    val: string,
    filterList: Record<string, any>[] = originDataSource.value,
    isBefore: boolean = true
  ) => {
    // 后筛选表头的时候可以不进了，已经筛过了
    if (isBefore) {
      // 说明表头有筛选
      if (
        Object.keys(filtersData.value).length
        && Object.values(filtersData.value).some((item) => item !== null)
      ) {
        filterList = filterFn(filterList, filtersData.value)
      }
    }

    let resData = []
    for (const item of filterList) {
      // 把 item 转换成 数组, 页面上显示的
      for (const itex of Object.values(item)) {
        // 是 number 先转换成字符串
        let data: string = itex ?? ''
        if (typeof itex === 'number') {
          data = String(itex)
        }

        // 这行 record 找到了就退出循环
        if (data.includes(val)) {
          resData.push(item)
          break
        }
      }
    }
    finallyDataSource.value = resData.map((item, idx) => ({
      ...item,
      idx
    }))
    // 把筛选 list 传递给业务组件
    emit('filterListChange', finallyDataSource.value)
  }

  /**
   * 暴露出去父组件可以用到
   */
  expose({
    reload,
    tQProFormRef: tQProFormRef,
    heightY: heightY
  })

  return () => {
    return (
      <div
        class={`pro_table ${attrs.classKey || ''}`}
        style={attrs.tableWidth ? { width: `${attrs.tableWidth}px` } : {}}
      >
        {/* 高级 form 组件 */}
        {
          attrs.search !== false && (
            <TQProForm
              ref={tQProFormRef}
              search={attrs.search}
              formListData={notHideInSearchColumns.value}
              onReset={handleReset}
              // 点击收起展开重新计算 table 高度
              onCollapsed={(isCollapsed) => {
                nextTick(() => {
                  setheightY()
                })
              }}
              onQuery={handleQuery}
              isShowToolRender={isShowToolRender}
              queryLoading={loading.value}
            />
          )
        }

        {/* 表格 */}
        <div ref={tableRef}>
          <Table
            style={isUserSelect.value ? { userSelect: 'none' } : {}}
            rowKey='id'
            loading={loading.value}
            // 是否启用虚拟列表
            {...(attrs.isVirtual ? {
              components: {
                body: () => {
                  return (
                    <VirtualList
                      classKey={attrs.classKey}
                      rowHeight={attrs.rowHeight}
                      finallyDataSource={finallyDataSource.value}
                      notHideInTableColumns={notHideInTableColumns.value.filter((item) => item.delFlag !== 1)}
                      heightY={attrs.scroll?.y as number || heightY.value}
                      selectedRowKeys={selectedRowKeys.value}
                      initEmptyQuery={initEmptyQuery.value}
                      customRow={attrs.customRow}
                    />
                  )
                }
              }
            } : {})}
            dataSource={finallyDataSource.value}
            customRow={(record, index) => {
              return {
                style: {
                  height: `${rowHeight.value}px`,
                  backgroundColor: index! % 2 === 0 ? '#fafafa' : '#fff'
                },
                onContextmenu(e) {
                  e.preventDefault()
                  isShowRightClickMenu.value = true
                }
              }
            }}
            pagination={isVirtual ? false : {
              total: total.value,
              current: current.value,
              pageSize: pageSize.value,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total: number) => <div>共 {total} 条</div>
            }}
            locale={{
              emptyText: <Empty image={simpleImage} description={initEmptyQuery.value ? '请手动点击查询' : '暂无数据'} />
            }}
            onResizeColumn={(width, row) => row.width = width}
            onChange={typeof onChange === 'function' ? onChange : handleChange}
            {...attrs}
            // columns 要在 attrs 在后面, item.delFlag 为 1 代表删除的
            columns={notHideInTableColumns.value.filter((item) => item.delFlag !== 1)}
            {...(isVirtual || attrs.defaultScroll ? {
              scroll: { y: heightY.value, ...attrs.scroll }
            } : {})}
            {...(attrs.isVirtual ? {
              footer: () => {
                return (
                  <div class='my-footer'>
                    <div class='c-footer'>{attrs.footer?.(finallyDataSource.value)}</div>
                    {/* 这里根据可搜索数据一起的 */}
                    {isSearch && <div class='total'>总 {finallyDataSource.value.length} 条</div>}
                  </div>
                )
              }
            } : {})}
          >
            {/* 自定义筛选插槽 */}
            {{
              customFilterDropdown: (info: FilterDropdownProps) => {
                return (
                  <div>
                    {
                      isFilterDropDownMount.value && (
                        <FilterDropdown {...info} />
                      )
                    }
                  </div>
                )
              },
              ...slots,
              title: () => {
                return (
                  <div class='title'>
                    <div>{slots.title?.()}</div>

                    <div class='tool'>
                      {/* 可搜索 */}
                      {
                        (attrs.isVirtual && isSearch) && (
                          <div class='search-all'>
                            <InputSearch
                              value={searchAll.value}
                              placeholder='可搜索数据'
                              style={{ width: '180px' }}
                              allowClear
                              onSearch={(val) => handleSearchAllData(val)}
                              onChange={(val) => searchAll.value = val.target.value!}
                            />
                          </div>
                        )
                      }

                      {/* 表格工具栏 */}
                      <div class='tool-bar'>
                        <Space>{attrs.toolBarRender?.()}</Space>
                      </div>

                      {/* 刷新 */}
                      {
                        attrs.search !== false && attrs.request && (
                          <div class='reload'>
                            <Tooltip title='刷新'>
                              <ReloadOutlined onClick={() => reload()} />
                            </Tooltip>
                          </div>
                        )
                      }

                      {/* 列设置 */}
                      {attrs.isShowColumnSetting !== false && (
                        <div>
                          <ColumnSetting
                            notHideInTableColumns={notHideInTableColumns.value}
                            onChangeColumns={(columns) => {
                              notHideInTableColumns.value = columns
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              },
            }}
          </Table>
        </div>

        {/* 右键菜单 */}
        {isShowRightClickMenu.value && (
          <RightClickMenu />
        )}
      </div>
    )
  }
})
