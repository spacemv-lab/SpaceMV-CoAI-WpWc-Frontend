import request from '@/utils/request'

export function getIndicatorList(params) {
  return request({
    url: '/txwx-social-crm/content/site/wendao/charts/indicators',
    method: 'get',
    params
  })
}

export function getIndicatorDetail(slug) {
  return request({
    url: `/txwx-social-crm/content/site/wendao/charts/indicator/${slug}`,
    method: 'get'
  })
}

export function getIndicatorSeries(slug, limit = 500) {
  return request({
    url: `/txwx-social-crm/content/site/wendao/charts/indicator/${slug}/series`,
    method: 'get',
    params: { limit }
  })
}

export function getIndicatorFilterOptions() {
  return request({
    url: '/txwx-social-crm/content/site/wendao/charts/filter-options',
    method: 'get'
  })
}
