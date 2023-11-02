/**
 * @date 2023-11-02 PM 17:51
 * @author 朴睦
 * @description 基础表格
 */
import { computed, defineComponent } from "vue"
import { Button, Dropdown, Menu, Space, Tag } from "ant-design-vue"
import { EllipsisOutlined } from '@ant-design/icons-vue'

import ProTable from "@/components/ProTable"

import type { TableColumnsType } from "@/components/ProTable/types"

interface DataItem {
  medicine: string
  martialArts: string
  calligraphy: string
  opera: string
  tag: number
  amount: number
  time: string
}

export default defineComponent(function BaseTable() {
  const columns = computed<TableColumnsType<DataItem>>(() => [
    {
      title: '标签',
      dataIndex: 'tag',
      width: 100,
      customRender(opt) {
        return <Tag color={opt.text === 1 ? 'success' : 'error'}>{opt.text === 1 ? '成功' : '失败'}</Tag>
      },
      valueType: 'select',
      options: [
        {
          label: '成功',
          value: 1
        },
        {
          label: '失败',
          value: 0
        }
      ]
    },
    {
      title: '创建时间',
      dataIndex: 'time',
      valueType: 'datePicker',
      fieldProps: {
        type: 'datePicker',
        componentProps: {
          style: {
            width: '100%'
          }
        }
      }
    },
    {
      title: '医学',
      dataIndex: 'medicine',
    },
    {
      title: '武术',
      dataIndex: 'martialArts',
    },
    {
      title: '书法',
      dataIndex: 'calligraphy',
      copy: true
    },
    {
      title: '京剧',
      dataIndex: 'opera',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      valueIsNumber: true,
      width: 100,
      hideInSearch: true
    },
    {
      title: '操作',
      dataIndex: '',
      width: 120,
      hideInSearch: true,
      customRender(opt) {
        return (
          <Space>
            <a>操作</a>
            <a>删除</a>
          </Space>
        )
      },
    }
  ])

  return () => (
    <ProTable
      isSerialNumber
      columns={columns.value}
      toolBarRender={() => [
        <Button type='primary'>新增</Button>,
        <Dropdown
          key="menu"
          overlay={
            <Menu items={[
              {
                label: '1st item',
                key: '1',
              },
              {
                label: '2nd item',
                key: '2',
              },
              {
                label: '3rd item',
                key: '3',
              },
            ]} />
          }
        >
          <Button>
            <EllipsisOutlined />
          </Button>
        </Dropdown>
      ]}
      request={async (params) => {
        console.log(params, 'params')
        const data = await new Promise<DataItem[]>((resolve, reject) => {
          const data: DataItem[] = []
          for (let i = 0; i < 100; i++) {
            data.push({
              medicine: `医学${i}`,
              martialArts: `武术${i}`,
              calligraphy: `书法${i}`,
              opera: `京剧${i}`,
              tag: i % 2 === 0 ? 1 : 0,
              amount: i + 2023,
              time: '2023-11-02'
            })
          }

          setTimeout(() => {
            resolve(data)
          }, 1000)
        })

        return {
          data,
          total: data.length
        }
      }}
    />
  )
})
