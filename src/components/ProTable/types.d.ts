/**
 * @date 2023-06-06 PM 19:55
 * @author 邓文杰
 * @description PropTable 类型
 */
import type { 
  TableProps, 
  SelectProps, 
  InputProps,
  InputNumberProps,
  DatePickerProps,
  RadioProps,
  CheckboxProps,
  SwitchProps,
  TreeSelectProps,
  UploadProps,
  TimePickerProps,
  FormItemProps,
  FormInstance,
  CascaderProps,
  FormProps,
  InputSearch,
  TextAreaProps
} from "ant-design-vue"
import type { ColumnType } from "ant-design-vue/es/table"
import type { FormInstance } from "../ProForm/types"
import type { 
  SlotsType, 
  EmitsOptions,
  SlotsType,
  Slot,
  ObjectEmitsOptions,
  Slots, 
  Ref
} from "vue"

// 要显示什么样的组件
type ValueType = 'input' | 'select' | 'inputNumber' | 'datePicker' | 'radio'
  | 'checkbox' | 'switch' | 'treeSelect' | 'upload' | 'timePicker' | 'cascader'
  | 'monthPicker' | 'quarterPicker' | 'rangePicker' | 'weekPicker' | 'yearPicker'
  | 'doubleDatePicker' | 'textarea' | 'inputSearch' | 'inputSearchFillIn'

// input、select组件等等的 props 
type OtherType = { 
  style?: StyleValue
  onSelfChange?: (val, ...args: any[]) => void
}
type FieldPropsType = {
  type: 'input'
  componentProps: InputProps & OtherType
} | {
  type: "select",
  componentProps: SelectProps & OtherType
} | {
  type: 'inputNumber',
  componentProps: InputNumberProps & OtherType
} | {
  type: 'datePicker',
  componentProps: DatePickerProps & OtherType
} | {
  type: 'radio',
  componentProps: RadioProps & OtherType
} | {
  type: 'checkbox',
  componentProps: CheckboxProps & OtherType
} | {
  type: 'switch',
  componentProps: SwitchProps & OtherType
} | {
  type: 'treeSelect',
  componentProps: TreeSelectProps & OtherType
} | {
  type: 'upload',
  componentProps: UploadProps & OtherType & { uploadText?: string }
} | {
  type: 'timePicker',
  componentProps: TimePickerProps & OtherType
} | {
  type: 'cascader',
  componentProps: CascaderProps & OtherType
} | {
  type: 'monthPicker',
  componentProps: Record<string, any> & OtherType
} | {
  type: 'quarterPicker',
  componentProps: Record<string, any> & OtherType
} | {
  type: 'rangePicker',
  componentProps: Record<string, any> & OtherType
} | {
  type: 'weekPicker',
  componentProps: Record<string, any> & OtherType
} | {
  type: 'yearPicker'
  componentProps: Record<string, any> & OtherType
} | {
  type: 'inputSearch'
  componentProps: InputSearch & OtherType
} | {
  type: 'textarea',
  componentProps: TextAreaProps & OtherType
}

export interface SearchConfig {
  // 查询按钮的文本	
  searchText?: string
  // 重置按钮的文本	
  resetText?: string
  // 标签的宽度 默认 80
  labelWidth?: number
  // 配置查询表单的列数
  colSpan?: number
  // 是否收起 默认 true
  isCollapsed?: boolean
  // 是否显示重置 默认 true
  isShowDefaultReset?: boolean
  // 是否显示查询 默认 true
  isShowDefaultQuery?: boolean
  // 是否显示收起展开 默认 true
  isShowDefaultCollapsed?: boolean
  // 渲染工具栏，支持返回一个 dom 数组，会自动增加 margin-right
  toolBarRender?: () => JSX.Element[] | JSX.Element
}

type RequestParams = (params: {
  current: number,
  pageSize: number
} & Record<string, any>
) => Promise<{
  data?: Record<string, any>[]
  total?: number
}>

interface VL {
  value?: any
  label?: string
}
interface Options {
  value?: any
  label?: string
  children?: VL[]
}

export type PMColumnType<T = any> = {
  valueType?: ValueType
  // 日期分开选择的字段
  doubleFieldList?: [string, string]
  hideInSearch?: boolean
  hideInTable?: boolean
  fieldProps?: FieldPropsType
  formItemProps?: FormItemProps & { style?: CSSProperties }
  // 查询表单项初始值	
  initialValue?: any
  options?: Options[]
  formColSpan?: number
  // 是否是数字
  valueIsNumber?: boolean,
  copy?: boolean
  // 自定义筛选数据
  customFilters?: any[]
  // 位置 idx
  idx?: number
  // 假删除列
  delFlag?: 0 | 1 | 2 // 0 代表未删，1代表删除，2代表是否拖拽
  // title 的备用，列设置有用
  label?: string,
  children?: TableColumnsType
  // 虚拟列表排序
  virtualSort?: {
    isFieldDate?: boolean
  } | boolean
  originTitle?: any
  // 自定义的渲染的是否要样式, 默认为要
  isCustomRenderStyle?: boolean
} & Pick<ColumnType<T>, keyof ColumnType>
// columns 的属性
export type TableColumnsType<T = any> = PMColumnType<T>[]

