import request from '@/utils/request'
export function register(data) {
  return request({
    url: '/auth/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

export function getCodeImg() {
  return request({
    url: '/code',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}

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

export function checkUnique(params) {
  return request({
    url: '/txwx-social-crm/user/checkunique',
    headers: {
      isToken: false
    },
    method: 'get',
    params: params,
  })
}