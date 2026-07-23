/**
* Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
*This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="mobile-board ignore-vw">

    <div v-if="hasAvailableProductPlatform" class="mobile-board-header">
      <div class="mobile-cascader-row">
        <el-cascader
          v-model="selectedCascaderValue"
          :options="cascaderOptions"
          :props="cascaderProps"
          placeholder="请选择产品和平台"
          @change="handleCascaderChange"
          clearable
        />
      </div>
      <div class="mobile-notice" v-if="isWeChatPlatform">
        <el-icon class="mobile-notice-icon"><WarningFilled /></el-icon>
        <span class="mobile-notice-text">
          数据统计范围：账号绑定日起至昨天({{ yesterdayDate }})，如需补充数据请前往<span class="mobile-notice-link" @click="goToMediaProductDetail">「自媒体管理-详情」</span>中手动同步
        </span>
      </div>
      <div class="mobile-action-row">
        <el-button size="small" @click="toggleFullScreen" class="mobile-action-btn">
          全屏
        </el-button>
        <el-button size="small" @click="downloadBoardAsImage" class="mobile-action-btn">
          下载图片
        </el-button>
      </div>
    </div>

    <template v-if="hasAvailableProductPlatform">
      <div class="mobile-board-title">
        <div class="mobile-title-deco"></div>
        <span class="mobile-title-text">{{ selectedProduct ? selectedProduct.name : '' }} 运营数据</span>
        <div class="mobile-title-deco"></div>
      </div>

      <div ref="fullscreenContainer" class="mobile-board-body">
        <div class="mobile-stats-row">
          <StatCard label="总用户数" :value="totalUsers" name="总用户数" />
          <StatCard label="总阅读人数" :value="totalReaders" name="总阅读人数" />
          <StatCard label="总分享人数" :value="totalSharers" name="总分享人数" />
        </div>

        <div class="mobile-charts-section">
          <div class="mobile-tabs">
            <div class="mobile-tab" :class="{ active: activeTab === '7days' }" @click="switchTab('7days')">7天</div>
            <div class="mobile-tab" :class="{ active: activeTab === '1month' }" @click="switchTab('1month')">30天</div>
            <div style="display: none;" class="mobile-tab" :class="{ active: activeTab === '6months' }" @click="switchTab('6months')">半年</div>
            <div style="display: none;" class="mobile-tab" :class="{ active: activeTab === '1year' }" @click="switchTab('1year')">1年</div>
            <div class="mobile-tab" :class="{ active: activeTab === 'all' }" @click="switchTab('all')">全部</div>
          </div>

          <div class="mobile-charts-list">
            <ChartCard title="阅读流量趋势图" :chartRef="el => readTrendChart = el" height="220px" />
            <ChartCard title="分享流量趋势图" :chartRef="el => shareTrendChart = el" height="220px" />
            <ChartCard title="阅读人数流量来源占比" :chartRef="el => readSourceChart = el" height="220px" />
          </div>

          <div class="mobile-follow-charts">
            <ChartCard title="新增关注人数" :chartRef="el => newFollowChart = el" height="220px" />
            <ChartCard title="累计关注人数" :chartRef="el => totalFollowChart = el" height="220px" />
          </div>
        </div>

        <div class="mobile-ranking-section">
          <div class="mobile-ranking-tip">根据微信官方接口能力，仅统计文章发表后30天内的数据</div>
          <RankingCard title="阅读后关注人数排行Top10文章" :data="followRankingData" height="180px" />
          <div class="mobile-data-row">
            <DataCard :value="bestReaders" name="最佳阅读人数" />
            <DataCard :value="bestSharers" name="最佳分享人数" />
          </div>
        </div>
      </div>
    </template>

    <div v-else class="mobile-empty-state">
      <el-empty description="暂无数据，需先于自媒体产品管理菜单中绑定自媒体产品及平台" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { WarningFilled } from '@element-plus/icons-vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'
import RankingCard from '@/components/dashboard/RankingCard.vue'
import DataCard from '@/components/dashboard/DataCard.vue'
import html2canvas from 'html2canvas'
import { getUserTotalData, getReadTrendData, getNewFollowData, getTotalFollowData, getFollowRankingData, getBestReadersAndSharersData } from '@/api/dashboard/wechatBoard/index'
import { getMediaProductList } from '@/api/media/mediaProduct/index'

// 自媒体产品列表
const productList = ref([])

// 是否有可用的产品平台
const hasAvailableProductPlatform = ref(false)

// 选中的产品索引
const selectedProductIndex = ref(0)

// 选中的平台索引
const selectedPlatformIndex = ref(0)

// 获取 router 实例
const router = useRouter()

// 当前选中的产品
const selectedProduct = computed(() => {
  return productList.value[selectedProductIndex.value]
})

// 当前产品的平台列表
const currentPlatformList = computed(() => {
  return selectedProduct.value ? selectedProduct.value.platforms : []
})

// 是否选择了微信平台（channel id 为 1）
const isWeChatPlatform = computed(() => {
  const currentPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  return currentPlatform?.id === 1
})

// 级联选择器相关
const selectedCascaderValue = ref([])

// 级联选择器配置
const cascaderProps = {
  expandTrigger: 'hover',
  value: 'id',
  label: 'name',
  children: 'children'
}

// 级联选择器选项
const cascaderOptions = ref([])

// 处理级联选择器变化
const handleCascaderChange = (value) => {
  if (value && value.length === 2) {
    const [productId, platformId] = value
    
    // 找到对应的产品和平台索引
    const productIndex = productList.value.findIndex(p => p.id === productId)
    const platformIndex = productList.value[productIndex]?.platforms.findIndex(p => p.id === platformId)
    
    if (productIndex !== -1) {
      selectedProductIndex.value = productIndex
    }
    if (platformIndex !== -1) {
      selectedPlatformIndex.value = platformIndex
    }
    
    // 获取数据
    fetchAllData()
  }
}

// 获取当前日期的前一天
const yesterdayDate = computed(() => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const year = yesterday.getFullYear()
  const month = String(yesterday.getMonth() + 1).padStart(2, '0')
  const day = String(yesterday.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
})

// 获取当前日期时间
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}年${month}月${day}日 ${weekday} ${hours}:${minutes}:${seconds}`
})

// 全屏容器引用
const fullscreenContainer = ref(null)

// 统计数据
const totalUsers = ref('0')
const totalReaders = ref('0')
const totalSharers = ref('0')

// 排行榜和最佳数据
const followRankingData = ref([])
const bestReaders = ref('0')
const bestSharers = ref('0')

// Tab选择
const activeTab = ref('7days')

// 切换Tab
const switchTab = (tab) => {
  activeTab.value = tab
  fetchChartData(true) // 切换Tab后重新获取数据
}

// 获取统计数据
const fetchStatistics = async () => {
  // 获取当前选中的平台和账号ID
  const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  const accountId = selectedPlatform?.accountDTOList[0]?.id
  if (!accountId) {
    ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
    return
  }

  const params = {
    accountId: accountId
  }

  const res = await getUserTotalData(params)

  if (res.code === 200) {
    res.data.forEach(item => {
      if (item.desc === '总用户数') {
        totalUsers.value = item.value.toString()
      } else if (item.desc === '总阅读人数') {
        totalReaders.value = item.value.toString()
      } else if (item.desc === '总分享人数') {
        totalSharers.value = item.value.toString()
      }
    })
  }
}

// 跳转到自媒体管理详情页
const goToMediaProductDetail = () => {
  router.push({
    path: `/media/mediaProduct/${selectedProduct.value?.id}`,
  })
}

// 全屏方法
const toggleFullScreen = () => {
  const element = fullscreenContainer.value
  if (!element) return

  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
}

// 图表引用
const readTrendChart = ref(null)
const shareTrendChart = ref(null)
const readSourceChart = ref(null)
const newFollowChart = ref(null)
const totalFollowChart = ref(null)
// 图表实例
let readTrendChartInstance = null
let shareTrendChartInstance = null
let readSourceChartInstance = null
let newFollowChartInstance = null
let totalFollowChartInstance = null

// 初始数据
const dateData = ref([])
const newFollowData = ref([])
const totalFollowData = ref([])

// 图表数据
const readTrendData = ref({
  dateData: [],
  readData: []
})

const shareTrendData = ref({
  dateData: [],
  shareData: []
})

const chartReadSourceData = ref({
  sourceLabels: [],
  sourceValues: []
})

// 获取图表数据
const fetchChartData = async (tabIgnore) => {
  // 获取当前选中的平台和账号ID
  const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  const accountId = selectedPlatform?.accountDTOList[0]?.id
  if (!accountId) {
    ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
    return
  }

  // 根据Tab选择传递不同的参数
  const periodMap = {
    '7days': 0,      // 7天
    '1month': 1,     // 1月
    '6months': 2,    // 半年
    '1year': 3,      // 1年
    'all': 4         // 全部
  }
  const filterDimension = periodMap[activeTab.value] || 0
  const params = {
    filterDimension,
    accountId: accountId
  }

  // 统一调用同一个接口获取阅读、分享和来源数据
  const [readTrendRes, newFollowRes, totalFollowRes] = await Promise.all([
    getReadTrendData(params),
    getNewFollowData(params),
    getTotalFollowData(params)
  ])

  // 单独获取不涉及时间筛选的数据（仅在页面初次加载时调用，tab切换时不调用）
  const rankingParams = {
    accountId: accountId
  }

  const [followRankingRes, bestReadersAndSharersRes] = tabIgnore
    ? [[], []]
    : await Promise.all([
      getFollowRankingData(rankingParams),
      getBestReadersAndSharersData(rankingParams)
    ])

  // 更新阅读流量趋势图数据
  if (readTrendRes.code === 200) {
    const data = readTrendRes.data
    // data[0] - 阅读数据，data[1] - 分享数据，data[2] - 来源数据
    const readData = data[0] || []
    const shareData = data[1] || []
    const sourceData = data[2] || []


    readTrendData.value = {
      dateData: readData.map(item => item.refDate),
      readData: readData.map(item => item.readerNumber)
    }

    shareTrendData.value = {
      dateData: shareData.map(item => item.refDate),
      shareData: shareData.map(item => item.shareNumber)
    }

    // 处理来源数据
    const firstSourceItem = sourceData[0] || {}
    chartReadSourceData.value = {
      sourceLabels: Object.keys(firstSourceItem),
      sourceValues: Object.values(firstSourceItem)
    }
  }

  // 更新新增关注人数趋势图数据
  if (newFollowRes.code === 200) {
    // 转换新的接口返回格式
    dateData.value = newFollowRes.data.map(item => item.refDate)
    newFollowData.value = newFollowRes.data.map(item => item.netNewUser)
  }

  // 更新累计关注人数趋势图数据
  if (totalFollowRes.code === 200) {
    // 转换新的接口返回格式
    totalFollowData.value = totalFollowRes.data.map(item => item.accumulatedUser)
  }

  // 更新阅读后关注人数排行数据
  if (followRankingRes.code === 200) {
    followRankingData.value = followRankingRes.data.map(item => ({
      title: item.article_title,
      count: item.total_follows
    }))
  }

  // 更新最佳阅读人数和最佳分享人数
  if (bestReadersAndSharersRes.code === 200) {
    bestReadersAndSharersRes.data.forEach(item => {
      if (item.desc === '最佳阅读人数') {
        bestReaders.value = item.value.toString()
      } else if (item.desc === '最佳分享人数') {
        bestSharers.value = item.value.toString()
      }
    })
  }

  // 延迟一下，确保响应式变量更新后再重新初始化图表
  setTimeout(() => {
    initCharts()
  }, 100)
}

// 初始化图表
const initCharts = () => {
  // 阅读流量趋势图
  if (!readTrendChartInstance && readTrendChart.value) {
    readTrendChartInstance = echarts.init(readTrendChart.value)
  }
  if (readTrendChartInstance) {
    readTrendChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['阅读人数'],
        textStyle: {
          color: '#999'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: readTrendData.value.dateData,
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          axisLabel: {
            color: '#999'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          axisLabel: {
            color: '#999'
          },
          splitLine: {
            lineStyle: {
              color: '#222'
            }
          }
        }
      ],
      series: [
        {
          name: '阅读人数',
          type: 'line',
          stack: 'Total',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(54, 162, 235, 0.5)' },
              { offset: 1, color: 'rgba(54, 162, 235, 0.1)' }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          lineStyle: {
            color: '#36a2eb'
          },
          data: readTrendData.value.readData,
          markLine: {
            show: false
          }
        }
      ]
    })
  }

  // 分享流量趋势图
  if (!shareTrendChartInstance && shareTrendChart.value) {
    shareTrendChartInstance = echarts.init(shareTrendChart.value)
  }
  if (shareTrendChartInstance) {
    shareTrendChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['分享人数'],
        textStyle: {
          color: '#999'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: shareTrendData.value.dateData,
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          axisLabel: {
            color: '#999'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          axisLabel: {
            color: '#999'
          },
          splitLine: {
            lineStyle: {
              color: '#222'
            }
          }
        }
      ],
      series: [
        {
          name: '分享人数',
          type: 'line',
          stack: 'Total',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(153, 102, 255, 0.5)' },
              { offset: 1, color: 'rgba(153, 102, 255, 0.1)' }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          lineStyle: {
            color: '#9966ff'
          },
          data: shareTrendData.value.shareData,
          markLine: {
            show: false
          }
        }
      ]
    })
  }

  // 阅读人数流量来源占比
  if (!readSourceChartInstance && readSourceChart.value) {
    readSourceChartInstance = echarts.init(readSourceChart.value)
  }
  if (readSourceChartInstance) {
    readSourceChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: chartReadSourceData.value.sourceLabels,
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          axisLabel: {
            color: '#999',
            rotate: 45
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          axisLabel: {
            color: '#999'
          },
          splitLine: {
            lineStyle: {
              color: '#222'
            }
          }
        }
      ],
      series: [
        {
          name: '阅读人数',
          type: 'bar',
          barWidth: '60%',
          data: chartReadSourceData.value.sourceValues,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(54, 162, 235, 1)' },
              { offset: 1, color: 'rgba(54, 162, 235, 0.5)' }
            ])
          }
        }
      ]
    })
  }

  // 新关注人数趋势图
  if (newFollowChart.value && dateData.value.length > 0 && newFollowData.value.length > 0) {
    if (!newFollowChartInstance) {
      newFollowChartInstance = echarts.init(newFollowChart.value)
    }
    if (newFollowChartInstance) {
      newFollowChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['新关注人数'],
          textStyle: {
            color: '#999'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: dateData.value,
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisLabel: {
              color: '#999'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisLabel: {
              color: '#999'
            },
            splitLine: {
              lineStyle: {
                color: '#222'
              }
            }
          }
        ],
        series: [
          {
            name: '新关注人数',
            type: 'line',
            stack: 'Total',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 99, 132, 0.5)' },
                { offset: 1, color: 'rgba(255, 99, 132, 0.1)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            lineStyle: {
              color: '#ff6384'
            },
            data: newFollowData.value
          }
        ]
      })
    }
  }
  // 累计关注人数
  if (totalFollowChart.value && dateData.value.length > 0 && totalFollowData.value.length > 0) {
    if (!totalFollowChartInstance) {
      totalFollowChartInstance = echarts.init(totalFollowChart.value)
    }
    if (totalFollowChartInstance) {
      // 计算数据的范围，用于自适应Y轴
      const dataMin = Math.min(...totalFollowData.value)
      const dataMax = Math.max(...totalFollowData.value)
      const dataRange = dataMax - dataMin
      // 根据数据范围计算合适的Y轴最小值和最大值
      let yAxisMin, yAxisMax
      if (dataRange === 0) {
        // 如果数据完全相同，给一个合理的范围
        yAxisMin = Math.max(0, dataMin - Math.max(10, dataMin * 0.1))
        yAxisMax = dataMax + Math.max(10, dataMax * 0.1)
      } else {
        // 根据数据范围设置Y轴边界，留出10%的边距
        const padding = dataRange * 0.1
        yAxisMin = Math.max(0, Math.floor((dataMin - padding) / 10) * 10)
        yAxisMax = Math.ceil((dataMax + padding) / 10) * 10
      }

      totalFollowChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['累计关注人数'],
          textStyle: {
            color: '#999'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: dateData.value,
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisLabel: {
              color: '#999'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            min: yAxisMin,
            max: yAxisMax,
            scale: true,
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisLabel: {
              color: '#999'
            },
            splitLine: {
              lineStyle: {
                color: '#222'
              }
            }
          }
        ],
        series: [
          {
            name: '累计关注人数',
            type: 'line',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(54, 162, 235, 0.5)' },
                { offset: 1, color: 'rgba(54, 162, 235, 0.1)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            lineStyle: {
              color: '#36a2eb'
            },
            showSymbol: true,
            symbol: 'circle',
            symbolSize: 6,
            data: totalFollowData.value
          }
        ]
      })
    }
  }
}

// 响应式调整
const handleResize = () => {
  readTrendChartInstance && readTrendChartInstance.resize()
  shareTrendChartInstance && shareTrendChartInstance.resize()
  readSourceChartInstance && readSourceChartInstance.resize()
  newFollowChartInstance && newFollowChartInstance.resize()
  totalFollowChartInstance && totalFollowChartInstance.resize()
}

// 生命周期钩子
onMounted(async () => {
  fetchProductList()
  window.addEventListener('resize', handleResize)
})

// 获取产品列表
const fetchProductList = () => {
  getMediaProductList({
    queryConfig: {
      queryProduct: true,
      queryChannels: true,
      queryAccount: true,
    }
  }).then(response => {
    if (response.code === 200) {
      const rawProducts = response.rows || response.data?.rows || response.data?.list || []
      productList.value = rawProducts.map(product => {
        const channelDTOList = product.channelDTOList || []
        return {
          id: product.baseInfo?.id,
          name: product.baseInfo?.productName || product.baseInfo?.name,
          platforms: channelDTOList.map(channel => ({
            id: channel.id,
            name: channel.channelName,
            accountDTOList: channel.accountDTOList || []
          }))
        }
      })
      // 构建级联选择器选项
      cascaderOptions.value = productList.value
        .filter(product => product.platforms && product.platforms.some(platform =>
          platform.accountDTOList && platform.accountDTOList.length > 0
        ))
        .map(product => ({
          id: product.id,
          name: product.name,
          children: product.platforms
            .filter(platform => platform.accountDTOList && platform.accountDTOList.length > 0)
            .map(platform => ({
              id: platform.id,
              name: platform.name + (platform.accountDTOList[0] ? ` (${platform.accountDTOList[0].accountName})` : '')
            }))
        }))

      // 检查是否有可用的产品平台
      hasAvailableProductPlatform.value = productList.value.some(product =>
        product.platforms && product.platforms.some(platform =>
          platform.accountDTOList && platform.accountDTOList.length > 0
        )
      )
      // 默认选择第一个产品和第一个平台，获取数据
      if (hasAvailableProductPlatform.value) {
        // 设置默认选中的级联值
        if (cascaderOptions.value.length > 0 && cascaderOptions.value[0].children.length > 0) {
          selectedCascaderValue.value = [cascaderOptions.value[0].id, cascaderOptions.value[0].children[0].id]
        }
        fetchAllData()
      }
    } else {
      console.error('获取产品列表失败')
      hasAvailableProductPlatform.value = false
    }
  }).catch((error) => {
    console.error('获取产品列表失败', error)
    hasAvailableProductPlatform.value = false
  })
}

// 获取所有数据
const fetchAllData = async () => {
  fetchStatistics()
  await fetchChartData()
  // 等待响应式变量更新后再初始化图表
  setTimeout(() => {
    initCharts()
  }, 100)
}

// 选择产品
const selectProduct = (index) => {
  selectedProductIndex.value = index
  selectedPlatformIndex.value = 0
  if (productList.value[index] && productList.value[index].platforms.length > 0) {
    fetchAllData()
  }
}

// 选择平台
const selectPlatform = (index) => {
  selectedPlatformIndex.value = index
  fetchAllData()
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  readTrendChartInstance && readTrendChartInstance.dispose()
  shareTrendChartInstance && shareTrendChartInstance.dispose()
  readSourceChartInstance && readSourceChartInstance.dispose()
  newFollowChartInstance && newFollowChartInstance.dispose()
  totalFollowChartInstance && totalFollowChartInstance.dispose()
})

// 下载看板为图片
const downloadBoardAsImage = async () => {
  // 获取看板容器元素
  const boardContainer = document.querySelector('.wechat-board-container')
  if (!boardContainer) {
    return
  }

  // 使用html2canvas将容器转换为图片
  const canvas = await html2canvas(boardContainer, {
    scale: 2, // 提高图片清晰度
    useCORS: true, // 允许加载跨域图片
    logging: false,
    backgroundColor: '#1a1a2e' // 设置背景色
  })

  // 将canvas转换为图片并下载
  const link = document.createElement('a')
  link.download = `微信看板_${new Date().toISOString().slice(0, 10)}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<style scoped lang="scss">
$bg-primary: #1a1a2e;
$bg-card: rgba(255, 255, 255, 0.05);
$border-subtle: rgba(255, 255, 255, 0.08);
$text-primary: #f0f0f0;
$text-secondary: #999;
$brand-blue: #4a90e2;
$brand-cyan: #66d9d9;
$brand-glow: #1890ff;

.ignore-vw.mobile-board {
  min-height: 100vh;
  min-height: 100dvh;
  background-color: $bg-primary;
  color: $text-primary;
  padding: calc(env(safe-area-inset-top, 0px) + 12px) 12px calc(env(safe-area-inset-bottom, 0px) + 16px);
  -webkit-font-smoothing: antialiased;
}

.ignore-vw .mobile-board-header {
  margin-bottom: 12px;
}

.ignore-vw .mobile-cascader-row {
  margin-bottom: 8px;

  :deep(.el-cascader) {
    width: 100%;
    --el-fill-color-blank: rgba(255, 255, 255, 0.06);
    --el-text-color-regular: rgba(255, 255, 255, 0.85);
    --el-border-color-hover: rgba(74, 144, 226, 0.4);
    --el-border-color-base: rgba(255, 255, 255, 0.12);
    --el-input-bg-color: rgba(255, 255, 255, 0.06);
    --el-input-text-color: rgba(255, 255, 255, 0.85);
    --el-input-placeholder-text-color: rgba(255, 255, 255, 0.35);
    --el-cascader-menu-text-color: rgba(255, 255, 255, 0.85);
    --el-cascader-menu-fill: rgba(26, 26, 46, 0.97);
    --el-cascader-tag-bg-color: rgba(74, 144, 226, 0.2);
    --el-cascader-tag-border-color: rgba(74, 144, 226, 0.4);
    --el-cascader-tag-text-color: rgba(255, 255, 255, 0.85);
  }

  :deep(.el-input__wrapper) {
    background-color: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
    border-radius: 10px;
    min-height: 40px;
  }

  :deep(.el-input__inner) {
    color: rgba(255, 255, 255, 0.85) !important;
    font-size: 14px;
  }

  :deep(.el-input__inner::placeholder) {
    color: rgba(255, 255, 255, 0.35) !important;
  }
}

.ignore-vw .mobile-notice {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(249, 202, 36, 0.08);
  border-radius: 8px;
  margin-bottom: 8px;

  .mobile-notice-icon {
    color: #f9ca24;
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .mobile-notice-text {
    font-size: 12px;
    color: $text-secondary;
    line-height: 1.5;
  }

  .mobile-notice-link {
    color: $brand-blue;
    cursor: pointer;
  }
}

.ignore-vw .mobile-action-row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;

  .mobile-action-btn {
    flex: 1;
    border-radius: 8px;
    font-size: 13px;
    height: 34px;
    background-color: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: $text-primary;

    &:active {
      opacity: 0.7;
    }
  }
}

.ignore-vw .mobile-board-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 0 4px;

  .mobile-title-deco {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, $brand-glow, transparent);
    opacity: 0.5;
  }

  .mobile-title-text {
    font-size: 18px;
    font-weight: 700;
    color: $brand-glow;
    white-space: nowrap;
    letter-spacing: 1px;
  }
}

.ignore-vw .mobile-board-body {
  width: 100%;

  &:fullscreen,
  &:-webkit-full-screen,
  &:-ms-fullscreen {
    background-color: $bg-primary;
    padding: 16px;
    height: 100vh;
    overflow-y: auto;
  }
}

.ignore-vw .mobile-stats-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;

  :deep(.stat-card) {
    flex: 1;
    min-width: 0;
    padding: 12px 8px;
    border-radius: 12px;
    background: $bg-card;
    border: 1px solid $border-subtle;

    .stat-label {
      font-size: 11px;
      color: $text-secondary;
      margin-bottom: 6px;
    }

    .stat-value {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .stat-name {
      font-size: 11px;
      color: $text-secondary;
    }
  }
}

.ignore-vw .mobile-charts-section {
  background: $bg-card;
  border: 1px solid $border-subtle;
  border-radius: 14px;
  padding: 14px 12px;
  margin-bottom: 14px;
}

.ignore-vw .mobile-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 3px;
}

.ignore-vw .mobile-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
  color: $text-secondary;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &.active {
    color: #fff;
    background: $brand-blue;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.35);
  }

  &:not(.active):active {
    background: rgba(255, 255, 255, 0.06);
  }
}

.ignore-vw .mobile-charts-list,
.ignore-vw .mobile-follow-charts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ignore-vw .mobile-charts-list {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid $border-subtle;
}

.ignore-vw .mobile-charts-list :deep(.chart-card),
.ignore-vw .mobile-follow-charts :deep(.chart-card) {
  flex: none;
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid $border-subtle;

  .chart-title {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .chart-container {
    height: 220px !important;
  }
}

.ignore-vw .mobile-ranking-section {
  background: $bg-card;
  border: 1px solid $border-subtle;
  border-radius: 14px;
  padding: 14px 12px;
  padding-top: 36px;
  position: relative;
}

.ignore-vw .mobile-ranking-tip {
  position: absolute;
  top: 12px;
  left: 14px;
  font-size: 11px;
  color: $text-secondary;
}

.ignore-vw .mobile-ranking-section :deep(.ranking-card) {
  flex: none;
  width: 100%;
  margin-bottom: 12px;
  border-radius: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid $border-subtle;

  .chart-title {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .ranking-item {
    padding: 8px 6px;

    .ranking-number {
      width: 16px;
      height: 16px;
      font-size: 10px;
      margin-right: 8px;
    }

    .ranking-title {
      font-size: 13px;
    }

    .ranking-count {
      font-size: 13px;
    }
  }
}

.ignore-vw .mobile-data-row {
  display: flex;
  gap: 10px;

  :deep(.stats-card) {
    flex: 1;
    min-width: 0;
    border-radius: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid $border-subtle;

    .stat-value {
      font-size: 28px;
      margin-bottom: 6px;
    }

    .stat-name {
      font-size: 12px;
    }
  }
}

.ignore-vw .mobile-empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;

  :deep(.el-empty__description) {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }
}
</style>