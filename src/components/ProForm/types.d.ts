/**
 * @date 2023-06-07 AM 10:24
 * @author 邓文杰
 * @description ProForm 组件类型
 */
import type { FormProps } from "ant-design-vue"
import type { TableColumnsType, SearchConfig } from '../ProTable/types'
import type { ComponentPublicInstance } from "vue"

export interface ProFormProps extends FormProps {
  formListData?: TableColumnsType
  search?: SearchConfig
  isShowToolRender?: boolean
  onReset?: () => void
  onCollapsed?: (isCollapsed: boolean) => void
  onQuery?: (values: Record<string, any>) => void
  queryLoading?: boolean
}

export interface FormInstance extends ComponentPublicInstance {
  // 修改 formState 的值
  setFieldsValue: (val: Record<string, any>) => void
  formRef: {
    getFieldsValue: () => Record<string, any>
    resetFields: () => void
    validateFields: (...args: any[]) => Promise
  }
}

export interface FormEmit {
  reset: string
  collapsed: string
  query: string
}