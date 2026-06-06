/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
<template>
	<div class="mobile-product-detail ignore-vw" v-loading="!productDetail">
		<section class="mobile-hero-card">
			<h1 class="mobile-hero-title">{{ productDetail?.baseInfo?.productName || '加载中...' }}</h1>
			<p class="mobile-hero-desc">{{ productDetail?.baseInfo?.productDesc || '暂无产品描述' }}</p>
			<div class="mobile-hero-texts">
				<p class="mobile-hero-text">创建时间：{{ formatDate(productDetail?.baseInfo?.createTime) || '-' }}</p>
				<p class="mobile-hero-text">当前平台：{{ currentPlatform?.channelName || '-' }}</p>
			</div>
		</section>

		<section v-if="platformList.length > 0" class="mobile-info-card">
			<div class="mobile-platform-scroll">
				<div class="mobile-platform-row">
					<button
						v-for="(platform, index) in platformList"
						:key="platform.id || index"
						type="button"
						:class="['mobile-platform-chip', { active: selectedPlatformIndex === index }]"
						@click="selectPlatform(index)"
					>
						{{ platform.channelName }}
					</button>
				</div>
			</div>

			<div class="mobile-account-card">
				<div class="mobile-account-line">
					<span class="mobile-account-label">账号名称</span>
					<strong class="mobile-account-value">{{ currentAccount?.accountName || '当前平台暂未绑定账号' }}</strong>
				</div>
				<div v-if="currentAccount?.appId" class="mobile-account-line">
					<span class="mobile-account-label">AppID</span>
					<strong class="mobile-account-value appid">{{ currentAccount?.appId }}</strong>
				</div>
			</div>
		</section>

		<section v-if="platformList.length > 0" class="mobile-info-card">
			<div class="mobile-sync-main">
				<el-button
					type="primary"
					class="mobile-sync-button"
					@click="showDateRange = !showDateRange"
					:loading="syncLoading"
					:disabled="syncDisabled"
				>
					数据同步
				</el-button>
				<el-tooltip v-if="syncStatus === 'syncing'" content="数据同步中，请稍后刷新页面查看同步结果。" placement="top">
					<el-icon class="mobile-sync-icon"><Warning /></el-icon>
				</el-tooltip>
				<el-tooltip v-if="syncStatus === 'failed' && syncNoticeContent" :content="syncNoticeContent" placement="top">
					<el-icon class="mobile-sync-icon warning"><Warning /></el-icon>
				</el-tooltip>
				<span :class="['mobile-sync-pill', syncStatus]">{{ syncStatusText }}</span>
			</div>

			<p v-if="lastSyncTime" class="mobile-sync-time">最近一次同步时间：{{ lastSyncTime }}</p>

			<div v-if="showDateRange" class="mobile-sync-range-card">
				<p class="mobile-sync-range-title">选择同步时间范围</p>
				<div class="mobile-date-field-group">
					<div class="mobile-date-field">
						<span class="mobile-date-field-label">开始日期</span>
						<el-date-picker
							v-model="syncStartDate"
							type="date"
							placeholder="开始日期"
							format="YYYY-MM-DD"
							value-format="YYYY-MM-DD"
							:disabled-date="disabledDate"
							class="mobile-date-range-picker"
						/>
					</div>
					<div class="mobile-date-field">
						<span class="mobile-date-field-label">结束日期</span>
						<el-date-picker
							v-model="syncEndDate"
							type="date"
							placeholder="结束日期"
							format="YYYY-MM-DD"
							value-format="YYYY-MM-DD"
							:disabled-date="disabledDate"
							class="mobile-date-range-picker"
						/>
					</div>
				</div>
				<el-button
					v-if="syncStatus !== 'syncing'"
					type="primary"
					class="mobile-confirm-button"
					@click="confirmSyncData"
					:loading="syncLoading"
					:disabled="syncDisabled"
				>
					确认同步
				</el-button>
			</div>
		</section>

		<section v-if="platformList.length > 0" class="mobile-info-card">
			<div class="mobile-tab-scroll">
				<div class="mobile-tab-row">
					<button
						v-for="tab in tabList"
						:key="tab.name"
						type="button"
						:class="['mobile-tab-chip', { active: activeTab === tab.name }]"
						@click="activeTab = tab.name"
					>
						{{ tab.label }}
					</button>
				</div>
			</div>
		</section>

		<section v-if="platformList.length > 0" class="mobile-content-card">
			<div v-if="activeTab === 'traffic' && isDetailLoaded" class="mobile-tab-panel">
				<TrafficDataComponent :showTitle="false" :key="`traffic-${mediaProductStore.platformId}`" />
			</div>
			<div v-if="activeTab === 'user' && isDetailLoaded" class="mobile-tab-panel">
				<UserDataComponent :showTitle="false" :key="`user-${mediaProductStore.platformId}`" />
			</div>
			<div v-if="activeTab === 'content' && isDetailLoaded" class="mobile-tab-panel">
				<ContentDataComponent :showTitle="false" :key="`content-${mediaProductStore.platformId}`" />
			</div>
			<div v-if="activeTab === 'profile' && isDetailLoaded" class="mobile-tab-panel">
				<UserProfileComponent :showTitle="false" :key="`profile-${mediaProductStore.platformId}`" />
			</div>
		</section>
	</div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElIcon, ElMessage, ElTooltip } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import TrafficDataComponent from '@/views/media/mobileMediaProduct/detail/trafficData/index.vue'
