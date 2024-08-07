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