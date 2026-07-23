import request from '@/utils/request'

export function listArticles(params) {
  return request({
    url: '/txwx-social-crm/content/articles',
    method: 'get',
    params
  })
}

export function getArticle(id) {
  return request({
    url: `/txwx-social-crm/content/articles/${id}`,
    method: 'get'
  })
}

export function addArticle(data) {
  return request({
    url: '/txwx-social-crm/content/articles',
    method: 'post',
    data
  })
}

export const createArticle = addArticle

export function updateArticle(id, data) {
  return request({
    url: `/txwx-social-crm/content/articles/${id}`,
    method: 'put',
    data
  })
}

export function deleteArticle(id) {
  return request({
    url: `/txwx-social-crm/content/articles/${id}`,
    method: 'delete'
  })
}

export function publishArticleToSite(id) {
  return request({
    url: `/txwx-social-crm/content/articles/${id}/publish/site`,
    method: 'post'
  })
}

export function publishToMultiPlatform(id, targets) {
  return request({
    url: `/txwx-social-crm/content/articles/${id}/publish/multi`,
    method: 'post',
    data: targets,
    timeout: 120000
  })
}

export function retryArticlePlatform(id, target) {
  return request({
    url: `/txwx-social-crm/content/articles/${id}/retry`,
    method: 'post',
    data: target
  })
}

export function listPublishRecords(articleId) {
  return request({
    url: `/txwx-social-crm/content/articles/${articleId}/publish-records`,
    method: 'get'
  })
}

export function getPublishRecordByPlatform(articleId, platform) {
  return request({
    url: `/txwx-social-crm/content/articles/${articleId}/publish-records/${platform}`,
    method: 'get'
  })
}

export function previewArticle(articleId, target) {
  return request({
    url: `/txwx-social-crm/content/articles/${articleId}/preview`,
    method: 'post',
    data: target
  })
}

export function saveDraftToWeChat(id, target) {
  return request({
    url: `/txwx-social-crm/content/articles/${id}/draft/wechat`,
    method: 'post',
    data: target
  })
}

export function listArticlePublishResults(articleId) {
  return request({
    url: `/txwx-social-crm/content/articles/${articleId}/publish-results`,
    method: 'get'
  })
}

export function listArticlePublishJobs(articleId) {
  return request({
    url: `/txwx-social-crm/content/articles/${articleId}/publish-jobs`,
    method: 'get'
  })
}

export function listArticlesByPost(data) {
  return request({
    url: '/txwx-social-crm/content/articles/list',
    method: 'post',
    data
  })
}
