/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request'
export function register(data) {
  return request({
    // url: '/auth/register',
    url: '/txwx-iam/auth/v1/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

export function getCodeImg() {
  return request({
    // url: '/code',
    url: '/txwx-iam/auth/v1/code',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}

export function checkHuman(data) {
  return request({
    // url: '/auth/checkHuman',
    url: '/txwx-iam/auth/v1/checkHuman',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

export function sendSmsCode(data) {
  return request({
    url: '/txwx-social-crm/verify/sms/send',
    headers: {
      isToken: false
    },
    method: 'post',
    params: data
  })
}

export function sendEmailCode(data) {
  return request({
    url: '/txwx-social-crm/verify/email/send',
    headers: {
      isToken: false
    },
    method: 'post',
    params: data
  })
}

export function sendCode(data) {
  return request({
    url: '/txwx-iam/auth/v1/verify-code/send',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

export function checkUnique(params) {
  return request({
    url: '/txwx-iam/auth/v1/checkunique',
    headers: {
      isToken: false
    },
    method: 'get',
    params: params,
  })
}