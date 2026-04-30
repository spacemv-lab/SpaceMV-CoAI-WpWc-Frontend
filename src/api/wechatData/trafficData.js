/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request';

// 获取流量数据列表
export function getTrafficDataList(data, params) {
  return request({
    url: '/txwx-social-dashboard/flowData/list',
    method: 'post',
    data: data,
    params: params,
  });
}

// 下载数据模板
export function downloadTemplate() {
  return request({
    url: '/txwx-social-dashboard/flowData/downloadTemplate',
    method: 'get',
    // params: params,
    responseType: 'blob'
  })
}

// 导入Excel数据
export function importExcel(formData) {
  return request({
    url: '/txwx-social-dashboard/flowData/importExcel',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取流量来源分析列表
export function getFlowSourceList(data) {
  return request({
    url: '/txwx-social-dashboard/flowSource/list',
    method: 'post',
    params: data
  })
}

// 导出流量汇总数据
export function exportFlowDataExcel(data) {
  return request({
    url: '/txwx-social-dashboard/flowData/exportExcel',
    method: 'post',
    data: data,
    responseType: 'blob',
  });
}

// 导出流量来源分析
export function exportFlowSourceExcel(data) {
  return request({
    url: '/txwx-social-dashboard/flowSource/exportExcel',
    method: 'post',
    params: data,
    responseType: 'blob'
  })
}
