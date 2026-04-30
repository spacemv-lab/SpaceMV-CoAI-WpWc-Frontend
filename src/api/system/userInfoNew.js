import request from '@/utils/request'

export function getBackupContact() {
  return request({
    url: '/txwx-social-crm/user/profile/backup/contact',
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

export function applyLogout(data) {
  return request({
    url: '/txwx-social-crm/user/logout/apply',
    method: 'post',
    data: data
  })
}