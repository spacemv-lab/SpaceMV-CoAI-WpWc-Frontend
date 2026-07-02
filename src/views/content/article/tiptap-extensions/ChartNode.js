import { Node, mergeAttributes } from '@tiptap/core'
import { getIndicatorSeries } from '@/api/content/charts'
import { getWechatDisplayUrl } from '@/utils'
import * as echarts from 'echarts'

export const ChartNode = Node.create({
  name: 'chart',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      slug: {
        default: null,
      },
      imageUrl: {
        default: null,
      },
      wechatImageUrl: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-chart-slug]',
      },
      {
        tag: 'img[data-chart-slug]',
        getAttrs: (el) => {
          if (typeof el === 'string') return {}
          return {
            slug: el.getAttribute('data-chart-slug'),
            imageUrl: el.getAttribute('src'),
            wechatImageUrl: el.getAttribute('data-wechat-src'),
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-chart-slug': node.attrs.slug,
        class: 'chart-node',
      }),
      `{{chart:${node.attrs.slug}}}`,
    ]
  },

  addNodeView() {
    return ({ node, editor }) => {
      if (node.attrs.imageUrl) {
        const wrapper = document.createElement('span')
        wrapper.className = 'chart-node-view chart-node-view--image'
        wrapper.contentEditable = 'false'
        wrapper.dataset.chartSlug = node.attrs.slug

        const label = document.createElement('span')
        label.className = 'chart-node-view__label'
        label.textContent = `📊 ${node.attrs.slug}`

        const displayUrl = node.attrs.wechatImageUrl || node.attrs.imageUrl
        const img = document.createElement('img')
        img.className = 'chart-node-view__img'
        img.referrerPolicy = 'no-referrer'
        img.src = getWechatDisplayUrl(displayUrl)
        img.alt = node.attrs.slug

        const actions = document.createElement('span')
        actions.className = 'chart-node-view__actions'
        actions.contentEditable = 'false'
        const changeBtn = document.createElement('span')
        changeBtn.className = 'chart-node-view__action'
        changeBtn.textContent = '更换'
        changeBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          if (editor.isEditable) {
            editor.chain().focus().deleteSelection().run()
            editor.emit('chart-picker-open', node.attrs.slug)
          }
        })
        const delBtn = document.createElement('span')
        delBtn.className = 'chart-node-view__action chart-node-view__action--danger'
        delBtn.textContent = '删除'
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          if (editor.isEditable) {
            editor.chain().focus().deleteSelection().run()
          }
        })
        actions.appendChild(changeBtn)
        actions.appendChild(delBtn)

        wrapper.appendChild(label)
        wrapper.appendChild(actions)
        wrapper.appendChild(img)

        return {
          dom: wrapper,
          destroy: () => {},
        }
      }

      const wrapper = document.createElement('span')
      wrapper.className = 'chart-node-view chart-node-view--interactive'
      wrapper.contentEditable = 'false'
      wrapper.dataset.chartSlug = node.attrs.slug

      const label = document.createElement('span')
      label.className = 'chart-node-view__label'
      label.textContent = `📊 ${node.attrs.slug}`

      const chartContainer = document.createElement('div')
      chartContainer.className = 'chart-node-view__chart'

      const actions = document.createElement('span')
      actions.className = 'chart-node-view__actions'
      actions.contentEditable = 'false'
      const changeBtn = document.createElement('span')
      changeBtn.className = 'chart-node-view__action'
      changeBtn.textContent = '更换'
      changeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (editor.isEditable) {
          editor.chain().focus().deleteSelection().run()
          editor.emit('chart-picker-open', node.attrs.slug)
        }
      })
      const delBtn = document.createElement('span')
      delBtn.className = 'chart-node-view__action chart-node-view__action--danger'
      delBtn.textContent = '删除'
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (editor.isEditable) {
          editor.chain().focus().deleteSelection().run()
        }
      })
      actions.appendChild(changeBtn)
      actions.appendChild(delBtn)

      const loading = document.createElement('span')
      loading.className = 'chart-node-view__loading'
      loading.textContent = '加载中…'

      wrapper.appendChild(label)
      wrapper.appendChild(actions)
      wrapper.appendChild(loading)
      wrapper.appendChild(chartContainer)

      let chartInstance = null
      let resizeObserver = null

      const renderChart = (series) => {
        chartContainer.innerHTML = ''
        loading.style.display = 'none'
        if (!chartContainer.parentNode) return

        chartInstance = echarts.init(chartContainer)
        const dates = series.map(d => d.date)
        const values = series.map(d => d.value)

        chartInstance.setOption({
          tooltip: { trigger: 'axis' },
          grid: { left: 50, right: 10, top: 10, bottom: 20 },
          xAxis: {
            type: 'category',
            data: dates,
            axisLabel: { fontSize: 10, color: '#9ca3af' },
            axisTick: { show: false },
            axisLine: { lineStyle: { color: '#e5e7eb' } },
          },
          yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
            axisLabel: { fontSize: 10, color: '#9ca3af' },
          },
          series: [{
            type: 'line',
            data: values,
            smooth: true,
            lineStyle: { color: '#0A1F3F', width: 2 },
            itemStyle: { color: '#0A1F3F' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(10,31,63,0.15)' },
                { offset: 1, color: 'rgba(10,31,63,0.01)' },
              ]),
            },
            symbol: 'circle',
            symbolSize: 3,
          }],
        }, true)

        resizeObserver = new ResizeObserver(() => {
          if (chartInstance) chartInstance.resize()
        })
        resizeObserver.observe(chartContainer)
      }

      const loadSeries = async () => {
        try {
          const res = await getIndicatorSeries(node.attrs.slug, 100)
          const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          const series = body.series || []
          if (series.length > 0) {
            renderChart(series)
          } else {
            loading.textContent = '该指标暂无时序数据'
          }
        } catch {
          loading.textContent = '加载失败'
          loading.dataset.error = ''
        }
      }

      loadSeries()

      return {
        dom: wrapper,
        destroy: () => {
          if (resizeObserver) resizeObserver.disconnect()
          if (chartInstance) chartInstance.dispose()
        },
      }
    }
  },
})
