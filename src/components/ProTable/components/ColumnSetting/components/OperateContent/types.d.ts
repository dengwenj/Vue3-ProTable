import type { TableColumnsType } from "@/components/ProTable/types" 

export interface OperateContentProps {
  notHideInTableColumns: TableColumnsType
  onChangeColumns?: (values: TableColumnsType) => void
}
export interface Emit {
  changeColumns: (values: Record<string, any>[]) => {}
}
