/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request';

// 下载数据模板
export function downloadTemplate() {
  return request({
    url: '/txwx-social-dashboard/userData/downloadTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

// 导入Excel数据
export function importExcel(formData) {
  return request({
    url: '/txwx-social-dashboard/userData/importExcel',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取用户数据列表
export function getUserDataList(data, params) {
  return request({
    url: '/txwx-social-dashboard/userData/list',
    method: 'post',
    data: data,
    params: params,
  });
}

// 导出用户数据
export function exportUserDataExcel(data) {
  return request({
    url: '/txwx-social-dashboard/userData/exportExcel',
    method: 'post',
    data: data,
    responseType: 'blob',
  });
}
