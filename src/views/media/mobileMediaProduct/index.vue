<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<template>
	<div class="mobile-media-product ignore-vw" v-loading="loading">
		<div class="mobile-page-header">
			<h1 class="mobile-page-title">自媒体产品管理</h1>
			<el-button :disabled="products.length > 0" type="primary" size="small" class="mobile-add-btn" @click="openDrawer">
				+ 添加产品
			</el-button>
		</div>

		<div v-if="products.length > 0" class="mobile-product-list">
			<div v-for="product in products" :key="product.id" class="mobile-product-card">
				<div class="mobile-card-top">
					<h3 class="mobile-product-name">{{ product.productName }}</h3>
					<el-button type="text" class="mobile-edit-btn" @click="openEditDrawer(product)">
						<el-icon><Edit /></el-icon>
					</el-button>
				</div>

				<div class="mobile-card-info">
					<p class="mobile-info-row">
						<span class="mobile-info-label">创建时间</span>
						<span class="mobile-info-value">{{ formatDate(product.createTime) }}</span>
					</p>
					<p class="mobile-info-row">
						<span class="mobile-info-label">产品描述</span>
						<span class="mobile-info-value">{{ product.productDesc || '暂无描述' }}</span>
					</p>
				</div>

				<div v-if="product.userPlatformList && product.userPlatformList.length > 0" class="mobile-bound-platform">
					<div v-for="(userPlatform, index) in product.userPlatformList" :key="index" class="mobile-platform-row">
						<div class="mobile-platform-text">
							<span class="mobile-platform-name">{{ userPlatform.mediaPlatform.channelName }}</span>
							<span class="mobile-platform-account">{{ userPlatform.mediaPlatform.accountName }}:{{ userPlatform.mediaPlatform.appId }}</span>
						</div>
						<el-button type="text" size="small" class="mobile-unbind-btn"
							@click="unbindPlatform(userPlatform.mediaPlatform.accountId)">解绑</el-button>
					</div>
				</div>

				<div class="mobile-card-actions">
					<el-button v-if="product.userPlatformList && product.userPlatformList.length > 0" type="text"
						size="small" @click="navigateToDetail(product.id)">详情</el-button>
					<el-button type="text" size="small" @click="openBindAccountDrawer(product)">绑定账号</el-button>
					<el-button type="text" size="small" class="mobile-delete-btn" @click="deleteProduct(product.id)">删除</el-button>
				</div>
			</div>
		</div>

		<div v-if="products.length > 0" class="mobile-pagination">
			<el-pagination
				v-model:current-page="pageNum"
				v-model:page-size="pageSize"
				:page-sizes="[10, 20, 50, 100]"
				layout="prev, pager, next"
				:total="total"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				small
			/>
		</div>

		<div v-if="products.length === 0 && !loading" class="mobile-empty">
			<el-empty description="暂无自媒体产品" />
		</div>

		<el-drawer
			:title="currentEditId ? '编辑自媒体产品' : '添加自媒体产品'"
			v-model="drawerVisible"
			direction="btt"
			size="70%"
			class="mobile-drawer"
		>
			<div class="mobile-drawer-body">
				<el-form ref="formRef" :model="productForm" :rules="rules" label-position="top">
					<el-form-item label="产品名称" prop="productName" required>
						<el-input v-model="productForm.productName" placeholder="请输入产品名称" :maxlength="20" show-word-limit />
					</el-form-item>
					<el-form-item label="产品描述">
						<el-input v-model="productForm.productDesc" type="textarea" placeholder="请输入自媒体产品描述"
						 :maxlength="100" show-word-limit />
					</el-form-item>
				</el-form>
			</div>
			<template #footer>
				<div class="mobile-drawer-footer">
					<el-button @click="drawerVisible = false" style="flex:1;">取消</el-button>
					<el-button type="primary" @click="handleSubmit" style="flex:1;">确定</el-button>
				</div>
			</template>
		</el-drawer>

		<el-drawer title="平台配置" v-model="bindAccountDrawerVisible" direction="btt" size="75%" class="mobile-drawer">
			<div class="mobile-drawer-body">
				<div class="mobile-platform-label">平台名称：微信公众号</div>
				<el-form ref="bindAccountFormRef" :model="bindAccountForm" :rules="bindAccountRules" label-position="top">
					<el-form-item label="账号名称" prop="accountName" required>
						<el-input v-model="bindAccountForm.accountName" placeholder="请输入账号名称" />
					</el-form-item>
					<el-form-item label="appId" prop="appId" required>
						<el-input v-model="bindAccountForm.appId" placeholder="请输入appid" />
					</el-form-item>
					<el-form-item label="secret" prop="secret" required>
						<el-input v-model="bindAccountForm.secret" type="password" placeholder="请输入secret"
							show-password />
					</el-form-item>
				</el-form>
			</div>
			<template #footer>
				<div class="mobile-drawer-footer">
					<el-button @click="bindAccountDrawerVisible = false" style="flex:1;">取消</el-button>
					<el-button type="primary" @click="handleBindAccountSubmit" style="flex:1;">确定</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMediaProductList, deleteMediaProduct, unbindMediaPlatform, addMediaProduct, bindMediaPlatform, addUserPermission } from '@/api/media/mediaProduct/index'