import UserDataComponent from '@/views/media/mobileMediaProduct/detail/userData/index.vue'
import ContentDataComponent from '@/views/media/mobileMediaProduct/detail/contentData/index.vue'
import UserProfileComponent from '@/views/media/mobileMediaProduct/detail/userProfile/index.vue'
import { getMediaProductDetail, syncMediaPlatformData, getSyncStatus } from '@/api/media/mediaProduct/index'
import { formatDate } from '@/utils/index'
import useMediaProductStore from '@/store/modules/mediaProduct'

const route = useRoute()
const productId = route.params.id
const mediaProductStore = useMediaProductStore()

const productDetail = ref(null)
const activeTab = ref('traffic')
const isDetailLoaded = ref(false)
const platformList = ref([])
const selectedPlatformIndex = ref(0)
const lastSyncTime = ref('')
const syncLoading = ref(false)
const syncDisabled = ref(false)
const syncStatus = ref('completed')
const syncNoticeContent = ref('')
const showDateRange = ref(false)
const dateRange = ref([])

const tabList = [
	{ name: 'traffic', label: '流量数据' },
	{ name: 'user', label: '用户数据管理' },
	{ name: 'content', label: '内容数据管理' },
	{ name: 'profile', label: '用户画像分析' },
]

const currentPlatform = computed(() => platformList.value[selectedPlatformIndex.value] || null)
const currentAccount = computed(() => currentPlatform.value?.accountDTOList?.[0] || null)
const syncStatusText = computed(() => {
	if (syncStatus.value === 'syncing') return '同步中'
	if (syncStatus.value === 'failed') return '同步失败'
	return '同步成功'
})
const syncStartDate = computed({
	get: () => dateRange.value?.[0] || '',
	set: (value) => {
		dateRange.value = [value || '', dateRange.value?.[1] || ''].filter(Boolean)
		if (dateRange.value.length === 1 && dateRange.value[0] === (dateRange.value?.[1] || '')) {
			dateRange.value = [value || '']
		}
	}
})
const syncEndDate = computed({
	get: () => dateRange.value?.[1] || '',
	set: (value) => {
		const start = dateRange.value?.[0] || ''
		if (!start && value) {
			dateRange.value = ['', value]
			return
		}
		dateRange.value = [start, value || '']
	}
})

