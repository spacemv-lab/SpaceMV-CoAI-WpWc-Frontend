/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
	<div class="product-detail">
		<!-- 产品信息 -->
		<el-card class="product-info-card" v-loading="!productDetail">
			<h1 class="product-name">{{ productDetail?.baseInfo?.productName || '加载中...' }}</h1>
			<div class="product-meta">
				<span>创建时间：{{ formatDate(productDetail?.baseInfo?.createTime) || '-' }}</span>
				<span>产品描述：{{ productDetail?.baseInfo?.productDesc || '-' }}</span>
			</div>
		</el-card>

		<!-- 平台信息 -->
		<el-card class="platform-card" v-if="platformList && platformList.length > 0">
			<div class="platform-selector">
				<el-tag
					v-for="(platform, index) in platformList"
					:key="index"
					:class="{ 'platform-tag': true, 'active': selectedPlatformIndex === index }"
					@click="selectPlatform(index)"
				>
					{{ platform.channelName }}
				</el-tag>
			</div>
			<div class="platform-meta">
				<span class="platform-bind-time">{{ platformList[selectedPlatformIndex]?.accountDTOList?.[0]?.accountName || '' }}</span>
				<span v-if="platformList[selectedPlatformIndex]?.accountDTOList?.[0]?.appId"
				 class="platform-bind-time">{{ platformList[selectedPlatformIndex]?.accountDTOList?.[0]?.appId }}</span>
			</div>

			<div class="sync-container">
				<el-button type="primary" class="sync-button" @click="showDateRange = !showDateRange" :loading="syncLoading" :disabled="syncDisabled">数据同步</el-button>
				<span v-if="lastSyncTime" class="sync-time">最近一次同步时间：{{ lastSyncTime  }}</span>
				
				<!-- 时间范围选择器 -->
				<div v-if="showDateRange" class="date-range-inline">
					<el-date-picker
						v-model="dateRange"
						type="daterange"
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						format="YYYY-MM-DD"
						value-format="YYYY-MM-DD"
						@change="handleDateRangeChange"
						:disabled-date="disabledDate"
						class="date-range-picker"
					/>
					<el-button type="primary" size="small" @click="confirmSyncData" :loading="syncLoading" :disabled="syncDisabled">确认同步</el-button>
				</div>
			</div>

			<el-tabs v-model="activeTab" class="product-tabs">
				<el-tab-pane label="流量数据" name="traffic">
					<!-- 流量数据内容 -->
					<div class="tab-content" v-if="activeTab === 'traffic' && isDetailLoaded">
						<TrafficDataComponent
							:showTitle="false"
							:key="`traffic-${mediaProductStore.platformId}`"
						/>
					</div>
				</el-tab-pane>
				<el-tab-pane label="用户数据管理" name="user">
					<!-- 用户数据管理内容 -->
					<div class="tab-content" v-if="activeTab === 'user' && isDetailLoaded">
						<UserDataComponent 
							:showTitle="false" 
							:key="`user-${mediaProductStore.platformId}`"
						/>
					</div>
				</el-tab-pane>
				<el-tab-pane label="内容数据管理" name="content">
					<!-- 内容数据管理内容 -->
					<div class="tab-content" v-if="activeTab === 'content' && isDetailLoaded">
						<ContentDataComponent 
							:showTitle="false" 
							:key="`content-${mediaProductStore.platformId}`"
						/>
					</div>
				</el-tab-pane>
				<el-tab-pane label="用户画像分析" name="profile">
					<!-- 用户画像分析内容 -->
					<div class="tab-content" v-if="activeTab === 'profile' && isDetailLoaded">
						<UserProfileComponent 
							:showTitle="false" 
							:key="`profile-${mediaProductStore.platformId}`"
						/>
					</div>
				</el-tab-pane>
			</el-tabs>
		</el-card>

    <!-- 标签页 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ArticleListComponent from '@/views/article/articleList/index.vue'
import TrafficDataComponent from '@/views/wechatData/trafficData/index.vue'
import UserDataComponent from '@/views/wechatData/userData/index.vue'
import ContentDataComponent from '@/views/wechatData/contentData/index.vue'
import UserProfileComponent from '@/views/wechatData/userProfile/index.vue'
import { getMediaProductDetail, syncMediaPlatformData, getChannelList } from '@/api/media/mediaProduct/index'
import { formatDate } from '@/utils/index'
import useMediaProductStore from '@/store/modules/mediaProduct'
  
// 路由实例
const route = useRoute();
// 产品ID
const productId = route.params.id;

// 使用媒体产品store
const mediaProductStore = useMediaProductStore();

// 产品详情
const productDetail = ref(null);

// 当前选中的标签页
const activeTab = ref('traffic');

// 是否已获取产品详情
const isDetailLoaded = ref(false);

// 平台列表
const platformList = ref([])

// 选中的平台索引（默认选中第一个）
const selectedPlatformIndex = ref(0);

// 选择平台
const selectPlatform = (index) => {
	selectedPlatformIndex.value = index
	// 更新store中的platformId、accountId和channelId
	if (platformList.value[index]) {
		const platform = platformList.value[index]
		mediaProductStore.setPlatformId(platform.id)
		mediaProductStore.setChannelId(platform.id)
		const accountId = platform?.accountDTOList?.[0]?.id
		if (accountId) {
			mediaProductStore.setAccountId(accountId)
		}
	}
}

