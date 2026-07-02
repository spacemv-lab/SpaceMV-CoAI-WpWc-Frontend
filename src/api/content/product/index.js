/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
import request from '@/utils/request'

// 保存产品设置
export const saveProduct = (data) => request({
  url: '/crm-website/productConfig/save',
  method: 'post',
  data
})

// 发布产品
export const publishProduct = () => request({
  url: '/crm-website/productConfig/publish',
  method: 'post'
})

// 获取产品设置
export const getProduct = () => request({
  url: '/crm-website/productConfig/load',
  method: 'get'
})

