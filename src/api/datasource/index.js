import request from '@/utils/request'

export function listDataSource(params) {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/list',
    method: 'get',
    params
  })
}

export function getDataSource(id) {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/' + id,
    method: 'get'
  })
}

export function addDataSource(data) {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource',
    method: 'post',
    data
  })
}

export function updateDataSource(id, data) {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/' + id,
    method: 'put',
    data
  })
}

export function delDataSource(id) {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/' + id,
    method: 'delete'
  })
}

export function syncDataSource(id) {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/' + id + '/sync',
    method: 'post'
  })
}

export function importDataSourceCsv(id, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/' + id + '/import',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function listSyncLogs(params) {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/sync-logs',
    method: 'get',
    params
  })
}

export function syncCategory(categoryId) {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/sync-category/' + categoryId,
    method: 'post'
  })
}

export function syncAllCategories() {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/sync-all-categories',
    method: 'post'
  })
}

export function syncYahooCategory(categorySlug) {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/yahoo/sync-category/' + categorySlug,
    method: 'post'
  })
}

export function syncAllYahooCategories() {
  return request({
    url: '/txwx-social-crm/content/site/wendao/datasource/yahoo/sync-all-categories',
    method: 'post'
  })
}
