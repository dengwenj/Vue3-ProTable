/**
 * @date 2023-06-07 AM 10:24
 * @author 朴睦
 * @description ProForm 组件
 */
import {
  defineComponent,
  ref,
  watch,
} from 'vue'
import {
  Form,
  Row,
  Col,
  Input,
  InputNumber,
  Radio,
  Checkbox,
  DatePicker,
  Select,
  Switch,
  TimePicker,
  TreeSelect,
  Upload,
  Cascader,
  Button,
  Space,
  Textarea,
  type FormInstance,
} from 'ant-design-vue'
import { UpOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons-vue'

import { fnCopy } from '../ProTable/utils'
import { ThemeColor } from '../ProTable/conf'
import './style.less'

import type { ProFormProps, FormEmit } from './types'
import type { PMColumnType, ValueType, PMSetupContext } from '../ProTable/types'

export default defineComponent<ProFormProps>(function ProForm(_, {
  attrs,
  expose,
  emit
}: PMSetupContext<ProFormProps, FormEmit>) {
  const {
    search,
    isShowToolRender
  } = attrs

  // 初始值 form表单绑定值
  const formVals: Record<string, any> = {}
  let formColSpanNum = 0
  attrs.formListData?.forEach((item) => {
    if (item.valueType === 'doubleDatePicker') {
      formVals[item.doubleFieldList![0]] = item.initialValue?.[0] ?? undefined
      formVals[item.doubleFieldList![1]] = item.initialValue?.[1] ?? undefined
    }
    formVals[item.dataIndex as string] = item.initialValue ?? undefined

    // 出现了多少次
    item.formColSpan && formColSpanNum++
  })

  const formState = ref<Record<string, any>>(formVals)
  const gutter = ref(24)
  const colSpan = ref(attrs.search?.colSpan || 6)
  const lastColSpan = ref(gutter.value)
  // 是否收起，默认收起
  const isCollapsed = ref(isShowToolRender !== false ? search?.isCollapsed ?? true : false)
  const tQProFormRef = ref<FormInstance>()
  const inputSearchRef = ref()

  watch([isCollapsed], () => {
    // 计算 lastColSpan
    // 每一行展示多少个
    const rowNum = gutter.value / colSpan.value
    // 拿到最后一行展示的多少个  rowNum - 1 是收起时要展示的数目
    const lastRowNum = isCollapsed.value ? rowNum - 1 : (attrs.formListData!.length - formColSpanNum) % rowNum
    // 就是 lastColSpan 的数目
    lastColSpan.value = gutter.value - lastRowNum * colSpan.value
  }, { immediate: true, deep: true })

  watch(() => attrs.search?.colSpan, () => {
    colSpan.value = attrs.search?.colSpan!
  })

  /**
   * 渲染组件
   * @param item 每一个 
   * @returns JSX.Element
   */
  const formComponentRender = (item: PMColumnType) => {
    const {
      valueType = 'input',
      options = [],
      dataIndex
    } = item

    // 公共的属性
    const commonProps = {
      value: formState.value[dataIndex as string],
      onChange: (val: any, ...args: any[]) => {
        // 表单改变，展开表单
        isCollapsed.value = false
        // 传递收起展开事件
        emit('collapsed', isCollapsed.value)

        if (valueType === 'inputSearch') {
          inputSearchRef.value.blur()
          return
        }

        if (['input', 'radio', 'textarea', 'inputSearchFillIn'].includes(valueType)) {
          formState.value[dataIndex as string] = val.target.value
        } else {
          item.fieldProps?.componentProps.onSelfChange?.(val, args)
          formState.value[dataIndex as string] = val
        }

        // 进行复制
        if (
          item.valueType === 'select'
          && !item.fieldProps?.componentProps.mode
          && item.fieldProps?.componentProps.showSearch
        ) {
          fnCopy(args[0].label)
        }
      },
      onfocus() {
        // 表单改变，展开表单
        isCollapsed.value = false
        // 传递收起展开事件
        emit('collapsed', isCollapsed.value)
      }
    }

    const componentMap: Record<ValueType, JSX.Element> = {
      input: (
        <Input
          placeholder={`请输入${item.title}`}
          allowClear
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
          autocomplete="off"
        />
      ),
      inputSearch: (
        <Input.Search
          ref={inputSearchRef}
          placeholder={`请选择${item.title}`}
          maxlength={0}
          enterButton
          autocomplete="off"
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      inputSearchFillIn: (
        <Input.Search
          ref={inputSearchRef}
          placeholder={`请选择${item.title}`}
          enterButton
          autocomplete="off"
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      textarea: (
        <Textarea
          placeholder={`请输入内容...`}
          maxlength={500}
          showCount
          autocomplete="off"
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      inputNumber: (
        <InputNumber
          placeholder={`请输入${item.title}`}
          autocomplete="off"
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      select: (
        <Select
          allowClear
          placeholder={`请选择${item.title}`}
          autocomplete="off"
          {...commonProps}
          options={options}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      datePicker: (
        <DatePicker
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      monthPicker: (
        <DatePicker.MonthPicker
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      quarterPicker: (
        <DatePicker.QuarterPicker
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      rangePicker: (
        <DatePicker.RangePicker
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      weekPicker: (
        <DatePicker.WeekPicker
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      yearPicker: (
        <DatePicker.YearPicker
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      radio: (
        <Radio.Group
          {...commonProps}
          options={item.options}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      checkbox: (
        <Checkbox.Group
          options={item.options}
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      switch: (
        <Switch
          checked={formState.value[dataIndex as string]}
          onChange={(val) => formState.value[dataIndex as string] = val}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      timePicker: (
        <TimePicker
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      upload: (
        <Upload
          fileList={formState.value[dataIndex as string]}
          onChange={(val) => formState.value[dataIndex as string] = val.fileList}
          {...item.fieldProps?.componentProps as any}
        >
          <Button><UploadOutlined />
            {(item.fieldProps?.componentProps as any).uploadText || '点击上传'}
          </Button>
        </Upload>
      ),
      treeSelect: (
        <TreeSelect
          autocomplete="off"
          treeData={item.options || []}
          {...commonProps}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      cascader: (
        <Cascader
          {...commonProps}
          options={item.options || []}
          {...item.fieldProps?.componentProps as any}
        />
      ),
      doubleDatePicker: (
        <div>{"下面👇🏻render函数遍历有写"}</div>
      )
    }

    if ((componentMap)[valueType]) return (componentMap)[valueType]
  }

  // 点击查询
  const handleFinish = (values: any) => {
    emit('query', values)
  }

  // 点击重置
  const handleReset = () => {
    emit('reset')
  }

  // 修改 formState 值
  const setFieldsValue = (val: Record<string, any>) => {
    for (const key of Object.keys(val)) {
      formState.value[key] = val[key]
    }
  }

  expose({
    setFieldsValue,
    formRef: tQProFormRef
  })

  return () => (
    <div class='tq_proform'>
      <Form
        ref={tQProFormRef}
        model={formState.value}
        labelCol={{
          style: {
            width: `${search?.labelWidth || 80}px`
          }
        }}
        onFinish={handleFinish}
      >
        <Row gutter={gutter.value} wrap>
          {
            attrs.formListData?.map((item, idx) => {
              return (
                <Col
                  style={{
                    // gutter.value / colSpan.value - 1 收起是要展开的数目
                    display: !isCollapsed.value || idx < gutter.value / colSpan.value - 1 ? 'block' : 'none'
                  }}
                  span={item.formColSpan || colSpan.value}
                >
                  {
                    item.valueType !== 'doubleDatePicker' ? (
                      <Form.Item
                        class={'form_item'}
                        name={item.dataIndex as string}
                        label={item.title}
                        {...item.formItemProps}
                      >
                        {formComponentRender(item)}
                      </Form.Item>
                    ) : (
                      <Form.Item
                        class={'form_item'}
                        name={item.dataIndex as string}
                        label={item.title}
                        {...item.formItemProps}
                      >
                        <div style={{ display: 'flex' }}>
                          {
                            item.doubleFieldList?.map((itex, idx) => (
                              <Form.Item
                                class={'form_item'}
                                name={itex}
                                {...item.formItemProps}
                              >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <DatePicker
                                    value={formState.value[itex]}
                                    onChange={(val) => {
                                      formState.value[itex] = val
                                      const key = item.dataIndex as string
                                      key && (formState.value[key][idx] = val)
                                    }}
                                    placement='bottomRight'
                                    {...item.fieldProps?.componentProps as any}
                                  />
                                  {idx === 0 && <span>~</span>}
                                </div>
                              </Form.Item>
                            ))
                          }
                        </div>
                      </Form.Item>
                    )
                  }
                </Col>
              )
            })
          }
          {
            isShowToolRender && (
              <Col
                class='last_col'
                span={lastColSpan.value}
              >
                <Form.Item class={'form_item'}>
                  <Space>
                    {
                      search?.toolBarRender?.()
                    }
                    {
                      search?.isShowDefaultReset !== false && (
                        <Button onClick={handleReset}>{search?.resetText || '重置'}</Button>
                      )
                    }
                    {
                      search?.isShowDefaultQuery !== false && (
                        <Button loading={attrs.queryLoading} type='primary' htmlType='submit'>{search?.searchText || '查询'}</Button>
                      )
                    }

                    {/* 收起展开 */}
                    {
                      search?.isShowDefaultCollapsed !== false && (
                        <div
                          style={{ cursor: 'pointer', color: ThemeColor }}
                          onClick={() => {
                            isCollapsed.value = !isCollapsed.value
                            // 传递收起展开事件
                            emit('collapsed', isCollapsed.value)
                          }}
                        >
                          {
                            isCollapsed.value
                              ? <span>展开<DownOutlined /></span>
                              : <span>收起<UpOutlined /></span>
                          }
                        </div>
                      )
                    }
                  </Space>
                </Form.Item>
              </Col>
            )
          }
        </Row>
      </Form>
    </div>
  )
})
