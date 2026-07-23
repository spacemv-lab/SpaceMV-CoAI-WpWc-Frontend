/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
import request from '@/utils/request'

// 保存顶部按钮配置
export function saveTopButtons(data) {
  return request({
    url: '/crm-website/buttonConfig/save/001',
    method: 'post',
    data: data
  })
}

// 发布顶部按钮配置
export function publishTopButtons() {
  return request({
    url: '/crm-website/buttonConfig/publish/001',
    method: 'post'
  })
}

// 获取顶部按钮配置
export function getTopButtons() {
  return request({
    url: '/crm-website/buttonConfig/load/001',
    method: 'get'
  })
}

// 获取已保存未发布的按钮
export function getPreviewButtons() {
  return request({
    url: '/crm-website/buttonConfig/preview/001',
    method: 'get'
  })
}

// 获取已发布的按钮
export function getDisplayButtons() {
  return request({
    url: '/crm-website/buttonConfig/display/001',
    method: 'get'
  })
}

// 上传图片
export function uploadImage(data) {
  return request({
    url: '/crm-website/upload/image',
    method: 'post',
    data: data
  })
}