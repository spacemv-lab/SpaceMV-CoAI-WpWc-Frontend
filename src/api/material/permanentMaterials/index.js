/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
import request from '@/utils/request'

// 获取永久素材列表
export function getPermanentMaterialsList(params) {
  // 真实接口调用
  return request({
    url: '/txwx-webchatcrm/material/permanentListByPage',
    method: 'get',
    params: params
  })
}

// 删除永久素材
export function deletePermanentMaterial(mediaId) {
  // 真实接口调用
  return request({
    url: `txwx-webchatcrm/material/permanentDelete/${mediaId}`,
    method: 'delete'
  })
}

// 确认上传永久素材
export function confirmUploadPermanentMaterial(data) {
  // 真实接口调用
  return request({
    url: '/txwx-webchatcrm/material/permanentAdd',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

