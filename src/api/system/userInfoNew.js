/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request'

export function getBackupContact() {
  return request({
    url: '/txwx-iam/auth/v1/user/channel/backup',
    method: 'get'
  })
}

export function bindBackupContact(data) {
  return request({
    url: '/txwx-social-crm/user/profile/bind/backup',
    method: 'put',
    data: data
  })
}
// 提交注销申请——老版本
export function applyLogout(data) {
  return request({
    url: '/txwx-social-crm/user/logout/apply',
    method: 'post',
    data: data
  })
}

// 提交注销申请
export function deactivate(data) {
  return request({
    url: '/txwx-iam/auth/v1/user/deactivate',
    method: 'post',
    data: data
  })
}

export function getDeactivateStatus() {
  return request({
    url: '/txwx-iam/auth/v1/user/deactivate/status',
    method: 'get'
  })
}

export function cancelDeactivate() {
  return request({
    url: '/txwx-iam/auth/v1/user/deactivate/cancel',
    method: 'post'
  })
}

export function bindChannel(data) {
  return request({
    url: '/txwx-iam/auth/v1/user/channel',
    method: 'post',
    data: data
  })
}

export function unbindChannel(data) {
  return request({
    url: '/txwx-iam/auth/v1/user/channel',
    method: 'delete',
    data: data
  })
}

export function sendCode(data) {
  return request({
    url: '/txwx-iam/auth/v1/send-verify-code',
    method: 'post',
    data: data
  })
}


export function getCurrentUser() {
  return request({
    url: '/txwx-iam/auth/v1/user/me',
    method: 'get'
  })
}

      