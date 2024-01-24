import type { GetComponentProps } from "ant-design-vue/es/vc-table/interface"
import type { PMProTableProps, TableColumnsType } from "../../types"

export interface VirtualListProps<RecordType = any> {
  classKey?: string
  rowHeight?: number
  tableAttrs?: PMProTableProps
  finallyDataSource: Record<string, any>[]
  notHideInTableColumns: TableColumnsType
  heightY: number
  selectedRowKeys?: string[]
  initEmptyQuery?: boolean
  customRow?:  GetComponentProps<RecordType>
  dataChangeWantSomething?: boolean
}
