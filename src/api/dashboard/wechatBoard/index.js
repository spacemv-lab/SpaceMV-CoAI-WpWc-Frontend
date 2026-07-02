/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
import request from '@/utils/request'

// 获取用户总数数据（总用户数、总阅读人数、总分享人数）
export function getUserTotalData(params) {
  // 真实的request调用
  return request({
    url: '/txwx-social-dashboard/dataBoard/userTotal',
    method: 'get',
    params: params
  })
}

// 获取阅读流量趋势图数据
export function getReadTrendData(params) {
  // 真实的request调用
  return request({
    url: '/txwx-social-dashboard/dataBoard/readFlowTrend',
    method: 'get',
    params: params
  })
}

// 获取分享流量趋势图数据
export function getShareTrendData(params) {
  // 真实的request调用（与getReadTrendData使用同一接口）
  return request({
    url: '/txwx-social-dashboard/dataBoard/readFlowTrend',
    method: 'get',
    params: params
  })
}

// 获取阅读人数流量来源占比数据
export function getReadSourceData(params) {
  // 真实的request调用（与getReadTrendData使用同一接口）
  return request({
    url: '/txwx-social-dashboard/dataBoard/readFlowTrend',
    method: 'get',
    params: params
  })
}

// 获取新增关注人数趋势图数据
export function getNewFollowData(params) {
  
  return request({
    url: '/txwx-social-dashboard/dataBoard/netUserTrend',
    method: 'get',
    params: params
  })
}

// 获取累计关注人数趋势图数据
export function getTotalFollowData(params) {

  return request({
    url: '/txwx-social-dashboard/dataBoard/accumulatedUserTrend',
    method: 'get',
    params: params
  })
  
}

// 获取阅读后关注人数排行Top10文章
export function getFollowRankingData(params) {
  return request({
    url: '/txwx-social-dashboard/dataBoard/subscribeUserAfterRead',
    method: 'get',
    params: params
  })
}

// 获取最佳阅读人数和最佳分享人数
export function getBestReadersAndSharersData(params) {
  return request({
    url: '/txwx-social-dashboard/dataBoard/optimumReaderShareNum',
    method: 'get',
    params: params
  })
}