import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
// 开启压缩的
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [AntDesignVueResolver()],
    }),
    Components({
      resolvers: [
        AntDesignVueResolver({}),
      ],
    }),
    viteCompression({
        // 开启 gzip 压缩
        algorithm: 'gzip',
        // 生成 .gz 文件
        ext: '.gz',
        // 仅对大于 1kb 的文件进行压缩
        threshold: 1024,
    }),
    viteCompression({
        // 开启 brotli 压缩
        algorithm: 'brotliCompress',
        // 生成 .br 文件
        ext: '.br',
        threshold: 1024,
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      // 排除 Ant Design Vue，不进行打包，使用 cdn 引入
      // external: ['ant-design-vue'],
      manualChunks(id) {
        if (id.includes('node_modules')) {
          // 拆分第三方依赖
          if (id.includes('ant-design-vue')) {
            return 'ant-design-vue';
          }
          return 'vendor'; // 其他依赖打包到 vendor，避免拆分过细 导致 HTTP 请求过多
          // // 按包名精细化拆分
          // const packageName = id.match(/node_modules\/(.+?)\//)?.[1]
          // return packageName ? `vendor/${packageName}` : 'vendor'
        }

        if (id.includes('src/views')) {
          return 'views'
        }

        if (id.includes('src/components')) {
          return 'components'
        }
      }
    }
  }
  // 发布 npm 包时的打包
  // build: {
  //   outDir: 'lib',
  //   // cssCodeSplit: true, // 强制内联CSS
  //   rollupOptions: {
  //     // 请确保外部化那些你的库中不需要的依赖
  //     external: ['vue'],
  //     output: {
  //       // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
  //       globals: {
  //         vue: 'Vue',
  //       },
  //     },
  //   },
  //   lib: {
  //     // entry: resolve(__dirname, 'packages/index.ts'),
  //     entry: './src/components/index.ts',
  //     name: 'protable',
  //     // formats: ['es', 'cjs'],
  //     fileName: 'protable',
  //   },
  // }
})
