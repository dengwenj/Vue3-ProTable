# ProTable，用于快速开发，只做增强，不做改变

### 灵感来源于 AntDesign 的 pro-components 高级组件库(React)
* 打造一个基于 Vue 的 ProTable 高级组件

### 安装
```
npm install vue3-procomponents
```

#### [文档地址](https://github.com/dengwenj/Vue3-ProTable/blob/main/src/components/ProTable/types.d.ts)
#### 1、支持书写 jsx、vue 文件
#### 2、支持表单搜索
#### 3、支持虚拟列表
#### 4、支持批量选中复制
#### 5、支持模糊搜索
#### 6、支持列设置
#### 7、右键菜单功能
#### 8、表格拖拽排序
#### 9、编辑表格待开发
#### 更多请看文档和网站

### 🔨使用
```ts
import { createApp } from 'vue'

import App from './App'
import router from './router'
// 引入 vue3-procomponents 的样式
import 'vue3-procomponents/src/components/lib/style.css'
 
const app = createApp(App)

app.use(router)

app.mount('#app')
```
#### .jsx 方式
```tsx
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
  hh: string
  xx: string
  ww: string
  多级1Pro: string
  多级2Pro: string
}

export default defineComponent(function AdvancedTable() {
  const columns = computed<TableColumnsType<DataItem>>(() => [
    {
      title: '我是必填项',
      dataIndex: 'rules',
      hideInTable: true,
      formItemProps: {
        rules: [{ message: '此项必填', required: true }]
      }
    },
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
      title: '轮询时间',
      dataIndex: 'loop',
      valueType: 'doubleDatePicker',
      doubleFieldList: ['loopStart', 'loopEnd'],
      hideInTable: true
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
      title: "多级",
      dataIndex: "dj",
      hideInSearch: true,
      children: [
        {
          title: "哈哈",
          dataIndex: "hh"
        },
        {
          title: "嘻嘻",
          dataIndex: "xx"
        },
        {
          title: "微微",
          dataIndex: "ww"
        }
      ]
    },
    {
      title: "多级Pro",
      dataIndex: "多级Pro",
      hideInSearch: true,
      children: [
        {
          title: "多级1Pro",
          dataIndex: "多级1Pro"
        },
        {
          title: "多级2Pro",
          dataIndex: "多级2Pro"
        },
      ]
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
      search={{
        labelWidth: 100,
        toolBarRender() {
          return [
            <Button>导出</Button>
          ]
        },
      }}
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
              time: '2023-11-02',
              hh: "哈哈",
              xx: "嘻嘻",
              ww: "微微",
              多级1Pro: "多级1Pro",
              多级2Pro: "多级2Pro"
            })
          }

          setTimeout(() => {
            resolve(data)
          }, 200)
        })

        return {
          data,
          total: data.length
        }
      }}
    />
  )
})
```

#### .vue 方式
**注意📢：属性尽量写成驼峰式的方式，保持和定义的属性一致，以免出现 bug**
```vue
<script setup lang="ts">
import { ProTable } from '@/components'
import { computed, ref } from 'vue';

import type { TableColumnsType } from "@/components/ProTable/types";


const dataSource = ref([{
  runtu: "深蓝的天空中挂着一轮金黄的圆月，下面是海边的沙地，都种着一望无际的、碧绿的西瓜。其间有一个十一、二岁的少年，项带银圈，手捏一柄钢叉，向一匹猹尽力地刺去。那猹却将身一扭，反从他的胯下逃走了。"
}])

const columns = computed<TableColumnsType>(() => {
  return [
    {
      title: '少年闰土',
      dataIndex: 'runtu'
    }
  ]
})
</script>

<template>
  <div>
    <ProTable 
      :columns="columns"
      :dataSource="dataSource"
      :search="{
        isCollapsed: false
      }"
    >
      <template #bodyCell="{column, record}">
        <template v-if="column.dataIndex === 'runtu'">
          <a style="color: red;">
            {{ record.runtu }}
          </a>
        </template>
      </template>

      <!-- 更多写法可以看 Ant Design Vue 文档 https://next.antdv.com/components/table-cn -->
    </ProTable> 
  </div>
</template>
```