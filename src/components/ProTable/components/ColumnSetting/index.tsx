/**
 * @date 2023-07-15 PM 19:43
 * @author 邓文杰
 * @description 列设置
 */
import { defineComponent, useAttrs } from "vue"
import { Button, Dropdown, Menu, Tooltip } from "ant-design-vue"
import { SettingOutlined } from '@ant-design/icons-vue'

import OperateContent from "./components/OperateContent"

import type { Emit, OperateContentProps } from './components/OperateContent/types'
import type { TQSetupContext } from "../../types"

export default defineComponent<OperateContentProps>(function ColumnSetting(_, {
  emit
}: TQSetupContext<any, Emit>) {
  const attrs = useAttrs() as unknown as OperateContentProps

  return () => (
    <div>
      <Dropdown
        placement='bottomRight'
        destroyPopupOnHide={false}
        overlay={
          <Menu>
            <OperateContent
              notHideInTableColumns={attrs.notHideInTableColumns}
              onChangeColumns={(colums) => { emit('changeColumns', colums) }}
            />
          </Menu>
        }
        trigger='click'
      >
        <Tooltip title='列设置'>
          <Button
            type='primary'
            icon={<SettingOutlined />}
          />
        </Tooltip>
      </Dropdown>
    </div>
  )
})
