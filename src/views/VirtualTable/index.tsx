/**
 * @date 2023-11-02 PM 17:50
 * @author 朴睦
 * @description 虚拟表格
 */
import { computed, defineComponent, onMounted, ref } from "vue"
import { ProTable } from "vue3-procomponents"
import { Button, Select, Space, Tag } from "ant-design-vue"
import dayjs from "dayjs"

import type { PMProTableInstance, TableColumnsType } from "@/components/ProTable/types"

export default defineComponent(function VirtualTable() {
  const seleRowKey = ref<any[]>([])
  const total = ref(1000)
  const proTableRef = ref<PMProTableInstance>()
  const dataSource = ref<Record<string, any>[]>([])
  const loading = ref(false)

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
        width: 150,
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
        width: 170,
        hideInSearch: true
      },
      {
        title: '合并',
        dataIndex: 'price',
        width: 150,
        hideInSearch: true,
        customFilterDropdown: true,
        customCell(record, index) {
          return {
            rowSpan: record.rowSpan
          }
        }
      },
      {
        title: '多级',
        dataIndex: 'dj',
        hideInSearch: true,
        children: [
          {
            title: '多级1',
            dataIndex: '多级1',
            width: 100
          },
          {
            title: '多级2',
            dataIndex: '多级2',
            width: 100
          },
        ]
      },
      {
        title: '多级pro',
        dataIndex: 'djpro',
        hideInSearch: true,
        children: [
          {
            title: '多级1pro',
            dataIndex: '多级1pro',
            width: 100
          },
          {
            title: '多级2pro',
            dataIndex: '多级2pro',
            width: 100
          },
        ]
      },
      {
        title: '操作',
        dataIndex: '',
        width: 120,
        fixed: 'right',
        customRender(opt) {
          return (
            <Space>
              <a>编辑</a>
              <a>删除</a>
            </Space>
          )
        },
      }
    ]
  })

  onMounted(() => {
    getData()
  })

  async function getData() {
    loading.value = true
    let data = await new Promise<Record<string, any>[]>((resolve) => {
      setTimeout(() => {
        const arr = []
        for (let i = 0; i < total.value; i++) {
          let price
          if (i < 5) {
            price = 5.1
          } else if (i < 10) {
            price = 331.20
          } else if (i < 20) {
            price = 531.11
          } else {
            price = 431.98
          }

          arr.push({
            id: i,
            name: `朴睦${i + 1}`,
            age: 23,
            sex: '男',
            amount: i + 2023,
            date: new Date().getTime() + i * 1000,
            price,
            phone: `1311234567${i}`,
            address: '上海市浦东新区',
            多级1pro: '多级1pro',
            多级2pro: '多级2pro',
            多级1: "多级1",
            多级2: '多级2'
          })
        }
        resolve(arr)
      }, 200)
    })
    loading.value = false
    dataSource.value = rowSpanFn(data)
  }

  function rowSpanFn(data: Record<string, any>[]) {
    let rowSpan = 1
    // 要开始合并的从哪个开始
    let n = 0
    const rowSpanList: number[] = []
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      let pre: Record<string, any> = {}
      if (i !== 0) {
        pre = data[i - 1]
      }

      if (pre.price === item.price) {
        rowSpanList[i] = 0
        rowSpan += 1
        rowSpanList[n] = rowSpan
      } else {
        rowSpanList.push(1)
        rowSpan = 1
        n = i
      }
    }

    return data.map((item, index) => ({
      ...item,
      rowSpan: rowSpanList[index]
    }))
  }

  return () => (
    <ProTable
      dataSource={dataSource.value}
      loading={loading.value}
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
      onFilterListChange={(data) => {
        dataSource.value = rowSpanFn(data)
      }}
      onQuery={(val) => {
        getData()
      }}
    />
  )
})
