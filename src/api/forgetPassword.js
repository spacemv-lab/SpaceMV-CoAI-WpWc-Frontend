/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request'

export function verifyCode(data) {
  return request({
    url: '/txwx-social-crm/verify/code/check',
    headers: {
      isToken: false
    },
    method: 'post',
    params: data
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

// export function resetPassword(data) {
//   return request({
//     url: '/txwx-social-crm/user/resetPwd',
//     headers: {
//       isToken: false
//     },
//     method: 'put',
//     params: data
//   })
// }

export function resetPassword(data) {
  return request({
    url: '/txwx-iam/auth/v1/password/forget/reset',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}