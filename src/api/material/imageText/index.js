/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
import request from '@/utils/request'

// 获取图文消息图片列表（分页）
export function getImageTextList(params) {
  return request({
    url: '/txwx-webchatcrm/material/gInfoImgListByPage',
    method: 'get',
    params: params
  })
}

// 确认上传图文消息图片
export function confirmUploadImageText(data) {
  return request({
    url: '/txwx-webchatcrm/material/gInfoImgAdd',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除图文消息图片
export function deleteImageText(mediaId) {
  return request({
    url: `txwx-webchatcrm/material/gInfoImgDelete/${mediaId}`,
    method: 'delete'
  })
}