import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 发布 npm 包时的打包
  // build: {
  //   outDir: 'lib',
  //   lib: {
  //     entry: './src/components/index.ts',
  //     name: 'protable',
  //     fileName: 'protable',
  //   },
  // }
  build: {
    outDir: 'package',
    // cssCodeSplit: true, // 强制内联CSS
    rollupOptions: {
      // 请确保外部化那些你的库中不需要的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
        },
      },
    },
    lib: {
      // entry: resolve(__dirname, 'packages/index.ts'),
      entry: './src/components/index.ts',
      name: 'protable',
      // formats: ['es', 'cjs'],
      fileName: 'protable',
    },
  }
})
