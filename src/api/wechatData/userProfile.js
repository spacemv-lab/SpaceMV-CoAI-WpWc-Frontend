/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request';

// 下载数据模板
export function downloadTemplate() {
  return request({
    url: '/txwx-social-dashboard/sexData/downloadTemplate',
    method: 'get',
    // params: params,
    responseType: 'blob'
  })
}

// 导入Excel数据
export function importExcel(formData) {
  return request({
    url: '/txwx-social-dashboard/sexData/importExcel',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取性别分布列表
export function getGenderDataList(params) {
  return request({
    url: '/txwx-social-dashboard/sexData/list',
    method: 'post',
    params: params
  })
}

// 导出性别分布数据
export function exportGenderDataExcel(params) {
  return request({
    url: '/txwx-social-dashboard/sexData/exportExcel',
    method: 'post',
    params: params,
    responseType: 'blob'
  })
}

// 下载年龄数据模板
export function downloadAgeTemplate() {
  return request({
    url: '/txwx-social-dashboard/ageData/downloadTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

// 导入年龄数据
export function importAgeData(formData) {
  return request({
    url: '/txwx-social-dashboard/ageData/importExcel',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取年龄分布列表
export function getAgeDataList(params) {
  return request({
    url: '/txwx-social-dashboard/ageData/list',
    method: 'post',
    params: params
  })
}

// 导出年龄分布数据
export function exportAgeDataExcel(params) {
  return request({
    url: '/txwx-social-dashboard/ageData/exportExcel',
    method: 'post',
    params: params,
    responseType: 'blob'
  })
}

// 地域数据模板下载
export function downloadRegionTemplate() {
  return request({
    url: '/txwx-social-dashboard/terrainData/downloadTemplate', // 下载模板的API接口地址
    method: 'get', // 请求方法为GET
    responseType: 'blob' // 设置响应类型为blob，用于处理文件下载
  })
}

// 导入地域数据
export function importRegionData(formData) {
  return request({
    url: '/txwx-social-dashboard/terrainData/importExcel',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取地域分布列表
export function getRegionDataList(params, regionParams) {
  return request({
    url: '/txwx-social-dashboard/terrainData/list',
    method: 'post',
    params: {...params, ...regionParams},
    // data: regionParams,
  })
}

// 导出地域分布数据
export function exportRegionDataExcel(params) {
  return request({
    url: '/txwx-social-dashboard/terrainData/exportExcel',
    method: 'post',
    params: params,
    responseType: 'blob'
  })
}

// 下载渠道构成数据模板
export function downloadChannelTemplate() {
  return request({
    url: '/txwx-social-dashboard/channelData/downloadTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

// 导入渠道数据
export function importChannelData(formData) {
  return request({
    url: '/txwx-social-dashboard/channelData/importExcel',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取渠道构成列表
export function getChannelDataList(params) {
  return request({
    url: '/txwx-social-dashboard/channelData/list',
    method: 'post',
    params: params
  })
}

// 导出渠道构成数据
export function exportChannelDataExcel(params) {
  return request({
    url: '/txwx-social-dashboard/channelData/exportExcel',
    method: 'post',
    params: params,
    responseType: 'blob'
  })
}
