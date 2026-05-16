<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<template>
	<div class="media-product" v-loading="loading">
		<h2 class="page-title">自媒体产品管理</h2>

		<el-button :disabled="products.length > 0" type="primary" class="add-button" @click="openDrawer">
			添加自媒体产品
		</el-button>

		<!-- 产品列表 -->
		<div v-if="products.length > 0" class="products-container">
			<el-card v-for="product in products" :key="product.id" class="product-card">
				<div class="card-header">
					<h3 class="product-name">{{ product.productName }}</h3>
					<el-tooltip content="编辑" placement="top">
						<el-button type="text" class="edit-button" @click="openEditDrawer(product)">
							<el-icon>
								<Edit />
							</el-icon>
						</el-button>
					</el-tooltip>
				</div>



				<div class="product-info">
					<div class="time-info">
						<p>创建时间：{{ formatDate(product.createTime) }}</p>
						<!-- <p>修改时间：{{ product.modifyTime }}</p> -->
					</div>
					<p>产品描述：{{ product.productDesc || '暂无描述' }}</p>
					<div v-if="product.userPlatformList && product.userPlatformList.length > 0"
						class="bound-platform">
						<div v-for="(userPlatform, index) in product.userPlatformList" :key="index"
							class="platform-item">
							<p>{{ userPlatform.mediaPlatform.channelName }} ({{userPlatform.mediaPlatform.accountName}}:{{ userPlatform.mediaPlatform.appId }})</p>
							<el-button type="text" size="small" class="unbind-button"
								@click="unbindPlatform(userPlatform.mediaPlatform.accountId)">解绑</el-button>
						</div>
					</div>
				</div>

				<div class="card-footer">
					<el-button v-if="product.userPlatformList && product.userPlatformList.length > 0" type="text"
						@click="navigateToDetail(product.id)">详情</el-button>
					<el-button type="text" @click="openBindAccountDrawer(product)">绑定平台账号</el-button>
					<el-button type="text" class="delete-button" @click="deleteProduct(product.id)">删除</el-button>
				</div>
			</el-card>
		</div>

		<!-- 分页控件 -->
		<div v-if="products.length > 0" class="pagination-container">
			<el-pagination
				v-model:current-page="pageNum"
				v-model:page-size="pageSize"
				:page-sizes="[10, 20, 50, 100]"
				layout="total, sizes, prev, pager, next, jumper"
				:total="total"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
			/>
		</div>

		<!-- 暂无数据 -->
		<div v-else class="no-data">
			<el-empty description="暂无自媒体产品" />
		</div>

		<!-- 添加自媒体产品抽屉 -->
		<el-drawer :title="currentEditId ? '编辑自媒体产品' : '添加自媒体产品'" v-model="drawerVisible" direction="rtl" size="500px"
			class="product-drawer">
			<div class="drawer-content">
				<el-form ref="formRef" :model="productForm" :rules="rules" label-width="120px">
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
				<div class="drawer-footer">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="handleSubmit">确定</el-button>
				</div>
			</template>

		</el-drawer>

		<!-- 绑定平台账号抽屉 -->
		<el-drawer title="平台配置" v-model="bindAccountDrawerVisible" direction="rtl" size="500px" class="product-drawer">
			<div class="drawer-content">
				<div class="platform-info">
					<p>平台名称：微信公众号</p>
				</div>
				<el-form ref="bindAccountFormRef" :model="bindAccountForm" :rules="bindAccountRules"
					label-width="120px">
					
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
				<div class="drawer-footer">
					<el-button @click="bindAccountDrawerVisible = false">取消</el-button>
					<el-button type="primary" @click="handleBindAccountSubmit">确定</el-button>
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

// 路由实例
const router = useRouter()
const userStore = useUserStore()

// 产品数据
const products = ref([])
const loading = ref(false)