import { formatDate } from '@/utils/index'
import useUserStore from '@/store/modules/user'
import { encrypt } from "@/utils/jsencrypt"

const router = useRouter()
const userStore = useUserStore()

const products = ref([])
const loading = ref(false)

const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchProductList = () => {
	loading.value = true
	getMediaProductList({
		pageNum: pageNum.value,
		pageSize: pageSize.value,
		queryConfig: {
			queryProduct: true,
			queryChannels: true,
			queryAccount: true,
		}
	}).then(response => {
		if (response.code === 200) {
			const rawProducts = response.rows || response.data?.rows || response.data?.list || []
			total.value = response.total || response.data?.total || 0
			products.value = rawProducts.map(product => {
				const userPlatformList = []
				const channelDTOList = product.channelDTOList || []
				if (channelDTOList.length > 0) {
					channelDTOList.forEach(channel => {
						const accountDTOList = channel.accountDTOList || []
						if (accountDTOList.length > 0) {
							accountDTOList.forEach(account => {
								userPlatformList.push({
									id: account.id,
									mediaPlatform: {
										id: channel.id,
										channelName: channel.channelName,
										accountName: account.accountName,
										accountId: account.id,
										appId: account.appId,
										channelType: channel.channelType
									}
								})
							})
						}
					})
				}
				return {
					id: product.baseInfo?.id,
					productName: product.baseInfo?.productName,
					productCode: product.baseInfo?.productCode,
					productDesc: product.baseInfo?.productDesc,
					createTime: product.baseInfo?.createTime,
					updateTime: product.baseInfo?.updateTime,
					channelDTOList: channelDTOList,
					userPlatformList
				}
			})
		} else {
			ElMessage.error('获取产品列表失败')
		}
	}).catch(() => {
		
	}).finally(() => {
		loading.value = false
	})
}

const handleSizeChange = (size) => {
	pageSize.value = size
	pageNum.value = 1
	fetchProductList()
}

const handleCurrentChange = (page) => {
	pageNum.value = page
	fetchProductList()
}

const deleteProduct = (productId) => {
	ElMessageBox.confirm(
		'确定要删除该产品吗？删除产品时会同时删除该产品下的所有内容，是否继续？',
		'删除确认',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		}
	).then(() => {
		deleteMediaProduct(productId).then(response => {
			if (response.code === 200) {
				ElMessage.success('删除成功')
				fetchProductList()
			} else {
				ElMessage.error('删除失败')
			}
		}).catch(() => {
			
		})
	}).catch(() => {
	})
}

onMounted(() => {
	fetchProductList()
})

const drawerVisible = ref(false)
const bindAccountDrawerVisible = ref(false)
const currentEditId = ref(null)
const currentBindProductId = ref(null)

const openDrawer = () => {
	productForm.value = {
		productName: '',
		productDesc: ''
	}
	currentEditId.value = null
	if (formRef.value) {
		formRef.value.resetFields()
	}
	drawerVisible.value = true
}

const openEditDrawer = (product) => {
	productForm.value = {
		productName: product.productName,
		productDesc: product.productDesc || ''
	}
	currentEditId.value = product.id
	if (formRef.value) {
		formRef.value.resetFields()
	}
	drawerVisible.value = true
}

const bindAccountForm = ref({
	accountName: '',
	appId: '',
	secret: ''
})