const selectPlatform = (index) => {
	selectedPlatformIndex.value = index
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

const fetchProductDetail = () => {
	if (!productId) return
	getMediaProductDetail(productId, {
		queryProduct: true,
		queryChannels: true,
		queryAccount: true,
	}).then((response) => {
		if (response.code === 200) {
			productDetail.value = response.data
			platformList.value = response.data.channelDTOList || []
			if (platformList.value.length > 0) {
				mediaProductStore.setProductInfo(
					productId,
					platformList.value[0].id,
					platformList.value[0]?.accountDTOList?.[0]?.id,
					platformList.value[0].id
				)
			} else {
				mediaProductStore.setProductId(productId)
			}
			isDetailLoaded.value = true
			fetchSyncStatus()
		} else {
			ElMessage.error('获取产品详情失败')
		}
	})
}

const fetchSyncStatus = () => {
	getSyncStatus({ pageNum: 1, pageSize: 100 })
		.then((response) => {
			if (response.code === 200 && response.rows && response.rows.length > 0) {
				const syncNotices = response.rows.filter((item) => item.noticeType === '3')

				if (syncNotices.length === 0) {
					syncDisabled.value = false
					syncLoading.value = false
				} else {
					syncNotices.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
					const latestSyncNotice = syncNotices[0]

					if (latestSyncNotice.status === '0') {
						syncStatus.value = 'completed'
					} else if (latestSyncNotice.status === '1') {
						syncStatus.value = 'failed'
					} else if (latestSyncNotice.status === '2') {
						syncStatus.value = 'syncing'
					}

					if (latestSyncNotice.createTime) {
						lastSyncTime.value = formatDate(latestSyncNotice.createTime)
					}

					if (latestSyncNotice.noticeContent) {
						syncNoticeContent.value = latestSyncNotice.noticeContent
					}

					if (syncStatus.value === 'syncing') {
						syncDisabled.value = true
						syncLoading.value = true
					} else {
						syncDisabled.value = false
						syncLoading.value = false
					}
				}
			}
		})
		.catch(() => {})
}

const handleDateRangeChange = () => {}

const disabledDate = (time) => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const minDate = new Date('2025-11-01')
	minDate.setHours(0, 0, 0, 0)

	return time.getTime() >= today.getTime() || time.getTime() < minDate.getTime()
}

const confirmSyncData = async () => {
	if (syncDisabled.value) return

	syncLoading.value = true

	const currentPlatformData = platformList.value[selectedPlatformIndex.value]
	const accountId = currentPlatformData?.accountDTOList?.[0]?.id
	if (!accountId) {
		ElMessage.error('当前平台未绑定账号，无法同步数据')
		syncLoading.value = false
		return
	}

	if (!dateRange.value || dateRange.value.length !== 2) {
		ElMessage.error('请选择数据同步的时间范围')
		syncLoading.value = false
		return
	}

	const params = {
		startdate: dateRange.value[0],
		enddate: dateRange.value[1],
	}

	const response = await syncMediaPlatformData(accountId, params)

	if (response.code === 200) {
		syncStatus.value = 'syncing'
		syncDisabled.value = true
		ElMessage.success(response.msg || '数据同步已经触发，请稍后刷新查看')
		showDateRange.value = false
	} else {
		ElMessage.error('数据同步失败：' + (response.message || '未知错误'))
		syncLoading.value = false
	}
}

onMounted(() => {
	fetchProductDetail()
})

onUnmounted(() => {
	mediaProductStore.clearProductInfo()
})
</script>

<style scoped lang="scss">
$page-top: #f7f9ff;
$page-bottom: #edf2fb;
$card-bg: rgba(255, 255, 255, 0.96);
$card-border: rgba(225, 231, 244, 0.95);
$card-shadow: 0 16px 34px rgba(106, 124, 163, 0.12);
$text-main: #3f4963;
$text-sub: #8f97ad;
$text-light: #a8b0c4;
$brand-start: #5f7cf0;
$brand-end: #7a8fe7;
$brand-soft: rgba(99, 118, 232, 0.1);
$success-bg: rgba(74, 181, 126, 0.12);
$success-text: #3b9363;
$warning-bg: rgba(232, 166, 74, 0.14);
$warning-text: #b77728;
$danger-bg: rgba(235, 106, 106, 0.12);
$danger-text: #cf5656;