// 分页参数
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取产品列表
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
			// 根据返回格式，转换数据结构
			// rows 数组中每个元素代表一个产品
			const rawProducts = response.rows || response.data?.rows || response.data?.list || []
			total.value = response.total || response.data?.total || 0
			products.value = rawProducts.map(product => {
				// 合并所有渠道的账号到userPlatformList
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

// 分页大小变化处理
const handleSizeChange = (size) => {
	pageSize.value = size
	pageNum.value = 1
	fetchProductList()
}

// 当前页变化处理
const handleCurrentChange = (page) => {
	pageNum.value = page
	fetchProductList()
}

// 删除产品
const deleteProduct = (productId) => {
	// 显示确认对话框
	ElMessageBox.confirm(
		'确定要删除该产品吗？删除产品时会同时删除该产品下的所有内容，是否继续？',
		'删除确认',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		}
	).then(() => {
		// 点击确定后执行
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
		// 点击取消时会进入这里，不做处理
	})
}

// // 绑定平台账号后，需要更新产品列表中的userPlatformList
// const updateUserPlatformList = (productId, newAccount) => {
// 	const product = products.value.find(p => p.id === productId)
// 	if (product) {
// 		// 将新绑定的账号添加到userPlatformList
// 		const existing = product.userPlatformList.find(p => p.id === newAccount.id)
// 		if (!existing) {
// 			product.userPlatformList.push({
// 				id: newAccount.id,
// 				mediaPlatform: {
// 					id: newAccount.channelId,
// 					accountName: newAccount.accountName,
// 					accountId: newAccount.id,
// 					channelName: newAccount.channelName,
// 					appId: newAccount.appId,
// 					channelType: newAccount.channelType || 'wechat'
// 				}
// 			})
// 		}
// 	}
// }

// 组件挂载时获取产品列表
onMounted(() => {
	fetchProductList()
})

// 抽屉状态
const drawerVisible = ref(false)
// 绑定账号抽屉状态
const bindAccountDrawerVisible = ref(false)
// 当前编辑的产品ID
const currentEditId = ref(null)
// 当前绑定账号的产品ID
const currentBindProductId = ref(null)

// 打开抽屉
const openDrawer = () => {
	// 重置表单数据
	productForm.value = {
		productName: '',
		productDesc: ''
	}
	// 重置当前编辑ID
	currentEditId.value = null
	// 重置表单验证
	if (formRef.value) {
		formRef.value.resetFields()
	}
	// 打开抽屉
	drawerVisible.value = true
}

// 打开编辑抽屉
const openEditDrawer = (product) => {
	// 填充表单数据
	productForm.value = {
		productName: product.productName,
		productDesc: product.productDesc || ''
	}
	// 设置当前编辑ID
	currentEditId.value = product.id
	// 重置表单验证
	if (formRef.value) {
		formRef.value.resetFields()
	}
	// 打开抽屉
	drawerVisible.value = true
}

// 绑定账号表单数据
const bindAccountForm = ref({
	accountName: '',
	appId: '',
	secret: ''
})

// 绑定账号表单验证规则
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

// 绑定账号表单引用
const bindAccountFormRef = ref(null)

// 打开绑定账号抽屉
const openBindAccountDrawer = (product) => {
	// 重置表单数据
	bindAccountForm.value = {
		appId: '',
		secret: ''
	}
	// 设置当前绑定账号的产品ID
	currentBindProductId.value = product.id
	// 重置表单验证
	if (bindAccountFormRef.value) {
		bindAccountFormRef.value.resetFields()
	}
	// 打开抽屉
	bindAccountDrawerVisible.value = true
}

// 提交绑定账号表单
const handleBindAccountSubmit = () => {
	if (!bindAccountFormRef.value) return

	bindAccountFormRef.value.validate().then(() => {
		// 调用绑定平台接口
		const mediaPlatform = {
			productId: currentBindProductId.value,
			channelId: 1,
			accountName: bindAccountForm.value.accountName,
			appId: bindAccountForm.value.appId,
			secret: encrypt(bindAccountForm.value.secret)
			// secret: bindAccountForm.value.secret
		}
		bindMediaPlatform(mediaPlatform).then(response => {
			if (response.code === 200) {
				// 刷新产品列表
				fetchProductList()
				// 关闭抽屉
				bindAccountDrawerVisible.value = false
				ElMessage.success('绑定账号成功')
			} else {
				ElMessage.error('绑定账号失败')
			}
		}).catch(() => {
			
		})
	}).catch(() => {
		// 表单验证失败，不做处理
	})
}

// 解绑平台账号
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
					// 刷新产品列表
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

// 导航到详情页面
const navigateToDetail = (productId) => {
	router.push(`/media/mediaProduct/${productId}`)
}

// 表单数据
const productForm = ref({
	productName: '',
	productDesc: ''
})

// 表单验证
const rules = reactive({
	productName: [
		{ required: true, message: '请输入产品名称', trigger: 'blur' }
	]
})

// 表单引用
const formRef = ref(null)

// 提交表单
const handleSubmit = () => {
	if (!formRef.value) return

	formRef.value.validate().then(() => {

		if (currentEditId.value) {
			// 编辑现有产品
			const index = products.value.findIndex(p => p.id === currentEditId.value)
			if (index !== -1) {
				products.value[index] = {
					...products.value[index],
					productName: productForm.value.productName,
					productDesc: productForm.value.productDesc,
				}
				ElMessage.success('编辑产品成功')
				// 重置表单
				productForm.value = {
					productName: '',
					productDesc: ''
				}
				currentEditId.value = null
				drawerVisible.value = false
			}
		} else {
			// 添加新产品
			const mediaProduct = {
				productName: productForm.value.productName,
				productDesc: productForm.value.productDesc
			}
			addMediaProduct(mediaProduct).then(response => {
				if (response.code === 200) {
					// 刷新产品列表，会自动筛选当前用户的产品
					fetchProductList()
					ElMessage.success('添加自媒体产品成功')
					// 重置表单
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
		// 表单验证失败，不做处理
	})
}
</script>

<style scoped>
.media-product {
	padding: 20px;
}

.page-title {
	font-size: 18px;
	font-weight: bold;
	margin-bottom: 20px;
}

.add-button {
	margin-bottom: 20px;
}

.products-container {
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
}

.product-card {
	flex: 0 0 calc(33.333% - 16px);
	min-height: 200px;
	display: flex;
	flex-direction: column;
}

.product-card :deep(.el-card__body) {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
}

.product-name {
	font-size: 16px;
	font-weight: bold;
	margin: 0;
}

.edit-button {
	color: #409EFF;
	display: none;
}

.sync-container {
	display: flex;
	align-items: center;
	gap: 15px;
	margin-bottom: 15px;
}

.sync-time {
	font-size: 14px;
	color: #909399;
}

.sync-button {
	margin-bottom: 0;
}

.product-info {
	margin-bottom: 15px;
	font-size: 14px;
	color: #606266;
}

.time-info {
	display: flex;
	gap: 20px;
	margin-bottom: 10px;
}

.time-info p {
	margin: 0;
}

.platform-info {
	margin-bottom: 20px;
	padding-bottom: 10px;
	border-bottom: 1px solid #ebeef5;
}

.platform-info p {
	font-size: 14px;
	color: #606266;
	margin: 0;
}

.bound-platform {
	margin-top: 10px;
	padding: 10px;
	background-color: #f0f9eb;
	border: 1px solid #e1f3d8;
	border-radius: 4px;
}

.platform-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.platform-item:last-child {
	margin-bottom: 0;
}

.platform-item p {
	margin: 0;
	color: #67c23a;
}

.unbind-button {
	color: #f56c6c;
	padding: 0;
}

.product-info p {
	margin: 5px 0;
}

.card-footer {
	display: flex;
	border-top: 1px solid #ebeef5;
	padding-top: 15px;
	margin-top: auto;
}

.delete-button {
	color: #f56c6c;
}

.product-drawer {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.drawer-content {
	flex: 1;
	overflow-y: auto;
	padding: 20px 0;
}

.drawer-footer {
	display: flex;
	justify-content: center;
	gap: 10px;
	padding: 20px;
	border-top: 1px solid #ebeef5;
	margin-top: auto;
}

.no-data {
	margin-top: 40px;
	text-align: center;
}

.pagination-container {
	display: flex;
	justify-content: flex-end;
	margin-top: 20px;
	padding: 10px 0;
}
</style>
