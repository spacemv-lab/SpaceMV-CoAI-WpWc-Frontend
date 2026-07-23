import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'
import postcssPxToViewport from 'postcss-px-to-viewport'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV } = env
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.example.com/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.example.com/admin/，则设置 baseUrl 为 /admin/。
    base: VITE_APP_ENV === 'production' ? '/' : '/',
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src')
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    // 打包配置
    build: {
      // https://vite.dev/config/build-options.html
      sourcemap: command === 'build' ? false : 'inline',
      outDir: 'dist',
      assetsDir: 'assets',
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    // vite 相关配置
    server: {
      port: 8082,
      host: true,
      open: true,
      proxy: {
        '/dev-api': {
          // target: 'http://10.0.10.102:8080',
          target: 'http://10.0.88.1:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, '')
        },
        '/prod-api': {
          // target: 'http://10.0.10.102:8080',
          target: 'http://10.0.88.1:8080',
          changeOrigin: true
        },
        // TXWX 地图平台 API（工程列表 / 分享），代理到本地 TXWX api（全局前缀 /api）
        '/map-api': {
          target: 'https://map-coai.spacemv.com/',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/map-api/, '/api')
        },
        // COAI 地图后端 API，代理到 10.0.10.202
        '/map-coai-api': {
          target: 'http://10.0.10.202',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/map-coai-api/, '/tx_active/spacemv-coai-map/spacemv-coai-map')
        },
        // 静态文件代理：将 10.0.10.102:9300 的 /statics 请求转发到 https://www.spacemv.com
        '/statics': {
          target: 'https://www.spacemv.com',
          changeOrigin: true,
        },
        // 微信 CDN 图片代理：绕过防盗链
        '/wx-mbiz': {
          target: 'https://mmbiz.qpic.cn',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/wx-mbiz/, ''),
        },
        // Nuxt API 代理：自定义导入数据源的手动数据录入、CSV导入等操作
        '/nuxt-api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/nuxt-api/, '/api'),
        }
      }
    },
    //fix:error:stdin>:7356:1: warning: "@charset" must be the first rule in the file
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          },
          tailwindcss,
          autoprefixer,
          postcssPxToViewport({
            viewportWidth: 1920,
            viewportHeight: 1080,
            unitPrecision: 5,
            viewportUnit: 'vw',
            minPixelValue: 1,
            selectorBlackList: ['.ignore-vw'],
            exclude: [/node_modules/],
            landscape: false,
            landscapeUnit: 'vw',
            landscapeWidth: 1920
          })
        ]
      }
    },
    // Vitest 配置
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['**/*.test.{js,ts,vue}'],
      exclude: ['node_modules', 'dist', 'build'],
      setupFiles: ['./tests/setup.js'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{js,ts,vue}'],
        exclude: ['node_modules', 'dist', 'build', 'src/main.js', 'src/App.vue'],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80
        }
      },
      deps: {
        inline: ['element-plus']
      }
    }
  }
})