.ignore-vw.mobile-product-detail {
	min-height: 100vh;
	min-height: 100dvh;
	padding: calc(env(safe-area-inset-top, 0px) + 16px) 16px calc(env(safe-area-inset-bottom, 0px) + 28px);
	background:
		radial-gradient(circle at 14% 10%, rgba(107, 126, 239, 0.15), rgba(107, 126, 239, 0) 26%),
		radial-gradient(circle at 86% 6%, rgba(111, 161, 224, 0.14), rgba(111, 161, 224, 0) 24%),
		linear-gradient(180deg, $page-top 0%, $page-bottom 100%);
	-webkit-font-smoothing: antialiased;
	box-sizing: border-box;
}

.ignore-vw .mobile-hero-card,
.ignore-vw .mobile-info-card,
.ignore-vw .mobile-content-card {
	width: 100%;
	background: $card-bg;
	border: 1px solid $card-border;
	border-radius: 24px;
	box-shadow: $card-shadow;
	backdrop-filter: blur(16px);
	box-sizing: border-box;
}

.ignore-vw .mobile-hero-card {
	position: relative;
	padding: 18px 16px 16px;
	margin-bottom: 12px;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 80px;
		background: linear-gradient(180deg, rgba(105, 124, 232, 0.12), rgba(105, 124, 232, 0));
		pointer-events: none;
	}
}

.ignore-vw .mobile-hero-title {
	position: relative;
	margin: 0 0 10px;
	font-size: 22px;
	line-height: 1.25;
	font-weight: 700;
	color: $text-main;
	word-break: break-word;
}

.ignore-vw .mobile-hero-desc {
	position: relative;
	margin: 0;
	font-size: 14px;
	line-height: 1.65;
	color: $text-sub;
}

.ignore-vw .mobile-hero-texts {
	position: relative;
	margin-top: 12px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.ignore-vw .mobile-hero-text {
	margin: 0;
	font-size: 13px;
	line-height: 1.6;
	color: $text-sub;
}

.ignore-vw .mobile-info-card {
	padding: 16px 14px;
	margin-bottom: 12px;
}

.ignore-vw .mobile-content-card {
	padding: 16px;
}

.ignore-vw .mobile-section-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 16px;
}

.ignore-vw .mobile-section-head.sync {
	align-items: center;
}

.ignore-vw .mobile-section-eyebrow {
	margin: 0 0 6px;
	font-size: 13px;
	font-weight: 700;
	letter-spacing: 0.4px;
	color: $text-light;
}

.ignore-vw .mobile-section-title {
	margin: 0;
	font-size: 22px;
	line-height: 1.34;
	font-weight: 700;
	color: $text-main;
}

.ignore-vw .mobile-platform-scroll,
.ignore-vw .mobile-tab-scroll {
	overflow-x: auto;
	scrollbar-width: none;
}

.ignore-vw .mobile-platform-scroll::-webkit-scrollbar,
.ignore-vw .mobile-tab-scroll::-webkit-scrollbar {
	display: none;
}

.ignore-vw .mobile-platform-row,
.ignore-vw .mobile-tab-row {
	display: flex;
	gap: 10px;
	width: max-content;
	min-width: 100%;
	padding: 4px 2px 8px;
	box-sizing: border-box;
}

.ignore-vw .mobile-platform-chip,
.ignore-vw .mobile-tab-chip {
	min-height: 38px;
	padding: 0 14px;
	border: 1px solid rgba(226, 231, 242, 0.94);
	border-radius: 14px;
	background: rgba(247, 249, 253, 0.96);
	color: $text-sub;
	font-size: 14px;
	font-weight: 600;
	white-space: nowrap;
	transition: all 0.22s ease;
	flex-shrink: 0;
}

.ignore-vw .mobile-platform-chip.active,
.ignore-vw .mobile-tab-chip.active {
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 255, 1));
	box-shadow:
		0 10px 22px rgba(103, 121, 190, 0.14),
		inset 0 0 0 1px rgba(101, 114, 220, 0.16);
	border-color: rgba(101, 114, 220, 0.34);
	color: #5d6bd8;
	transform: translateY(-1px);
}

