/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request'

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

// export function sendCode(data) {
//   return request({
//     url: '/auth/sendCode',
//     headers: {
//       isToken: false
//     },
//     method: 'post',
//     data: data
//   })
// }

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



export function newLogin(data) {
  return request({
    url: '/txwx-iam/auth/v1/login',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}