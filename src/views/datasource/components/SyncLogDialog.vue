<template>
  <div>
    <el-table v-loading="loading" :data="logList" stripe>
      <el-table-column label="开始时间" prop="startedAt" width="170" align="center" />
      <el-table-column label="结束时间" prop="finishedAt" width="170" align="center" />
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
            {{ row.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="触发方式" prop="triggerType" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.triggerType === 'scheduled' ? 'info' : 'primary'" size="small">
            {{ row.triggerType === 'scheduled' ? '定时' : '手动' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="采集条数" prop="dataPoints" width="80" align="center" />
      <el-table-column label="操作人" prop="createdBy" width="100" align="center" />
      <el-table-column label="错误信息" prop="errorMsg" min-width="200">
        <template #default="{ row }">
          <span style="color: var(--el-color-danger)">{{ row.errorMsg || '-' }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { listSyncLogs } from '@/api/datasource'

const props = defineProps({ sourceId: { type: String, default: '' } })

const logList = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = reactive({ pageNum: 1, pageSize: 20, sourceId: '' })

watch(() => props.sourceId, (val) => {
  if (val) {
    queryParams.sourceId = val
    queryParams.pageNum = 1
    getList()
  }
}, { immediate: true })

function getList() {
  loading.value = true
  listSyncLogs({ ...queryParams }).then(res => {
    logList.value = res.rows || []
    total.value = res.total || 0
    loading.value = false
  }).catch(() => { loading.value = false })
}
</script>
