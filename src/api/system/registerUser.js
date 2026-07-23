/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request'

export function getRegisterUserList(data, params) {
  return request({
    url: '/txwx-iam/admin/register/list',
    method: 'post',
    data: data,
    params: params
  })
}

export function updateRegisterUserStatus(data) {
  return request({
    url: '/txwx-iam/admin/register/status',
    method: 'put',
    data: data
  })
}

export function getCancelledUserList(data, params) {
  return request({
    url: '/txwx-iam/admin/logout/list',
    method: 'post',
    data: data,
    params: params
  })
}


