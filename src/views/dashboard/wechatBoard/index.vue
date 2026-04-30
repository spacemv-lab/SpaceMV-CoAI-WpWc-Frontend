/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
  <div class="wechat-board-container">
    <!-- 产品和平台选择器 -->
    <div v-if="hasAvailableProductPlatform" class="product-platform-selector">
      <div class="board-header">
        <div class="header-left">
          <div class="cascader-wrapper">
            <el-cascader
              v-model="selectedCascaderValue"
              :options="cascaderOptions"
              :props="cascaderProps"
              placeholder="请选择产品和平台"
              @change="handleCascaderChange"
              clearable
            />
          </div>
          <span class="board-title" v-if="isWeChatPlatform">
            <el-icon class="title-icon">
              <WarningFilled />
            </el-icon>
            数据统计范围：账号绑定日起至昨天({{ yesterdayDate }})（微信官方数据上限：2025.11.01），如需补充数据请前往<span class="link-text" @click="goToMediaProductDetail">「自媒体管理-详情」</span>中手动同步
          </span>
        </div>
        <div class="board-actions">
          <el-button size="small" type="primary" @click="toggleFullScreen" class="fullscreen-button">
            全屏
          </el-button>
          <el-button size="small" type="primary" @click="downloadBoardAsImage" class="download-button">
            下载图片
          </el-button>
        </div>
      </div>
    </div>

    <template v-if="hasAvailableProductPlatform">
      <!-- 看板标题 -->
      <div class="dashboard-title">
        <div class="title-content">
          <div class="title-line"></div>
          <div class="title-text">{{ selectedProduct ? selectedProduct.name : '' }} 运营数据</div>
          <div class="title-line"></div>
        </div>
      </div>

      <!-- 可全屏的内容区域 -->
      <div ref="fullscreenContainer" class="fullscreen-content">
        <div class="stats-grid">
          <StatCard label="总用户数" :value="totalUsers" name="总用户数" />
          <StatCard label="总阅读人数" :value="totalReaders" name="总阅读人数" />
          <StatCard label="总分享人数" :value="totalSharers" name="总分享人数" />
        </div>

        <div class="charts-container">
          <div class="tab-container">
            <div class="tab-item" :class="{ active: activeTab === '7days' }" @click="switchTab('7days')">
              7天
            </div>
            <div class="tab-item" :class="{ active: activeTab === '1month' }" @click="switchTab('1month')">
              30天
            </div>
            <div style="display: none;" class="tab-item" :class="{ active: activeTab === '6months' }"
              @click="switchTab('6months')">
              半年
            </div>
            <div style="display: none;" class="tab-item" :class="{ active: activeTab === '1year' }"
              @click="switchTab('1year')">
              1年
            </div>
            <div class="tab-item" :class="{ active: activeTab === 'all' }" @click="switchTab('all')">
              全部
            </div>
          </div>

          <div class="charts-grid">
            <ChartCard title="阅读流量趋势图" :chartRef="el => readTrendChart = el" />
            <ChartCard title="分享流量趋势图" :chartRef="el => shareTrendChart = el" />
            <ChartCard title="阅读人数流量来源占比" :chartRef="el => readSourceChart = el" />
          </div>

          <div class="follow-charts-grid">
            <ChartCard title="新增关注人数" :chartRef="el => newFollowChart = el" />
            <ChartCard title="累计关注人数" :chartRef="el => totalFollowChart = el" />
          </div>
        </div>

        <div class="ranking-stats-grid">
          <RankingCard title="阅读后关注人数排行Top10文章" :data="followRankingData" height="180px" />
          <DataCard :value="bestReaders" name="最佳阅读人数" />
          <DataCard :value="bestSharers" name="最佳分享人数" />
          <div class="ranking-stats-tip">根据微信官方接口能力，仅统计文章发表后30天内的数据</div>
        </div>
      </div>
    </template>
    
    <!-- 空状态提示 -->
    <div v-else class="empty-state-wrapper">
      <el-empty description="暂无数据，请绑定自媒体产品及平台" />
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
const productList = ref([]);