.ignore-vw .mobile-account-card {
	margin-top: 12px;
	padding: 14px;
	border-radius: 14px;
	background: linear-gradient(180deg, rgba(248, 250, 255, 0.96), rgba(243, 246, 252, 0.96));
	box-shadow: inset 0 0 0 1px rgba(228, 233, 244, 0.94);
}

.ignore-vw .mobile-account-line + .mobile-account-line {
	margin-top: 12px;
	padding-top: 12px;
	border-top: 1px solid rgba(224, 229, 240, 0.9);
}

.ignore-vw .mobile-account-label {
	display: block;
	margin-bottom: 6px;
	font-size: 13px;
	color: $text-light;
}

.ignore-vw .mobile-account-value {
	display: block;
	font-size: 15px;
	line-height: 1.5;
	color: $text-main;
	word-break: break-word;
}

.ignore-vw .mobile-account-value.appid {
	font-size: 15px;
	color: $text-sub;
	word-break: break-all;
}

.ignore-vw .mobile-sync-pill {
	flex-shrink: 0;
	padding: 6px 12px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 600;
}

.ignore-vw .mobile-sync-pill.completed {
	background: $success-bg;
	color: $success-text;
}

.ignore-vw .mobile-sync-pill.syncing {
	background: $warning-bg;
	color: $warning-text;
}

.ignore-vw .mobile-sync-pill.failed {
	background: $danger-bg;
	color: $danger-text;
}

.ignore-vw .mobile-sync-main {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}

.ignore-vw .mobile-sync-button {
	height: 42px;
	border: none !important;
	border-radius: 14px !important;
	background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%) !important;
	box-shadow: 0 10px 20px rgba(95, 124, 240, 0.18);
	font-size: 15px !important;
	font-weight: 600 !important;
	padding: 0 22px !important;
}

.ignore-vw .mobile-sync-icon {
	width: 28px;
	height: 28px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	background: rgba(232, 166, 74, 0.12);
	color: $warning-text;
	font-size: 14px;
}

.ignore-vw .mobile-sync-icon.warning {
	background: rgba(235, 106, 106, 0.12);
	color: $danger-text;
}

.ignore-vw .mobile-sync-time {
	margin: 12px 0 0;
	font-size: 13px;
	line-height: 1.5;
	color: $text-sub;
}

.ignore-vw .mobile-sync-range-card {
	margin-top: 12px;
	padding: 14px;
	border-radius: 14px;
	background: rgba(246, 248, 253, 0.94);
	box-shadow: inset 0 0 0 1px rgba(229, 234, 244, 0.94);
}

.ignore-vw .mobile-sync-range-title {
	margin: 0 0 10px;
	font-size: 14px;
	font-weight: 600;
	color: $text-main;
}

.ignore-vw .mobile-date-range-picker {
	width: 100% !important;
}

.ignore-vw .mobile-date-range-picker :deep(.el-date-editor),
.ignore-vw .mobile-date-range-picker :deep(.el-input__wrapper) {
	width: 100% !important;
}

