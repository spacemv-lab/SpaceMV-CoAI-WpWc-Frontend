/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
import request from '@/utils/request'

// 获取永久素材列表
export function getPermanentMaterialsList(params) {
  // 真实接口调用
  // 分离分页参数和其他参数
  const { pageNum, pageSize, ...bodyParams } = params;
  return request({
    url: '/txwx-social-crm/material/permanentListByPage',
    method: 'post',
    params: { pageNum, pageSize }, 
    data: bodyParams.accountIds
  })
}

// 删除永久素材
export function deletePermanentMaterial(accountId, mediaId) {
  return request({
    url: `/txwx-social-crm/material/${accountId}/permanentDelete/${mediaId}`,
    method: 'delete'
  })
}

// 确认上传永久素材
export function confirmUploadPermanentMaterial(formData, params) {
  // 真实接口调用
  // 对于FormData，参数需要作为查询参数传递
  return request({
    url: '/txwx-social-crm/material/permanentAdd',
    method: 'post',
    data: formData,
    params: params,
    timeout: 120000,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

