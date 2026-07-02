/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
import request from '@/utils/request'

// 下载数据模板
export function downloadTemplate() {
  return request({
    url: '/txwx-social-dashboard/contentData/downloadTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

// 导入Excel数据
export function importExcel(formData) {
  return request({
    url: '/txwx-social-dashboard/contentData/importExcel',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取内容数据列表
export function getContentDataList(data, params) {
  return request({
    url: '/txwx-social-dashboard/contentData/list',
    method: 'post',
    data: data,
    params: params
  })
}

// 导出内容数据
export function exportContentDataExcel(data) {
  return request({
    url: '/txwx-social-dashboard/contentData/exportExcel',
    method: 'post',
    data: data,
    responseType: 'blob'
  })
}