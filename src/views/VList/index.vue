<script setup lang="ts">
import { Button, Space, Tag } from 'ant-design-vue';
import { onMounted, ref } from 'vue';

const fixedHeight = 54

const data = ref<Record<string, any>[]>([])
const renderData = ref<Record<string, any>[]>([])
const startIdx = ref(0)
const endIdx = ref(0)
const containerRef = ref<Element | null>(null)
const listTranslateY = ref(0)

for (let i = 0; i < 10000; i++) {
  data.value.push({
    id: i,
    content: `${i + 1} -> 朴睦`
  })
}

onMounted(() => {
  getData()
})

const getData = () => {
  const scrollTop = containerRef.value!.scrollTop
  const containerHeight = containerRef.value!.clientHeight
  

  startIdx.value = Math.floor(scrollTop / fixedHeight)

  // 第一种这个有白屏多一些，因为 + startIdx.value，原因：startIdx 是向下取整过的
  // endIdx.value = Math.ceil((containerHeight) / fixedHeight + startIdx.value)
  // 采用这种
  endIdx.value = Math.ceil((containerHeight + scrollTop) / fixedHeight)

  // 向上滑时低部白屏 或者 向下滑时顶部白屏，解决：提前预加载一些元素，即多增加点元素
  const num = 10
  if (startIdx.value > num) {
    startIdx.value -= num - 1
  }
  endIdx.value += num

  listTranslateY.value = startIdx.value * fixedHeight
  renderData.value = data.value.slice(startIdx.value, endIdx.value)
}
</script>

<template>
  <!-- 容器，可视区域 -->
  <div class="container" ref="containerRef" @scroll="getData">
    <!-- 撑开的高度 -->
    <div class="spread_open" :style="{ height: `${data.length * fixedHeight}px` }"></div>
    <!-- list 数据 -->
    <div class="list" :style="{ transform: `translateY(${listTranslateY}px)` }">
      <!-- 每一项 item -->
      <div class="item" :id="index + 1 + ''" :style="{ height: `${fixedHeight}px` }" v-for="(item, index) in renderData" :key="item.id">
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
.container {
  border: 1px solid #ccc;
  height: 540px;
  border-radius: 8px;
  overflow: auto;
  position: relative;

  .spread_open {
    position: absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
    z-index: -999;
  }

  .list {
    // position: absolute;
    // left: 0;
    // right: 0;
    // top: 0;
    
    .item {
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #ccc;
      background-color: #eee;
    }
  }
}
</style>