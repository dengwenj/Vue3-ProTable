<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue'

const content = [
  '深蓝的天空中挂着一轮金黄的圆月，下面是海边的沙地，都种着一望无际的碧绿的西瓜。其间有一个十一二岁的少年，项戴银圈，手捏一柄钢叉，向一匹猹尽力地刺去。那猹却将身一扭，反从他的胯下逃走了。',
  '这少年便是闰土。我认识他时，也不过十多岁，离现在将有三十年了；那时我的父亲还在世，家景也好，我正是一个少爷。那一年，我家是一件大祭祀的值年。这祭祀，说是三十多年才能轮到一回，所以很郑重。正月里供像，供品很多，祭器很讲究，拜的人也很多，祭器也很要防偷去。我家只有一个忙月（我们这里给人做工的分三种：整年给一定人家做工的叫长年；按日给人做工的叫短工；自己也种地，只在过年过节以及收租时候来给一定的人家做工的称忙月），忙不过来，他便对父亲说，可以叫他的儿子闰土来管祭器的。',
  '闰月生的，五行缺土，所以他的父亲叫他闰土。他是能装弶捉小鸟雀的。',
  '我于是日日盼望新年，新年到，闰土也就到了。好容易到了年末，有一日，母亲告诉我，闰土来了，我便飞跑地去看。他正在厨房里，紫色的圆脸，头戴一顶小毡帽，颈上套一个明晃晃的银项圈，这可见他的父亲十分爱他，怕他死去，所以在神佛面前许下愿心，用圈子将他套住了。他见人很怕羞，只是不怕我，没有旁人的时候，便和我说话，于是不到半日，我们便熟识了。第二日，我便要他捕鸟。他说：“这不能。须大雪下了才好，我们沙地上，下了雪，我扫出一块空地来，用短棒支起一个大竹匾，撒下秕谷，看鸟雀来吃时，我远远地将缚在棒上的绳子一拉，那鸟雀就罩在竹匾下了。什么都有：稻鸡，角鸡，鹁鸪，蓝背……”'
]

// 原始数据
const data = ref<Record<string, any>[]>([])
const startIdx = ref(0)
const endIdx = ref(0)
const containerRef = ref<Element | null>(null)
const renderData = ref<Record<string, any>[]>([])
const listTranslateY = ref(0)
// 先给个预先高度
const advance = ref(100)
// 缓存列表。保存 item 的 bottom（上一个的 bottom + 当前的高度），用于计算 startIndex 索引，从哪个开始
const positions = ref<Record<string, any>[]>([])
const listRef = ref<Element | null>(null)
const spread_openRef = ref<any>(null)

for (let i = 0; i < 1000; i++) {
  // 0-3
  const idx = (Math.floor(Math.random() * content.length))
  data.value.push({
    id: i,
    content: content[idx]
  })
}

for (let i = 0; i < data.value.length; i++) {
  const item = data.value[i]
  positions.value.push({
    height: advance.value,
    bottom: (i + 1) * advance.value,
    dataItem: item
  })
}

onMounted(() => {
  getData()
})

// 数据更新后，渲染到页面上执行的回调
onUpdated(() => {
  // 获取到内容的真实高度
  const children = listRef.value?.children
  children && getContentHeight(children)
  // 撑开的高度
  let height = positions.value[positions.value.length - 1].bottom
  spread_openRef.value!.style.height = height + 'px'
})

// 获取到内容的真实高度
const getContentHeight = (children: HTMLCollection) => {
  for (const element of children) {
    // 真实高度
    const { height } = element.getBoundingClientRect()
    const index = +element.id

    positions.value[index].height = height
    const preItem = positions.value[index - 1]
     // 上一个的 bottom + 当前的高度
    if (preItem) {
      positions.value[index].bottom = preItem.bottom + height
    } else {
      // 说明是第一个
      positions.value[index].bottom = height
    }
  }
}

// 依次查找，效率不好
// const getStartIndex = (scrollTop: number) => {
//   const index = positions.value.findIndex((item) => item.bottom > scrollTop)
//   return index
// }

// 通过二分查找，效率增加
const binarySearch = (scrollTop: number) => {
  let start = 0
  let end = positions.value.length - 1
  let index = -1

  while (start <= end) {
    const midIndex = ~~((end + start) / 2)
    const bottom = positions.value[midIndex].bottom
    // console.log("start: " + start, "end: " + end, "midIndex: " + midIndex, "bottom: " + bottom)
    if (scrollTop === bottom) {
      index = midIndex
      break
    } else if (bottom < scrollTop) {
      start = midIndex + 1
    } else if (bottom > scrollTop) {
      // 要找到第一个大于的，所以不能 break
      index = midIndex
      end = midIndex - 1
    }
  }
  return index
}

const getData = () => {
  const scrollTop = containerRef.value!.scrollTop
  const containerHeight = containerRef.value!.clientHeight

  // start 的 index 就变成了：第一个 item 的 bottom >= scrollTop，就是这个的索引
  // startIdx.value = getStartIndex(scrollTop)
  startIdx.value = binarySearch(scrollTop)

  endIdx.value = Math.ceil((containerHeight / advance.value) + startIdx.value)

  // 设置缓存区
  const num = 10
  if (startIdx.value > num) {
    startIdx.value -= num - 1
  }
  endIdx.value += num

  listTranslateY.value = startIdx.value === 0 ? 0 : positions.value[startIdx.value - 1].bottom
  renderData.value = positions.value.slice(startIdx.value, endIdx.value)
}
</script>

<template>
  <!-- 容器，可视区域 -->
  <div class="container" ref="containerRef" @scroll="getData">
    <!-- 撑开的高度 -->
    <div class="spread_open" ref="spread_openRef"></div>
    <!-- list 数据 -->
    <div class="list" ref="listRef" :style="{ transform: `translateY(${listTranslateY}px)` }">
      <!-- 每一项 item -->
      <div
        class="item"
        :id="item.dataItem.id + ''" 
        v-for="item in renderData" 
        :key="item.dataItem.id"
      >
        <span style="color: red;">{{ item.dataItem.id + 1 }}：</span>{{ item.dataItem.content }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  border: 1px solid #ccc;
  height: 100%;
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
    .item {
      padding: 10px;
      border-bottom: 1px solid #ccc;
      background-color: #eee;
    }
  }
}
</style>