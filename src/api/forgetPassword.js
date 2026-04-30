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
    url: '/txwx-social-crm/user/checkunique',
    headers: {
      isToken: false
    },
    method: 'get',
    params: params,
  })
}

export function resetPassword(data) {
  return request({
    url: '/txwx-social-crm/user/resetPwd',
    headers: {
      isToken: false
    },
    method: 'put',
    params: data
  })
}