/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
import request from '@/utils/request'

// 获取图文消息图片列表（分页）
export function getImageTextList(params) {
  // 分离分页参数和其他参数
  const { pageNum, pageSize, ...bodyParams } = params;
  return request({
    url: '/txwx-social-crm/material/gInfoImgListByPage',
    method: 'post',
    params: { pageNum, pageSize }, 
    data: bodyParams.accountIds
  })
}

// 确认上传图文消息图片
export function confirmUploadImageText(formData, params) {
  // 真实接口调用
  // 对于FormData，参数需要作为查询参数传递
  return request({
    url: '/txwx-social-crm/material/gInfoImgAdd',
    method: 'post',
    data: formData,
    params: params,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除图文消息图片
export function deleteImageText(mediaId) {
  return request({
    url: `/txwx-social-crm/material/gInfoImgDelete/${mediaId}`,
    method: 'delete'
  })
}