import request from '@/utils/request'

export function getTemplateList(params) {
  return request({
    url: '/txwx-social-crm/content/templates',
    method: 'get',
    params
  })
}

export function getTemplate(id) {
  return request({
    url: `/txwx-social-crm/content/templates/${id}`,
    method: 'get'
  })
}

export function getTemplatesByPlatform(platform) {
  return request({
    url: `/txwx-social-crm/content/templates/platform/${platform}`,
    method: 'get'
  })
}

export function getDefaultTemplate() {
  return request({
    url: '/txwx-social-crm/content/templates/default',
    method: 'get'
  })
}

export function createTemplate(data) {
  return request({
    url: '/txwx-social-crm/content/templates',
    method: 'post',
    data
  })
}

export function updateTemplate(id, data) {
  return request({
    url: `/txwx-social-crm/content/templates/${id}`,
    method: 'put',
    data
  })
}

export function deleteTemplate(id) {
  return request({
    url: `/txwx-social-crm/content/templates/${id}`,
    method: 'delete'
  })
}
