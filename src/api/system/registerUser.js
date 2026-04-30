import request from '@/utils/request'

export function getRegisterUserList(data, params) {
  return request({
    url: '/txwx-social-crm/admin/register/list',
    method: 'post',
    data: data,
    params: params
  })
}

export function updateRegisterUserStatus(data) {
  return request({
    url: '/txwx-social-crm/admin/register/status',
    method: 'put',
    data: data
  })
}

export function getCancelledUserList(data, params) {
  return request({
    url: '/txwx-social-crm/admin/logout/list',
    method: 'post',
    data: data,
    params: params
  })
}


