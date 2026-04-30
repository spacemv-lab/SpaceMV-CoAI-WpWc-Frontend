/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request';

// 获取自媒体产品列表
export function getMediaProductList(params) {
  const { pageNum, pageSize, queryConfig } = params;
  return request({
    url: '/txwx-social-crm/product/management/list',
    method: 'post',
    params: { pageNum, pageSize },
    data: {queryConfig},
  })
}

// 删除自媒体产品
export function deleteMediaProduct(ids) {
  return request({
    url: `/txwx-social-crm/product/management/${ids}`,
    method: 'delete',
  })
}

// 解绑平台账号(实际是批量删除账号接口)
export function unbindMediaPlatform(id) {
  return request({
    url: `/txwx-social-crm/account/management/${id}`,
    method: 'delete',
  })
}

// 新增权限
export function addUserPermission(param) {
  return request({
    url: '/txwx-social-crm/userPermission',
    method: 'post',
    data: param,
  })
}

// 添加自媒体产品
export function addMediaProduct(mediaProduct) {
  return request({
    url: '/txwx-social-crm/product/management',
    method: 'post',
    data: { productDTO: mediaProduct },
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 绑定平台账号
export function bindMediaPlatform(mediaPlatform) {
  return request({
    url: '/txwx-social-crm/account/management',
    method: 'post',
    data: {accountDTO: mediaPlatform},
  })
}

// 数据同步
export function syncMediaPlatformData(accountId,params) {
  return request({
    url: `/txwx-social-dashboard/dataCapture/dataSync/${accountId}`,
    method: 'get',
    params: params,
    timeout: 60000 // 60秒超时，适用于数据同步
  })
}

// 获取自媒体产品详情
export function getMediaProductDetail(id, queryConfig) {
  return request({
    url: `/txwx-social-crm/product/management/${id}`,
    method: 'post',
    data: queryConfig,
  })
}

// 查询渠道列表
export function getChannelList(productId) {
  return request({
    url: '/txwx-social-crm/channel/management/list',
    method: 'post',
    data: productId,
  })
}