const bindAccountRules = reactive({
	accountName: [
		{ required: true, message: '请输入账号名称', trigger: 'blur' }
	],
	appId: [
		{ required: true, message: '请输入appid', trigger: 'blur' }
	],
	secret: [
		{ required: true, message: '请输入secret', trigger: 'blur' }
	]
})

const bindAccountFormRef = ref(null)

const openBindAccountDrawer = (product) => {
	bindAccountForm.value = {
		appId: '',
		secret: ''
	}
	currentBindProductId.value = product.id
	if (bindAccountFormRef.value) {
		bindAccountFormRef.value.resetFields()
	}
	bindAccountDrawerVisible.value = true
}

const handleBindAccountSubmit = () => {
	if (!bindAccountFormRef.value) return

	bindAccountFormRef.value.validate().then(() => {
		const mediaPlatform = {
			productId: currentBindProductId.value,
			channelId: 1,
			accountName: bindAccountForm.value.accountName,
			appId: bindAccountForm.value.appId,
			secret: encrypt(bindAccountForm.value.secret)
		}
		bindMediaPlatform(mediaPlatform).then(response => {
			if (response.code === 200) {
				fetchProductList()
				bindAccountDrawerVisible.value = false
				ElMessage.success('绑定账号成功')
			} else {
				ElMessage.error('绑定账号失败')
			}
		}).catch(() => {
			
		})
	}).catch(() => {
	})
}

const unbindPlatform = (accountId) => {
	if (accountId) {
		ElMessageBox.confirm(
			'确定要解绑该平台账号吗？',
			'解绑确认',
			{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}
		).then(() => {
			unbindMediaPlatform(accountId).then(response => {
				if (response.code === 200) {
					fetchProductList()
					ElMessage.success('解绑账号成功')
				} else {
					ElMessage.error('解绑失败')
				}
			}).catch(() => {
				
			})
		})
	}
}

const navigateToDetail = (productId) => {
	router.push(`/media/mediaProduct/${productId}`)
}

const productForm = ref({
	productName: '',
	productDesc: ''
})

const rules = reactive({
	productName: [
		{ required: true, message: '请输入产品名称', trigger: 'blur' }
	]
})

const formRef = ref(null)

const handleSubmit = () => {
	if (!formRef.value) return

	formRef.value.validate().then(() => {

		if (currentEditId.value) {
			const index = products.value.findIndex(p => p.id === currentEditId.value)
			if (index !== -1) {
				products.value[index] = {
					...products.value[index],
					productName: productForm.value.productName,
					productDesc: productForm.value.productDesc,
				}
				ElMessage.success('编辑产品成功')
				productForm.value = {
					productName: '',
					productDesc: ''
				}
				currentEditId.value = null
				drawerVisible.value = false
			}
		} else {
			const mediaProduct = {
				productName: productForm.value.productName,
				productDesc: productForm.value.productDesc
			}
			addMediaProduct(mediaProduct).then(response => {
				if (response.code === 200) {
					fetchProductList()
					ElMessage.success('添加自媒体产品成功')
					productForm.value = {
						productName: '',
						productDesc: ''
					}
					currentEditId.value = null
					drawerVisible.value = false
				} else {
					ElMessage.error('添加自媒体产品失败')
				}
			}).catch(() => {
				
			})
		}
	}).catch(() => {
	})
}
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
$success-bg: rgba(74, 181, 126, 0.12);
$success-text: #3b9363;
$danger-bg: rgba(235, 106, 106, 0.12);
$danger-text: #cf5656;
$border-light: rgba(225, 231, 244, 0.95);

.ignore-vw.mobile-media-product {
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

.ignore-vw .mobile-page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
}

.ignore-vw .mobile-page-title {
	font-size: 22px;
	font-weight: 700;
	color: $text-main;
	margin: 0;
}

.ignore-vw .mobile-add-btn {
	height: 42px;
	border-radius: 14px !important;
	background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%) !important;
	box-shadow: 0 10px 20px rgba(95, 124, 240, 0.18);
	font-size: 15px !important;
	font-weight: 600 !important;
	padding: 0 22px !important;
	border: none !important;

	&:disabled {
		background: #d0d5de !important;
		box-shadow: none !important;
		color: #9ca3af !important;
		cursor: not-allowed;
	}
}

