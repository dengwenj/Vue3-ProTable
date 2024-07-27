/**
 * @date 2023-06-26 AM 10:28
 * @author 朴睦
 * @description 单元格文本可复制
 */
import { defineComponent, ref } from 'vue'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons-vue'

import { fnCopy } from '../../utils'
import { ThemeColor } from '../../conf'

import type { Opt, PMSetupContext } from '../../types'

export default defineComponent<{ opt: Opt }>(function useCopyable(_, {
  attrs
}: PMSetupContext) {
  const isCopy = ref(false)
  const copyDataIndex = ref('')
  const copyIdx = ref()

  return () => (
    <span>
      {
        isCopy.value && attrs.opt.index === copyIdx.value && attrs.opt.column.dataIndex === copyDataIndex.value
          ? <CheckOutlined style={{ color: ThemeColor, marginLeft: '4px' }} />
          : (
            <CopyOutlined
              style={{
                color: ThemeColor,
                cursor: 'pointer',
                marginLeft: '4px'
              }}
              onClick={() => {
                fnCopy(attrs.opt.text)
                isCopy.value = true
                copyIdx.value = attrs.opt.index
                copyDataIndex.value = attrs.opt.column.dataIndex as string

                // 3秒后又变成 copy icon
                setTimeout(() => {
                  isCopy.value = false
                }, 3000)
              }}
            />
          )
      }
    </span>
  )
}) 