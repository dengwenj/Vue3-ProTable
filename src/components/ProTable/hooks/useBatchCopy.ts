/**
 * @date 2023-12-04 PM 15:24
 * @author 朴睦
 * @description 表格批量选中复制
 */
import { onMounted, ref, type Ref } from 'vue'

interface BatchCopyProps {
  tableRef: Ref<Element>
  sameLevelList: Ref<Record<string, any>[]>
  finallyDataSource: Ref<Record<string, any>[]>
}

export default function useBatchCopy({ 
  tableRef, 
  sameLevelList, 
  finallyDataSource
}: BatchCopyProps): {
  bList: Ref<string[]>
  moveCall: (call: () => void) => void
  upCall: (call: () => void) => void
} {
  // mousedown tb 坐标
  const mousedownCood = ref('')
  // mousemove tb 坐标
  const mousemoveCood = ref('')
  // 保存批量选中的
  const dataIndexList = ref<string[]>([])
  // 矩阵
  const matriceList = ref<number[][]>([])
  // 背景变色
  const bgcList = ref<string[]>([])
  // 移动时的回调
  const mCall = ref<() => void>()
  // 鼠标弹起时回调
  const uCall = ref<() => void>()

  // 移动时的回调
  const moveCall: (call: () => void) => void = (call) => {
    mCall.value = call
  }
  // 鼠标弹起时回调
  const upCall: (call: () => void) => void = (call) => {
    uCall.value = call
  }

  // 用于批量选中复制
  onMounted(() => {
    // 获取元素确定唯一性
    const tableEl = tableRef.value

    const mousedownCall = (e: any) => {
      let id
      function rId(el: any) {
        if (el.id) {
          id = el.id
        } else {
          rId(el.parentNode)
        }
      }
      rId(e.target)
      mousedownCood.value = id!
      // 鼠标滑动事件
      tableEl?.addEventListener('mousemove', mousemoveCall)
    }

    const mousemoveCall = (ev: any) => {
      let id
      function rId(el: any) {
        if (el.id) {
          id = el.id
        } else {
          rId(el.parentNode)
        }
      }
      rId(ev.target)
      mousemoveCood.value = id!

      // 起点位置
      const downList = mousedownCood.value?.split('$')
      // 终点位置
      const moveList = mousemoveCood.value?.split('$')

      const downX = Number(downList[1])
      const moveX = Number(moveList[1])
      const downY = Number(downList[2])
      const moveY = Number(moveList[2])

      // 第二个元素是 x 坐标
      let b
      let f
      if (downX > moveX) {
        b = downX
        f = moveX
      } else {
        b = moveX
        f = downX
      }
      // 第三个元素是 y 坐标
      let z
      let x
      if (downY > moveY) {
        z = downY
        x = moveY
      } else {
        z = moveY
        x = downY
      }

      // 用矩阵，二维数组
      const arr: number[][] = []
      // 背景变色，存放的id
      const arr1: string[] = []
      // 保存批量选中的 key
      const keyList: string[] = ([])
      for (let i = f; i <= b; i++) {
        if (sameLevelList.value[i]?.title === '操作') {
          return
        }
        
        const dataIndex = sameLevelList.value[i]?.dataIndex as string
        keyList.push(dataIndex)

        for (let j = x; j <= z; j++) {
          arr.push([i, j])
          arr1.push(`${dataIndex}$${i}$${j}`)
        }
      }
      matriceList.value = arr
      bgcList.value = arr1
      dataIndexList.value = keyList

      mCall.value?.()
    }

    // 鼠标按下时间
    tableEl?.addEventListener('mousedown', mousedownCall)

    // 鼠标弹起事件
    tableEl?.addEventListener('mouseup', () => {
      uCall.value?.()
      tableEl.removeEventListener('mousemove', mousemoveCall)
    })

    // 复制事件
    tableEl?.addEventListener('copy', function (e: any) {
      e.preventDefault()

      // 批量选中大于 1 个
      if (bgcList.value.length > 1) {
        const textarea = document.createElement('textarea')
        document.body.appendChild(textarea)

        // 创建 table 的原因是要拿到样式一致的
        const tableEl = document.createElement('table')
        const tbodyEl = document.createElement('tbody')
        // 创建文档片段，将标签全部放入该片段中，再统一插入doucment，这样只会渲染一次
        const fragment = document.createDocumentFragment()

        const start = matriceList.value[0][1]
        const end = matriceList.value[matriceList.value.length - 1][1] + 1 // +1 因为 end 需要取到
        const list = finallyDataSource.value.slice(start, end)

        for (let i = 0; i < list.length; i++) {
          const tr = document.createElement('tr')
          const fragment2 = document.createDocumentFragment()
          dataIndexList.value.forEach((key) => {
            const td = document.createElement('td')
            td.innerText = key === "序号" ? i + 1 : list[i][key]
            fragment2.appendChild(td)
          })
          tr.appendChild(fragment2)
          fragment.appendChild(tr)
        }

        tbodyEl.appendChild(fragment)
        tableEl.appendChild(tbodyEl)
        document.body.appendChild(tableEl)
        tableEl.id = "copy_table"

        const table = document.querySelector('#copy_table') as any
        textarea.value = table.innerText

        // selection 是当前选中的内容
        // 给选中的内容添加多余的内容
        e.clipboardData!.setData('text', textarea.value)

        document.body.removeChild(textarea)
        document.body.removeChild(tableEl)
      } else {
        e.clipboardData!.setData('text', window.getSelection()?.toString() || "")
      }
    })
  })

  return {
    bList: bgcList,
    moveCall,
    upCall
  }
}
