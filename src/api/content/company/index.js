/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
import request from '@/utils/request'

// 保存公司信息设置
export function saveCompanyInfo(data) {
  return request({
    // baseURL: '/crm-website',
    url: '/crm-website/companyDetail/save',
    method: 'post',
    data: data
  })
}

// 加载公司信息详情
export function getCompanyDetail() {
  return request({
    url: '/crm-website/companyDetail/load',
    method: 'get'
  })
}

// 发布公司信息设置
export function publishCompanyInfo() {
  return request({
    url: '/crm-website/companyDetail/publish',
    method: 'post'
  })
}