// ProTable 的属性
export interface PMProTableProps<T = any> extends TableProps<T> {
  isInitRequest?: boolean
  request?: RequestParams,
  columns?: TableColumnsType<T>
  // 是否显示搜索表单，传入对象时为搜索表单的配置
  search?: false | SearchConfig
  formProps?: FormProps
  // 重置表单时触发
  onReset?: () => void
  // 是否开启虚拟滚动，默认 true
  isVirtual?: boolean,
  // 设置行高 默认 40
  rowHeight?: number,
  // 是否展示工具栏
  isShowToolRender?: boolean
  // 为了计算表头高度，有时算不准，ui框架bug，自己写死
  tableHeader?: number,
  // 列编号
  isSerialNumber?: boolean
  onQuery?: (values: Record<string, any>, callback: () => void) => void
  // 把筛选 list 传递给业务组件
  onFilterListChange?: (filterList: Record<string, any>[]) => void
  // 开启虚拟滚动的话，建议把 classKey 写上唯一值，防止横向滚动 bug
  classKey?: string
  // 表格宽度
  tableWidth?: number
  // 表格的工具栏
  toolBarRender?: () => JSX.Element[] | JSX.Element
  // 是否展示列设置(默认为 true)
  isShowColumnSetting?: boolean
  // 是否展示可搜索
  isSearch?: boolean
  // 是否点击单元格有背景
  cellBGC?: boolean
  // 默认是否有 scroll, 虚拟表格默认为 true，分页默认为 false
  defaultScroll?: boolean
  // 是否右键菜单
  isRightMenu?: boolean
  // 行拖拽排序
  dragRow?: {
    column?: PMColumnType
    onDragSortEnd?: (
      beforeIndex: number,
      afterIndex: number,
      newDataSource: any[],
    ) => void
  }
}

export interface TableEmit {
  reset: () => void
  query: (values: Record<string, any>, callback: () => void) => void
  filterListChange: (filterList: Record<string, any>[]) => void
}
 
export interface PMProTableInstance {
  // 重新发送请求
  reload: () => void
  // 可以获取到查询表单的 form 实例，用于一些灵活的配置
  tQProFormRef: FormInstance
  heightY: number
}

interface FilterDropdownProps {
  prefixCls?: string;
  setSelectedKeys?: (selectedKeys: Key[]) => void;
  selectedKeys?: Key[];
  confirm?: (param?: FilterConfirmProps) => void;
  clearFilters?: (...arg: any[]) => void;
  filters?: ColumnFilterItem[];
  visible?: boolean;
  column?: PMColumnType;
}

export interface Opt<T = any> {
  value: any;
  text: any;
  record: T;
  index: number;
  renderIndex: number;
  column: ColumnType<T>;
}

// SetupContext 多个 attrs 泛型
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
declare const SlotSymbol: any;
type UnwrapSlotsType<S extends SlotsType, T = NonNullable<S[typeof SlotSymbol]>> = [keyof S] extends [never] ? Slots : Readonly<Prettify<{
  [K in keyof T]: NonNullable<T[K]> extends (...args: any[]) => any ? T[K] : Slot<T[K]>;
}>>;
type EmitFn<Options = ObjectEmitsOptions, Event extends keyof Options = keyof Options> = Options extends Array<infer V> ? (event: V, ...args: any[]) => void : {} extends Options ? (event: string, ...args: any[]) => void : UnionToIntersection<{
  [key in Event]: Options[key] extends (...args: infer Args) => any ? (event: key, ...args: Args) => void : (event: key, ...args: any[]) => void;
}[Event]>;
export type PMSetupContext<A = any, E = EmitsOptions, S extends SlotsType = {}> = E extends any ? {
  attrs: A;
  slots: UnwrapSlotsType<S>;
  emit: EmitFn<E>;
  expose: (exposed?: Record<string, any>) => void;
} : never;

// table provide 传递的内容
export interface DataInfo {
  notHideInTableColumns: Ref<TableColumnsType>
  rightRecord: Ref<Record<string, any>>
  rightRowIdx: Ref<number>
}