// 最近同步时间
const lastSyncTime = ref('');

// 同步按钮加载状态
const syncLoading = ref(false)

// 同步按钮禁用状态
const syncDisabled = ref(false)

// 显示时间范围选择器
const showDateRange = ref(false)

// 时间范围选择
const dateRange = ref([])

// 获取产品详情
const fetchProductDetail = () => {
	if (!productId) return
	getMediaProductDetail(productId, {
		queryProduct: true,
		queryChannels: true,
		queryAccount: true,
	}).then(response => {
		if (response.code === 200) {
			productDetail.value = response.data
			platformList.value = response.data.channelDTOList || []
			// 设置store中的信息
			if (platformList.value.length > 0) {
				mediaProductStore.setProductInfo(productId, platformList.value[0].id, platformList.value[0]?.accountDTOList?.[0]?.id, platformList.value[0].id)
			} else {
				mediaProductStore.setProductId(productId)
			}
			isDetailLoaded.value = true
		} else {
			ElMessage.error('获取产品详情失败')
		}
	})
}

// 处理时间范围变化
const handleDateRangeChange = (val) => {
//   if (val && val.length === 2) {
//     const start = new Date(val[0])
//     const end = new Date(val[1])
//     const diffDays = Math.floor((end - start) / (24 * 60 * 60 * 1000))
//     if (diffDays > 90) {
//       ElMessage.warning('时间范围不能超过90天')
//       dateRange.value = []
//     }
//   }
}

// 禁用日期逻辑（不能选择今天及以后的日期，且不能选择2025.11.01之前的日期）
const disabledDate = (time) => {
  // 获取今天的日期，设置为当天的0点0分0秒
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 获取2025.11.01的日期
  const minDate = new Date('2025-11-01')
  minDate.setHours(0, 0, 0, 0)
  
  // 禁用今天及以后的日期
  // 禁用2025.11.01之前的日期
  return time.getTime() >= today.getTime() || time.getTime() < minDate.getTime()
}

// 确认同步数据
const confirmSyncData = async () => {
  if (syncDisabled.value) return
  
  // 显示加载状态
  syncLoading.value = true
  
  // 获取当前选中渠道的appid
  const currentPlatform = platformList.value[selectedPlatformIndex.value]
  const accountId = currentPlatform?.accountDTOList?.[0]?.id
  if (!accountId) {
    ElMessage.error('当前平台未绑定账号，无法同步数据')
    syncLoading.value = false
    return
  }

  // 获取时间范围
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.error('请选择数据同步的时间范围')
    syncLoading.value = false
    return
  }
  
  const startdate = dateRange.value[0]
  const enddate = dateRange.value[1]
  
  let params = {
    startdate: startdate,
    enddate: enddate,
  }
  
  // 调用数据同步接口
  const response = await syncMediaPlatformData(accountId, params)
  
  if (response.code === 200) {
    // 更新最近同步时间
    lastSyncTime.value = new Date().toLocaleString('zh-CN')
    // 显示接口返回的提示信息
    ElMessage.success(response.msg || '数据同步已经触发，完成同步大约需要30分钟时间，请稍后刷新查看')
    // 禁用按钮30分钟
    syncDisabled.value = true
    // 30分钟后启用按钮
    setTimeout(() => {
      syncDisabled.value = false
    }, 30 * 60 * 1000)
    // 关闭时间范围选择器
    showDateRange.value = false
  } else {
    ElMessage.error('数据同步失败：' + (response.message || '未知错误'))
  }
  
  // 隐藏加载状态
  syncLoading.value = false
}

// 数据同步（保持原函数名，点击按钮时显示时间选择器）
const syncData = () => {
  showDateRange.value = !showDateRange.value
}

// 组件挂载时获取产品详情
onMounted(() => {
  fetchProductDetail();
});

// 组件卸载时清理store数据
onUnmounted(() => {
  mediaProductStore.clearProductInfo();
});
</script>

<style scoped>
.product-detail {
  padding: 20px;
}

.product-info-card {
  margin-bottom: 20px;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.product-meta {
  display: flex;
  gap: 30px;
  font-size: 14px;
  color: #606266;
}

.platform-card {
  margin-bottom: 20px;
  padding: 15px;
}

.platform-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.platform-tag {
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
}

.platform-tag:hover {
  opacity: 0.8;
}

.platform-tag.active {
  background-color: #409eff;
  border-color: #409eff;
  color: #ffffff;
}

.platform-bind-time {
  color: #909399;
  font-size: 14px;
}

.platform-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.sync-container {
	display: flex;
	align-items: center;
	gap: 15px;
	margin-top: 15px;
	flex-wrap: wrap;
}

.sync-time {
  font-size: 14px;
  color: #909399;
}

.sync-button {
  margin-bottom: 0;
}

.date-range-container {
	margin-top: 10px;
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
}

.date-range-inline {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	margin-left: 10px;
}

.date-range-inline .el-date-editor {
	width: 280px !important;
}

.date-range-picker {
	width: 280px;
}

.unbind-button {
  color: #409eff;
}

.product-tabs {
  margin-top: 20px;
}

.tab-content {
  padding: 0;
}
</style>
