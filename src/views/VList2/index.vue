<script setup lang="ts">
import { Button, Space, Tag } from 'ant-design-vue';
import { onMounted, ref } from 'vue';

const fixedHeight = 54

const data = ref<Record<string, any>[]>([])
const startIdx = ref(0)
const endIdx = ref(0)
const container2Ref = ref<Element | null>(null)
const renderData = ref<Record<string, any>[]>([])
const translateY = ref(0)

for (let i = 0; i < 10000; i++) {
  data.value.push({
    id: i,
    content: `${i+1} -> ww`
  })
}

onMounted(() => {
  getData()
})

const getData = () => {
  const containerHeight = container2Ref.value!.clientHeight
  const scrollTop = container2Ref.value!.scrollTop

  startIdx.value = Math.floor(scrollTop / fixedHeight)
  endIdx.value = Math.ceil((containerHeight + scrollTop) / fixedHeight)

  // 向上滑时低部白屏 或者 向下滑时顶部白屏，解决：提前预加载一些元素，即多增加点元素
  const num = 10
  if (startIdx.value > num) {
    startIdx.value -= num - 1
  }
  endIdx.value += num

  translateY.value = (startIdx.value * fixedHeight)

  renderData.value = data.value.slice(startIdx.value, endIdx.value)
  // renderData.value = data.value.slice(startIdx.value, endIdx.value).map((item, index) => {
  //   return {
  //     ...item,
  //     translateY: translateY.value + index * fixedHeight
  //   }
  // })
}
</script>

<template>
  <div class="container2" ref="container2Ref" @scroll="getData">
    <!-- 撑开的高度 -->
    <div class="spread_open2" :style="{ height: `${data.length * fixedHeight}px` }">
      <div 
        class="item" 
        :style="{ height: `${fixedHeight}px`,  transform: `translateY(${translateY}px)` }"
        v-for="(item, index) in renderData"
        :key="item.id"
      >
        <!-- {{ item.content }} -->
        <Space>
          <div>{{ item.content }}</div>
          <Button>点击1</Button>
          <Button>点击2</Button>
          <Button>点击3</Button>
          <Button>点击4</Button>
          <Button>点击5</Button>
          <Tag>标签</Tag>
        </Space>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.container2 {
  height: 540px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: auto;

  .spread_open2 {
    position: relative;
    
    .item {
      // width: 100%;
      // position: absolute;
      // left: 0;
      // top: 0;

      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: 1px solid #ccc;
      background-color: #eee;
    }
  }
}
</style>