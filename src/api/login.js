/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request';

// 登录方法
export function login(username, password, code, uuid) {
  return request({
    url: '/auth/login',
    headers: {
      isToken: false,
      repeatSubmit: false,
    },
    method: 'post',
    data: { username, password, code, uuid },
  });
}

// export function login(data) {
//   return request({
//     url: '/auth/v1/login',
//     headers: {
//       isToken: false,
//       repeatSubmit: false
//     },
//     method: 'post',
//     data: data
//   })
// }

// 注册方法
export function register(data) {
  return request({
    url: '/auth/register',
    headers: {
      isToken: false,
    },
    method: 'post',
    data: data,
  });
}

// 刷新方法
export function refreshToken() {
  return request({
    url: '/auth/refresh',
    method: 'post',
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/system/user/getInfo',
    method: 'get',
  });
}

// 退出方法
export function logout() {
  return request({
    // url: '/auth/logout',
    url: '/txwx-iam/auth/v1/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    // url: '/code',
    url: '/txwx-iam/auth/v1/code',
    headers: {
      isToken: false,
    },
    method: 'get',
    timeout: 20000,
  });
}
