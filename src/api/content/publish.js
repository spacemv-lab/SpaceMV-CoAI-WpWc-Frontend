import request from '@/utils/request'

export function listPublishJobs(params) {
  return request({
    url: '/txwx-social-crm/content/publish/jobs',
    method: 'get',
    params
  })
}

export function getPublishJob(id) {
  return request({
    url: `/txwx-social-crm/content/publish/jobs/${id}`,
    method: 'get'
  })
}

export function listPublishResults(params) {
  return request({
    url: '/txwx-social-crm/content/publish/results',
    method: 'get',
    params
  })
}

export function retryPublishJob(id) {
  return request({
    url: `/txwx-social-crm/content/publish/jobs/${id}/retry`,
    method: 'post'
  })
}

export function listPublishJobsByPost(data) {
  return request({
    url: '/txwx-social-crm/content/publish/jobs/list',
    method: 'post',
    data
  })
}

export function listPublishResultsByPost(data) {
  return request({
    url: '/txwx-social-crm/content/publish/results/list',
    method: 'post',
    data
  })
}

export function listWechatAccounts() {
  return request({
    url: '/txwx-social-crm/content/publish/wechat/accounts',
    method: 'get'
  })
}
