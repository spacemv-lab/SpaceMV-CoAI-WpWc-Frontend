import request from '@/utils/request'

export function checkHuman(data) {
  return request({
    url: '/auth/checkHuman',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

export function sendCode(data) {
  return request({
    url: '/auth/sendCode',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

export function phoneLogin(data) {
  return request({
    url: '/auth/phoneLogin',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}