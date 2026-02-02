/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/

import request from '@/utils/request'

// 保存首页配置
export function saveMainPage(data) {
  return request({
    url: '/crm-website/homepageConfig/save',
    method: 'post',
    data: data
  })
}

// 发布首页配置
export function publishMainPage() {
  return request({
    url: '/crm-website/homepageConfig/publish',
    method: 'post'
  })
}

// 获取首页配置
export function getMainPage() {
  return request({
    url: '/crm-website/homepageConfig/load',
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
