/**
 * @date 2023-11-02 PM 17:50
 * @author 朴睦
 * @description 虚拟表格
 */
import { computed, defineComponent, ref } from "vue"

import ProTable from "@/components/ProTable"

import type { TQProTableInstance, TableColumnsType } from "@/components/ProTable/types"
import { Button, Select, Tag } from "ant-design-vue"
import dayjs from "dayjs"

export default defineComponent(function VirtualTable() {
  const seleRowKey = ref<any[]>([])
  const total = ref(1000)
  const proTableRef = ref<TQProTableInstance>()

  const columns = computed<TableColumnsType>(() => {
    return [
      {
        title: '我是必填项',
        dataIndex: 'rules',
        hideInTable: true,
        formItemProps: {
          rules: [{ message: '此项必填', required: true }]
        }
      },
      {
        title: '姓名',
        dataIndex: 'name',
        customFilterDropdown: true,
        width: 100
      },
      {
        title: '年龄',
        dataIndex: 'age',
        customFilterDropdown: true,
        width: 80
      },
      {
        title: '性别',
        dataIndex: 'sex',
        customFilterDropdown: true,
        width: 80,
        customRender(opt) {
          return <Tag color='blue'>{opt.text}</Tag>
        },
        valueType: 'select',
        options: [
          {
            label: '男',
            value: 1
          },
          {
            label: '女',
            value: 0
          }
        ]
      },
      {
        title: '金额',
        dataIndex: 'amount',
        virtualSort: true,
        valueIsNumber: true,
        width: 100,
        hideInSearch: true
      },
      {
        title: '电话',
        dataIndex: 'phone',
        customFilterDropdown: true,
        width: 120
      },
      {
        title: '地址',
        dataIndex: 'address',
        width: 200,
        customFilterDropdown: true,
      },
      {
        title: '时间',
        dataIndex: 'date',
        customRender(opt) {
          return <Tag color='cyan'>{dayjs(opt.text).format('YYYY-MM-DD HH:mm:ss')}</Tag>
        },
        virtualSort: {
          isFieldDate: true
        },
        width: 200,
        hideInSearch: true
      },
      {
        title: '合并',
        dataIndex: 'rowSpan',
        width: 300,
        hideInSearch: true,
        customFilterDropdown: true,
        customCell(record, index) {
          let rowSpan
          if (index === 1) {
            rowSpan = 2
          }
          if ([2].includes(index!)) {
            rowSpan = 0
          }
          if (index === 7) {
            rowSpan = 4
          }
          if ([8, 9, 10].includes(index!)) {
            rowSpan = 0
          }
          return {
            rowSpan
          }
        }
      },
    ]
  })

  return () => (
    <ProTable
      ref={proTableRef}
      classKey="pro-table-v"
      isVirtual
      isSerialNumber
      rowHeight={40}
      columns={columns.value}
      search={{
        labelWidth: 100
      }}
      rowSelection={{
        selectedRowKeys: seleRowKey.value,
        onChange(selectedRowKeys, selectedRows) {
          seleRowKey.value = selectedRowKeys
        }
      }}
      toolBarRender={() => [
        <div>
          <span>选择条数:</span>
          <Select
            options={[
              {
                label: 1000,
                value: 1000
              },
              {
                label: 2000,
                value: 2000
              },
              {
                label: 5000,
                value: 5000
              },
              {
                label: 10000,
                value: 10000
              },
            ]}
            value={total.value}
            onChange={(val) => {
              total.value = val as number
              proTableRef.value?.reload()
            }}
          />
        </div>,
        <Button type='primary'>批量操作</Button>
      ]}
      request={async () => {
        const data = await new Promise<Record<string, any>[]>((resolve) => {
          setTimeout(() => {
            const arr = []
            for (let i = 0; i < total.value; i++) {
              arr.push({
                id: i,
                name: `朴睦${i + 1}`,
                age: 23,
                sex: '男',
                amount: i + 2023,
                date: new Date().getTime() + i * 1000,
                rowSpan: '我来把相同的价格合并下',
                phone: `1311234567${i}`,
                address: '上海市浦东新区'
              })
            }
            resolve(arr)
          }, 1000)
        })
        return {
          data
        }
      }}
    />
  )
})