// 是否有可用的产品平台
const hasAvailableProductPlatform = ref(false)

// 选中的产品索引
const selectedProductIndex = ref(0);

// 选中的平台索引
const selectedPlatformIndex = ref(0);

// 获取 router 实例
const router = useRouter()

// 当前选中的产品
const selectedProduct = computed(() => {
  return productList.value[selectedProductIndex.value];
});

// 当前产品的平台列表
const currentPlatformList = computed(() => {
  return selectedProduct.value ? selectedProduct.value.platforms : [];
});

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
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
});

// 获取当前日期时间
const currentDate = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}年${month}月${day}日 ${weekday} ${hours}:${minutes}:${seconds}`;
});

// 全屏容器引用
const fullscreenContainer = ref(null);

// 统计数据
const totalUsers = ref('0');
const totalReaders = ref('0');
const totalSharers = ref('0');

// 排行榜和最佳数据
const followRankingData = ref([]);
const bestReaders = ref('0');
const bestSharers = ref('0');

// Tab选择
const activeTab = ref('7days');

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

  const res = await getUserTotalData(params);

  if (res.code === 200) {
    res.data.forEach((item) => {
      if (item.desc === '总用户数') {
        totalUsers.value = item.value.toString();
      } else if (item.desc === '总阅读人数') {
        totalReaders.value = item.value.toString();
      } else if (item.desc === '总分享人数') {
        totalSharers.value = item.value.toString();
      }
    });
  }
};

// 跳转到自媒体管理详情页
const goToMediaProductDetail = () => {
  router.push({
    path: `/media/mediaProduct/${selectedProduct.value?.id}`,
  })
}

// 全屏方法
const toggleFullScreen = () => {
  const element = fullscreenContainer.value;
  if (!element) return;

  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
};

// 图表引用
const readTrendChart = ref(null);
const shareTrendChart = ref(null);
const readSourceChart = ref(null);
const newFollowChart = ref(null);
const totalFollowChart = ref(null);
// const regionChart = ref(null)
// const ageChart = ref(null)
// const genderChart = ref(null)
// const channelChart = ref(null)
// 图表实例
let readTrendChartInstance = null;
let shareTrendChartInstance = null;
let readSourceChartInstance = null;
let newFollowChartInstance = null;
let totalFollowChartInstance = null;
// let regionChartInstance = null
// let ageChartInstance = null
// let genderChartInstance = null
// let channelChartInstance = null

// 初始数据
const dateData = ref([]);
const newFollowData = ref([]);
const totalFollowData = ref([]);
// const originalReadSourceData = []
// const readSourceLabels = []

// 图表数据
const readTrendData = ref({
  dateData: [],
  readData: [],
});

const shareTrendData = ref({
  dateData: [],
  shareData: [],
});

const chartReadSourceData = ref({
  sourceLabels: [],
  sourceValues: [],
});

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
    '7days': 0, // 7天
    '1month': 1, // 1月
    '6months': 2, // 半年
    '1year': 3, // 1年
    all: 4, // 全部
  };
  const filterDimension = periodMap[activeTab.value] || 0;
  const params = {
    filterDimension,
    accountId: accountId
  }

  // 统一调用同一个接口获取阅读、分享和来源数据
  const [readTrendRes, newFollowRes, totalFollowRes] = await Promise.all([
    getReadTrendData(params),
    getNewFollowData(params),
    getTotalFollowData(params),
  ]);

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
      dateData: readData.map((item) => item.refDate),
      readData: readData.map((item) => item.readerNumber),
    };

    shareTrendData.value = {
      dateData: shareData.map((item) => item.refDate),
      shareData: shareData.map((item) => item.shareNumber),
    };

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
    dateData.value = newFollowRes.data.map((item) => item.refDate);
    newFollowData.value = newFollowRes.data.map((item) => item.netNewUser);
  }

  // 更新累计关注人数趋势图数据
  if (totalFollowRes.code === 200) {
    // 转换新的接口返回格式
    totalFollowData.value = totalFollowRes.data.map((item) => item.accumulatedUser);
  }

  // 更新阅读后关注人数排行数据
  if (followRankingRes.code === 200) {
    followRankingData.value = followRankingRes.data.map((item) => ({
      title: item.article_title,
      count: item.total_follows,
    }));
  }

  // 更新最佳阅读人数和最佳分享人数
  if (bestReadersAndSharersRes.code === 200) {
    bestReadersAndSharersRes.data.forEach((item) => {
      if (item.desc === '最佳阅读人数') {
        bestReaders.value = item.value.toString();
      } else if (item.desc === '最佳分享人数') {
        bestSharers.value = item.value.toString();
      }
    });
  }

  // 延迟一下，确保响应式变量更新后再重新初始化图表
  setTimeout(() => {
    initCharts();
  }, 100);
};

// 初始化图表
const initCharts = () => {
  // 阅读流量趋势图
  if (!readTrendChartInstance && readTrendChart.value) {
    readTrendChartInstance = echarts.init(readTrendChart.value);
  }
  if (readTrendChartInstance) {
    readTrendChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['阅读人数'],
        textStyle: {
          color: '#999',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: readTrendData.value.dateData,
          axisLine: {
            lineStyle: {
              color: '#333',
            },
          },
          axisLabel: {
            color: '#999',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#333',
            },
          },
          axisLabel: {
            color: '#999',
          },
          splitLine: {
            lineStyle: {
              color: '#222',
            },
          },
        },
      ],
      series: [
        {
          name: '阅读人数',
          type: 'line',
          stack: 'Total',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(54, 162, 235, 0.5)' },
              { offset: 1, color: 'rgba(54, 162, 235, 0.1)' },
            ]),
          },
          emphasis: {
            focus: 'series',
          },
          lineStyle: {
            color: '#36a2eb',
          },
          data: readTrendData.value.readData,
          markLine: {
            show: false,
          },
        },
      ],
    });
  }

  // 分享流量趋势图
  if (!shareTrendChartInstance && shareTrendChart.value) {
    shareTrendChartInstance = echarts.init(shareTrendChart.value);
  }
  if (shareTrendChartInstance) {
    shareTrendChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['分享人数'],
        textStyle: {
          color: '#999',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: shareTrendData.value.dateData,
          axisLine: {
            lineStyle: {
              color: '#333',
            },
          },
          axisLabel: {
            color: '#999',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#333',
            },
          },
          axisLabel: {
            color: '#999',
          },
          splitLine: {
            lineStyle: {
              color: '#222',
            },
          },
        },
      ],
      series: [
        {
          name: '分享人数',
          type: 'line',
          stack: 'Total',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(153, 102, 255, 0.5)' },
              { offset: 1, color: 'rgba(153, 102, 255, 0.1)' },
            ]),
          },
          emphasis: {
            focus: 'series',
          },
          lineStyle: {
            color: '#9966ff',
          },
          data: shareTrendData.value.shareData,
          markLine: {
            show: false,
          },
        },
      ],
    });
  }

  // 阅读人数流量来源占比
  if (!readSourceChartInstance && readSourceChart.value) {
    readSourceChartInstance = echarts.init(readSourceChart.value);
  }
  if (readSourceChartInstance) {
    readSourceChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: chartReadSourceData.value.sourceLabels,
          axisLine: {
            lineStyle: {
              color: '#333',
            },
          },
          axisLabel: {
            color: '#999',
            rotate: 45,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#333',
            },
          },
          axisLabel: {
            color: '#999',
          },
          splitLine: {
            lineStyle: {
              color: '#222',
            },
          },
        },
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
              { offset: 1, color: 'rgba(54, 162, 235, 0.5)' },
            ]),
          },
        },
      ],
    });
  }

  // 新关注人数趋势图
  if (newFollowChart.value && dateData.value.length > 0 && newFollowData.value.length > 0) {
    if (!newFollowChartInstance) {
      newFollowChartInstance = echarts.init(newFollowChart.value);
    }
    if (newFollowChartInstance) {
      newFollowChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['新关注人数'],
          textStyle: {
            color: '#999',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: dateData.value,
            axisLine: {
              lineStyle: {
                color: '#333',
              },
            },
            axisLabel: {
              color: '#999',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#333',
              },
            },
            axisLabel: {
              color: '#999',
            },
            splitLine: {
              lineStyle: {
                color: '#222',
              },
            },
          },
        ],
        series: [
          {
            name: '新关注人数',
            type: 'line',
            stack: 'Total',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 99, 132, 0.5)' },
                { offset: 1, color: 'rgba(255, 99, 132, 0.1)' },
              ]),
            },
            emphasis: {
              focus: 'series',
            },
            lineStyle: {
              color: '#ff6384',
            },
            data: newFollowData.value,
          },
        ],
      });
    }
  }
  // 累计关注人数
  if (totalFollowChart.value && dateData.value.length > 0 && totalFollowData.value.length > 0) {
    if (!totalFollowChartInstance) {
      totalFollowChartInstance = echarts.init(totalFollowChart.value);
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
            color: '#999',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: dateData.value,
            axisLine: {
              lineStyle: {
                color: '#333',
              },
            },
            axisLabel: {
              color: '#999',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            min: yAxisMin,
            max: yAxisMax,
            scale: true,
            axisLine: {
              lineStyle: {
                color: '#333',
              },
            },
            axisLabel: {
              color: '#999',
            },
            splitLine: {
              lineStyle: {
                color: '#222',
              },
            },
          },
        ],
        series: [
          {
            name: '累计关注人数',
            type: 'line',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(54, 162, 235, 0.5)' },
                { offset: 1, color: 'rgba(54, 162, 235, 0.1)' },
              ]),
            },
            emphasis: {
              focus: 'series',
            },
            lineStyle: {
              color: '#36a2eb',
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
  // // 地域分布
  // regionChartInstance = echarts.init(regionChart.value)
  // regionChartInstance.setOption({
  //   tooltip: {
  //     trigger: 'axis',
  //     axisPointer: {
  //       type: 'shadow'
  //     }
  //   },
  //   grid: {
  //     left: '3%',
  //     right: '4%',
  //     bottom: '3%',
  //     containLabel: true
  //   },
  //   xAxis: [
  //     {
  //       type: 'category',
  //       data: regionData.map(item => item.name),
  //       axisLine: {
  //         lineStyle: {
  //           color: '#333'
  //         }
  //       },
  //       axisLabel: {
  //         color: '#999',
  //         rotate: 45
  //       }
  //     }
  //   ],
  //   yAxis: [
  //     {
  //       type: 'value',
  //       axisLine: {
  //         lineStyle: {
  //           color: '#333'
  //         }
  //       },
  //       axisLabel: {
  //         color: '#999'
  //       },
  //       splitLine: {
  //         lineStyle: {
  //           color: '#222'
  //         }
  //       }
  //     }
  //   ],
  //   series: [
  //     {
  //       name: '地域分布',
  //       type: 'bar',
  //       data: regionData.map(item => item.value),
  //       itemStyle: {
  //         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //           { offset: 0, color: '#36a2eb' },
  //           { offset: 1, color: '#1890ff' }
  //         ])
  //       }
  //     }
  //   ]
  // })
};

// 响应式调整
const handleResize = () => {
  readTrendChartInstance && readTrendChartInstance.resize();
  shareTrendChartInstance && shareTrendChartInstance.resize();
  readSourceChartInstance && readSourceChartInstance.resize();
  newFollowChartInstance && newFollowChartInstance.resize();
  totalFollowChartInstance && totalFollowChartInstance.resize();
  // regionChartInstance && regionChartInstance.resize()
  // ageChartInstance && ageChartInstance.resize()
  // genderChartInstance && genderChartInstance.resize()
  // channelChartInstance && channelChartInstance.resize()
};

// 生命周期钩子
onMounted(async () => {
  fetchProductList();
  window.addEventListener('resize', handleResize);
});

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
      // 根据返回格式，转换数据结构
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
  fetchStatistics();
  await fetchChartData();
  // 等待响应式变量更新后再初始化图表
  setTimeout(() => {
    initCharts();
  }, 100);
};

// 选择产品
const selectProduct = (index) => {
  selectedProductIndex.value = index;
  selectedPlatformIndex.value = 0;
  if (productList.value[index] && productList.value[index].platforms.length > 0) {
    fetchAllData();
  }
};

// 选择平台
const selectPlatform = (index) => {
  selectedPlatformIndex.value = index;
  fetchAllData();
};

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  readTrendChartInstance && readTrendChartInstance.dispose();
  shareTrendChartInstance && shareTrendChartInstance.dispose();
  readSourceChartInstance && readSourceChartInstance.dispose();
  newFollowChartInstance && newFollowChartInstance.dispose();
  totalFollowChartInstance && totalFollowChartInstance.dispose();
});

// 下载看板为图片
const downloadBoardAsImage = async () => {
  // 获取看板容器元素
  const boardContainer = document.querySelector('.wechat-board-container');
  if (!boardContainer) {
    return;
  }

  // 使用html2canvas将容器转换为图片
  const canvas = await html2canvas(boardContainer, {
    scale: 2, // 提高图片清晰度
    useCORS: true, // 允许加载跨域图片
    logging: false,
    backgroundColor: '#1a1a2e', // 设置背景色
  });

  // 将canvas转换为图片并下载
  const link = document.createElement('a');
  link.download = `微信看板_${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
</script>

<style scoped lang="scss">
.wechat-board-container {
  padding: 20px;
  background-color: #1a1a2e;
  min-height: 100vh;
  color: #f0f0f0;

  .dashboard-title {
    margin-bottom: 20px;
    position: relative;

    .title-content {
      display: flex;
      align-items: center;

      .title-line {
        flex: 1;
        height: 3px;
        background: linear-gradient(90deg, transparent, #1890ff, transparent);
        animation: glow 2s ease-in-out infinite alternate;
      }

      .title-text {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #1890ff;
        padding: 0 30px;
        text-shadow: 0 0 20px rgba(24, 144, 255, 0.6);
      }
    }
  }

  @keyframes glow {
    from {
      opacity: 0.3;
      transform: scaleX(0.8);
    }

    to {
      opacity: 1;
      transform: scaleX(1);
    }
  }

  .product-platform-selector {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;

    margin-bottom: 16px;
    padding: 8px 24px;

    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
      gap: 20px;

      .header-left {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 15px;
      }

      .board-title {
        font-size: 12px;
        color: #999;
        display: inline-flex;
        align-items: center;
        gap: 8px;

        .title-icon {
          color: #f9ca24;
          font-size: 14px;
        }

        .link-text {
          color: #409eff;
          cursor: pointer;
          transition: color 0.3s;

          &:hover {
            color: #66b1ff;
          }
        }
      }

      .cascader-wrapper {
        display: inline-block;

        .el-cascader {
          width: 100%;
          --el-fill-color-blank: rgba(255, 255, 255, 0.04);
          --el-text-color-regular: rgba(255, 255, 255, 0.85);
          --el-border-color-hover: rgba(24, 144, 255, 0.4);
          --el-border-color-base: rgba(255, 255, 255, 0.1);
          --el-input-bg-color: rgba(255, 255, 255, 0.04);
          --el-input-text-color: rgba(255, 255, 255, 0.85);
          --el-input-placeholder-text-color: rgba(255, 255, 255, 0.4);
          --el-cascader-menu-text-color: rgba(255, 255, 255, 0.85);
          --el-cascader-menu-fill: rgba(30, 30, 50, 0.95);
          --el-cascader-tag-bg-color: rgba(24, 144, 255, 0.2);
          --el-cascader-tag-border-color: rgba(24, 144, 255, 0.4);
          --el-cascader-tag-text-color: rgba(255, 255, 255, 0.85);
        }

        .el-input__wrapper {
          background-color: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: none !important;
          border-radius: 8px;
        }

        .el-input__inner {
          color: rgba(255, 255, 255, 0.85) !important;
        }

        .el-input__inner::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        .el-cascader__dropdown {
          background-color: rgba(30, 30, 50, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .el-cascader-menu {
          background-color: transparent !important;
          border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .el-cascader-node {
          color: rgba(255, 255, 255, 0.85) !important;
        }

        .el-cascader-node:hover {
          background-color: rgba(24, 144, 255, 0.1) !important;
        }

        .el-cascader-node.in-active-path,
        .el-cascader-node.is-selectable.in-checked-path {
          background-color: rgba(24, 144, 255, 0.2) !important;
        }
      }

      .board-actions {
        display: flex;
        align-items: center;

        .el-button {
          margin-left: 10px;
          border-radius: 4px;
          padding: 6px 16px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .fullscreen-button {
          background-color: #4a90e2;
          border-color: #4a90e2;

          &:hover {
            background-color: #6aa9f4;
            border-color: #6aa9f4;
          }

          &:active {
            background-color: #357abd;
            border-color: #357abd;
          }
        }

        .download-button {
          background-color: #66d9d9;
          border-color: #66d9d9;

          &:hover {
            background-color: #7fe0e0;
            border-color: #7fe0e0;
          }

          &:active {
            background-color: #4cc0c0;
            border-color: #4cc0c0;
          }
        }
      }
    }
  }

  // 响应式设计：小屏幕适配
  @media (max-width: 1200px) {
    .product-platform-selector {
      .board-header {
        .header-left {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    }
  }

  .stats-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
  }

  .charts-container {
    border: 1px solid #444;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .tab-container {
    // display: none;
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #444;
  }

  .tab-item {
    padding: 10px 20px;
    cursor: pointer;
    color: #fff;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;

    &:hover {
      color: #fff;
    }

    &.active {
      color: #4a90e2;
      border-bottom-color: #4a90e2;
    }
  }

  .charts-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
  }

  .follow-charts-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .demographics-grid {
    display: flex;
    flex-wrap: nowrap;
    gap: 20px;
    margin-bottom: 20px;
  }

  .ranking-stats-grid {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    gap: 20px;
    margin-bottom: 20px;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 20px;
    padding-top: 45px;
  }

  .ranking-stats-tip {
    position: absolute;
    top: 15px;
    left: 20px;
    font-size: 12px;
    color: #999;
  }

  .fullscreen-content {
    width: 100%;
    transition: all 0.3s ease;

    /* 全屏状态下的样式 */
    &:fullscreen {
      background-color: #1a1a2e;
      padding: 20px;
      height: 100vh;
      overflow-y: auto;
    }

    /* 不同浏览器的全屏样式前缀 */
    &:-webkit-full-screen {
      background-color: #1a1a2e;
      padding: 20px;
      height: 100vh;
      overflow-y: auto;
    }

    &:-ms-fullscreen {
      background-color: #1a1a2e;
      padding: 20px;
      height: 100vh;
      overflow-y: auto;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .wechat-board-container {
    .charts-grid {
      flex-wrap: wrap;
    }

    .follow-charts-grid {
      flex-wrap: wrap;
    }

    .demographics-grid {
      flex-wrap: wrap;
    }

    .ranking-stats-grid {
      flex-wrap: wrap;
    }
  }
}

@media (max-width: 768px) {
  .wechat-board-container {
    padding: 10px;

    .product-platform-selector {
      .board-header {
        .board-title {
          font-size: 12px;
        }

        .board-actions {
          .el-button {
            font-size: 12px;
            padding: 4px 12px;
          }
        }
      }
    }

    .tab-item {
      padding: 8px 12px;
      font-size: 14px;
    }

    .stats-grid {
      flex-wrap: wrap;
    }

    .charts-grid {
      flex-wrap: wrap;
    }

    .follow-charts-grid {
      flex-wrap: wrap;
    }

    .demographics-grid {
      flex-wrap: wrap;
    }

    .ranking-stats-grid {
      flex-wrap: wrap;
    }
  }
}

@media (max-width: 480px) {
  .wechat-board-container {
    .product-platform-selector {
      .board-header {
        flex-direction: column;
        align-items: flex-start;

        .board-actions {
          margin-top: 10px;

          .el-button {
            margin-left: 5px;
          }
        }
      }
    }
  }
}

.empty-state-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  margin-top: 20px;
  
  :deep(.el-empty) {
    .el-empty__description {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}
</style>