.ignore-vw .mobile-product-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.ignore-vw .mobile-product-card {
	background: $card-bg;
	border: 1px solid $card-border;
	border-radius: 20px;
	padding: 18px;
	box-shadow: $card-shadow;
	backdrop-filter: blur(16px);
}

.ignore-vw .mobile-card-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 14px;
}

.ignore-vw .mobile-product-name {
	font-size: 18px;
	font-weight: 700;
	color: $text-main;
	margin: 0;
}

.ignore-vw .mobile-edit-btn {
	color: $brand-start;
	padding: 6px;
	font-size: 16px;
}

.ignore-vw .mobile-card-info {
	margin-bottom: 14px;
}

.ignore-vw .mobile-info-row {
	display: flex;
	gap: 10px;
	margin: 8px 0;
	font-size: 14px;
	line-height: 1.6;
}

.ignore-vw .mobile-info-label {
	color: $text-light;
	white-space: nowrap;
	flex-shrink: 0;
	font-weight: 500;
}

.ignore-vw .mobile-info-value {
	color: $text-sub;
	word-break: break-all;
}

.ignore-vw .mobile-bound-platform {
	background: $success-bg;
	border: 1px solid rgba(74, 181, 126, 0.2);
	border-radius: 14px;
	padding: 14px;
	margin-bottom: 14px;
}

.ignore-vw .mobile-platform-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 0;
}

.ignore-vw .mobile-platform-row + .mobile-platform-row {
	border-top: 1px solid rgba(74, 181, 126, 0.15);
}

.ignore-vw .mobile-platform-text {
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
	flex: 1;
}

.ignore-vw .mobile-platform-name {
	font-size: 14px;
	font-weight: 600;
	color: $success-text;
}

.ignore-vw .mobile-platform-account {
	font-size: 13px;
	color: $text-sub;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.ignore-vw .mobile-unbind-btn {
	color: $danger-text;
	padding: 0;
	flex-shrink: 0;
	font-size: 13px;
}

.ignore-vw .mobile-card-actions {
	display: flex;
	border-top: 1px solid $border-light;
	padding-top: 14px;
	gap: 0;
}

.ignore-vw .mobile-card-actions :deep(.el-button) {
	flex: 1;
	font-size: 14px;
	padding: 10px 0;
	color: $text-sub;
}

.ignore-vw .mobile-card-actions :deep(.el-button):first-child {
	color: $brand-start;
	font-weight: 600;
}

.ignore-vw .mobile-delete-btn {
	color: $danger-text;
}

.ignore-vw .mobile-pagination {
	display: flex;
	justify-content: center;
	margin-top: 20px;
	padding: 12px 0;

	:deep(.el-pagination) {
		flex-wrap: wrap;
		justify-content: center;
	}

	:deep(.el-pagination__item) {
		min-width: 40px;
		height: 34px;
		font-size: 14px;
	}
}

.ignore-vw .mobile-empty {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 50vh;
}

.ignore-vw .mobile-drawer {
	:deep(.el-drawer__header) {
		margin-bottom: 0;
		padding: 18px 16px;
		border-bottom: 1px solid $border-light;
		background: $card-bg;
	}

	:deep(.el-drawer__body) {
		display: flex;
		flex-direction: column;
		background: $page-top;
	}

	:deep(.el-drawer__footer) {
		border-top: 1px solid $border-light;
		padding: 0;
		background: $card-bg;
	}
}

.ignore-vw .mobile-drawer-body {
	flex: 1;
	overflow-y: auto;
	padding: 18px 16px;
}

.ignore-vw .mobile-platform-label {
	font-size: 15px;
	font-weight: 600;
	color: $text-main;
	margin-bottom: 18px;
	padding-bottom: 14px;
	border-bottom: 1px solid $border-light;
}

.ignore-vw .mobile-drawer-footer {
	display: flex;
	gap: 0;
	padding: 0;

	:deep(.el-button) {
		border-radius: 0;
		border: none;
		height: 50px;
		font-size: 15px;
		font-weight: 600;
	}

	:deep(.el-button--primary) {
		background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%);
	}
}

@media (max-width: 420px) {
	.ignore-vw.mobile-media-product {
		padding-left: 12px;
		padding-right: 12px;
	}

	.ignore-vw .mobile-product-card {
		border-radius: 16px;
		padding: 14px;
	}

	.ignore-vw .mobile-page-title {
		font-size: 20px;
	}
}
</style>
