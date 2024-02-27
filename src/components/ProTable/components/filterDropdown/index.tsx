/**
 * @date 2023-06-24 PM 19:17
 * @author 邓文杰
 * @description 表头自定义筛选
 */
import { defineComponent, nextTick, reactive, ref, watch } from "vue"
import { Button, Checkbox, CheckboxGroup, Col, Input } from "ant-design-vue"
import { SearchOutlined } from '@ant-design/icons-vue'

import './index.less'

import type { FilterDropdownProps, PMSetupContext } from "../../types"
import type { ChangeEvent } from "ant-design-vue/es/_util/EventInterface"
import type { CheckboxValueType } from "ant-design-vue/es/checkbox/interface"

export default defineComponent<FilterDropdownProps>(function FilterDropdown(_, {
  attrs,
}: PMSetupContext<FilterDropdownProps>) {
  const filterData = ref(attrs.column!.customFilters! || [])
  const checkAllState = reactive({
    indeterminate: false,
    checked: true,
    checkList: attrs.column!.customFilters!
  })
  const inputVal = ref('')
  const start = ref(0)
  const end = ref(20)
  // 每行高度
  const height = ref(22)
  // 保存取消勾选的
  const notCheckList = ref<string[]>([])
  const isHoverFilter = ref(false)
  const rowContent = ref()

  /**
   * 数据改变了要修改
   */
  watch(() => attrs.column!.customFilters!, (val) => {
    filterData.value = val
    checkAllState.checkList = val
  })

  /**
   * 搜索
   */
  const handleFilterChange = (e: ChangeEvent) => {
    // setSelectedKeys 是要根据这个值搜索的
    attrs.setSelectedKeys!(e.target.value ? [e.target.value] : [])
    inputVal.value = e.target.value!

    if (e.target.value) {
      filterData.value = attrs.column!.customFilters!.filter((item) => String(item).includes(e.target.value!))
    } else {
      filterData.value = attrs.column!.customFilters!
    }
    checkAllState.checkList = filterData.value

    // 数据改变高度也要改变
    getOpenUpHeight()
  }

  /**
   * 全选 change
   */
  const handleCheckAllChange = (e: any) => {
    checkAllState.checked = e.target.checked
    // 取消全选
    if (!e.target.checked) {
      checkAllState.checkList = []
      notCheckList.value = filterData.value
    } else {
      // 全选
      checkAllState.checkList = filterData.value
      checkAllState.indeterminate = false
      notCheckList.value = []
    }
  }

  /**
   * 多选框组
   */
  const handleCheckboxGroupChange = (vals: CheckboxValueType[]) => {
    // 把勾选取消的❌掉
    // const arr: string[] = []
    for (const item of filterData.value.slice(start.value, end.value)) {
      // 取消勾选的筛进去
      if (vals.every((itex) => itex !== item)) {
        // 数组里面没有才push，有了就不用
        if (!notCheckList.value.includes(item)) {
          notCheckList.value.push(item)
        }
      } else {
        // 勾选的取消掉，如果 notCheckList 里面有
        if (notCheckList.value.includes(item)) {
          notCheckList.value = notCheckList.value.filter((itex) => itex !== item)
        }
      }
    }
    checkAllState.checkList = filterData.value.filter((item) => !notCheckList.value.includes(item))

    // 说明有某些项取消勾选了
    if (vals.length !== filterData.value.slice(start.value, end.value).length) {
      checkAllState.checked = false

      // indeterminate 只有不等于 0 和不没全勾选完才为 true
      if (vals.length !== 0) {
        checkAllState.indeterminate = true
      } else {
        checkAllState.indeterminate = false
      }
    } else {
      checkAllState.checked = true
      checkAllState.indeterminate = false
    }
  }

  /**
   * 点击重置，回到最初的值
   */
  const handleReset = () => {
    filterData.value = attrs.column!.customFilters!
    inputVal.value = ''
    checkAllState.checkList = attrs.column!.customFilters!
    checkAllState.indeterminate = false
    checkAllState.checked = true
    notCheckList.value = []

    attrs.clearFilters!({ confirm: true })
    attrs.confirm!()
  }

  /**
   * 点击确定
   */
  const handleOk = () => {
    if (checkAllState.checkList.length === attrs.column!.customFilters!.length) {
      attrs.clearFilters!({ confirm: true })
      attrs.confirm!()
      return
    }

    attrs.setSelectedKeys!(
      checkAllState.checkList.length
        ? checkAllState.checkList.filter((item) => !notCheckList.value.includes(item))
        : [null]
    )
    attrs.confirm!()
    // notCheckList.value = []
  }

  /**
   * 获取撑开的高度
   */
  const getOpenUpHeight = () => {
    const elDomList = document.querySelectorAll('.content_height')
    const elDomArr = [...elDomList]
    // 找到对应的那个
    const el = elDomArr.find((item) => attrs.column?.idx === Number(item.id.split('$')[1])) as HTMLDivElement
    if (el) {
      // 撑起的高度
      el.style.height = `${filterData.value.length * height.value}px`
    }
  }

  /**
   * 虚拟列表(大量数据)
   */
  watch(() => attrs.visible, (val) => {
    nextTick(() => {
      if (val) {
        getOpenUpHeight()
      }
    })
  }, { immediate: true })
  // 滚动事件
  const handleScroll = () => {
    const elDomList = document.querySelectorAll('.content')
    const elDomArr = [...elDomList]
    // 找到对应的那个
    const el = elDomArr.find((item) => attrs.column?.idx === Number(item.id.split('$')[1]))

    const translateYDOMList = document.querySelectorAll('.ant-checkbox-group')
    const translateYDOMArr = [...translateYDOMList]
    // 找到对应的那个
    const tEl = translateYDOMArr.find((item) => attrs.column?.idx === Number(item.id.split('$')[1])) as HTMLDivElement

    start.value = Math.floor(Math.max(el!.scrollTop / height.value, 0))
    end.value = Math.floor(Math.min(((el!.clientHeight) + el!.scrollTop) / height.value, filterData.value.length))
    tEl.style.transform = `translateY(${start.value * height.value}px)`
  }

  /**
   * 仅筛选此项
   */
  const handlefilterOnly = (item: string) => {
    checkAllState.checkList = [item]
    checkAllState.checked = false
    checkAllState.indeterminate = true
    notCheckList.value = filterData.value.filter((itex) => itex !== item)
    handleOk()
  }

  return () => {
    return (
      <div class='filter_dropdown'>
        <div class='filter'>
          <Input
            placeholder='在筛选项中搜索'
            value={inputVal.value}
            onChange={handleFilterChange}
          >
            {{ prefix: () => <SearchOutlined style={{ color: '#ccc' }} /> }}
          </Input>
        </div>

        {
          filterData.value.length ? (
            <div style={{ margin: '0 8px' }}>
              <div class='check_all'>
                <Checkbox
                  checked={checkAllState.checked}
                  indeterminate={checkAllState.indeterminate}
                  onChange={handleCheckAllChange}
                >
                  全选
                </Checkbox>
              </div>

              <div class='content' id={`id$${attrs.column?.idx}`} onScroll={handleScroll}>
                <div class='content_height' id={`id$${attrs.column?.idx}`}>
                  <CheckboxGroup
                    value={checkAllState.checkList.filter((item) => !notCheckList.value.includes(item))}
                    onChange={handleCheckboxGroupChange}
                    id={`id$${attrs.column?.idx}`}
                    style={{ width: '100%' }}
                  >
                    {
                      filterData.value.slice(start.value, end.value).map((item) => {
                        return (
                          <div
                            class='div-item'
                            onMouseenter={(e) => {
                              rowContent.value = item
                              isHoverFilter.value = true
                            }}
                            onMouseleave={() => isHoverFilter.value = false}
                          >
                            <Col class='item' style={{ height: `${height.value}px` }} span={24}>
                              <Checkbox value={item}>{item}</Checkbox>
                            </Col>
                            <div
                              class='filter-now'
                              style={{ display: isHoverFilter.value && rowContent.value === item ? 'block' : 'none' }}
                              onClick={() => handlefilterOnly(item)}
                            >
                              仅筛选此项
                            </div>
                          </div>
                        )
                      })
                    }
                  </CheckboxGroup>
                </div>
              </div>
            </div>
          ) : <div class='empty'>暂无数据</div>
        }

        <div class='footer'>
          <Button
            size='small'
            type='link'
            // disabled={checkAllState.checkList.length === attrs.column?.customFilters?.length}
            onClick={handleReset}
          >
            重置
          </Button>
          <Button size='small' type='primary' onClick={handleOk}>确定</Button>
        </div>
      </div>
    )
  }
})