.ignore-vw .mobile-date-field-group {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.ignore-vw .mobile-date-field {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.ignore-vw .mobile-date-field-label {
	font-size: 13px;
	font-weight: 600;
	color: $text-sub;
}

.ignore-vw .mobile-confirm-button {
	width: 100%;
	height: 42px;
	margin-top: 12px;
	border-radius: 14px !important;
	font-size: 14px !important;
	font-weight: 600 !important;
}

.ignore-vw .mobile-tab-panel {
	overflow-x: auto;
}

.ignore-vw .mobile-tab-panel :deep(.traffic-container),
.ignore-vw .mobile-tab-panel :deep(.user-data-container),
.ignore-vw .mobile-tab-panel :deep(.content-data-container),
.ignore-vw .mobile-tab-panel :deep(.user-profile-container) {
	padding: 0;
}

.ignore-vw .mobile-tab-panel :deep(.note-card),
.ignore-vw .mobile-tab-panel :deep(.filter-card),
.ignore-vw .mobile-tab-panel :deep(.card-header) {
	margin-bottom: 16px;
}

.ignore-vw .mobile-tab-panel :deep(.note-content) {
	padding: 14px 16px;
	border-radius: 16px;
	font-size: 13px;
	line-height: 1.7;
}

.ignore-vw .mobile-tab-panel :deep(.note-title) {
	font-size: 15px;
	font-weight: 700;
}

.ignore-vw .mobile-tab-panel :deep(.note-item),
.ignore-vw .mobile-tab-panel :deep(.note-text) {
	font-size: 13px;
	line-height: 1.7;
}

.ignore-vw .mobile-tab-panel :deep(.traffic-tabs .el-tabs__nav-wrap),
.ignore-vw .mobile-tab-panel :deep(.profile-tabs .el-tabs__nav-wrap) {
	overflow-x: auto;
	scrollbar-width: none;
}

.ignore-vw .mobile-tab-panel :deep(.traffic-tabs .el-tabs__nav-wrap::-webkit-scrollbar),
.ignore-vw .mobile-tab-panel :deep(.profile-tabs .el-tabs__nav-wrap::-webkit-scrollbar) {
	display: none;
}

.ignore-vw .mobile-tab-panel :deep(.traffic-tabs .el-tabs__item),
.ignore-vw .mobile-tab-panel :deep(.profile-tabs .el-tabs__item) {
	height: 42px;
	padding: 0 14px;
	font-size: 18px;
	font-weight: 600;
}

.ignore-vw .mobile-tab-panel :deep(.traffic-tabs .el-tabs__content),
.ignore-vw .mobile-tab-panel :deep(.profile-tabs .el-tabs__content) {
	margin-top: 16px;
}

.ignore-vw .mobile-tab-panel :deep(.filter-container) {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.ignore-vw .mobile-tab-panel :deep(.filter-content) {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.ignore-vw .mobile-tab-panel :deep(.filter-item) {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.ignore-vw .mobile-tab-panel :deep(.filter-label) {
	width: auto;
	margin-top: 0;
	font-size: 14px;
	color: $text-sub;
}

.ignore-vw .mobile-tab-panel :deep(.date-picker),
.ignore-vw .mobile-tab-panel :deep(.title-input),
.ignore-vw .mobile-tab-panel :deep(.el-date-editor--daterange) {
	width: 100% !important;
}

.ignore-vw .mobile-tab-panel :deep(.filter-actions),
.ignore-vw .mobile-tab-panel :deep(.action-buttons) {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	justify-content: flex-start;
	align-items: stretch;
}

.ignore-vw .mobile-tab-panel :deep(.button-wrapper) {
	flex: 1 1 calc(50% - 5px);
	min-width: 0;
}

.ignore-vw .mobile-tab-panel :deep(.filter-actions .el-button),
.ignore-vw .mobile-tab-panel :deep(.action-buttons .el-button),
.ignore-vw .mobile-tab-panel :deep(.button-wrapper .el-button) {
	width: 100%;
	min-height: 46px;
	font-size: 15px;
	border-radius: 14px;
}

.ignore-vw .mobile-tab-panel :deep(.el-table) {
	min-width: 720px;
	font-size: 15px;
}

.ignore-vw .mobile-tab-panel :deep(.el-table th),
.ignore-vw .mobile-tab-panel :deep(.el-table td) {
	padding: 16px 10px;
}

.ignore-vw .mobile-tab-panel :deep(.pagination-container) {
	display: flex;
	justify-content: flex-start;
	margin-top: 16px;
	padding-top: 16px;
}

.ignore-vw .mobile-tab-panel :deep(.el-pagination) {
	flex-wrap: wrap;
	gap: 8px;
}

@media (max-width: 420px) {
	.ignore-vw.mobile-product-detail {
		padding-left: 12px;
		padding-right: 12px;
	}

	.ignore-vw .mobile-hero-card,
	.ignore-vw .mobile-info-card,
	.ignore-vw .mobile-content-card {
		border-radius: 20px;
	}

	.ignore-vw .mobile-hero-title {
		font-size: 26px;
	}

	.ignore-vw .mobile-section-head.sync {
		flex-direction: column;
		align-items: flex-start;
	}

	.ignore-vw .mobile-tab-panel :deep(.button-wrapper) {
		flex-basis: 100%;
	}
}
</style>
