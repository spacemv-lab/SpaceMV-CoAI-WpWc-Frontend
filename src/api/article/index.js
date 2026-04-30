/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import request from '@/utils/request';

// 获取已发布文章列表
export function getPublishedList(params) {
  // 真实接口调用 - 分页查询已发布文章列表
  return request({
    url: '/txwx-social-crm/article/publishedList',
    method: 'post',
    params: {
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    },
    data: params.accountIds // 传递分页参数和已发布状态
  })
}

// 获取未发布文章列表
export function getDraftList(params) {
  // 真实接口调用 - 分页查询草稿列表
  return request({
    url: '/txwx-social-crm/article/draftList',
    method: 'post',
    data: params,
  })
}

// 提交发布任务接口
export function publishArticle(params) {
  // 真实接口调用 - 发布草稿
  return request({
    url: `/txwx-social-crm/article/publishDraft?id=${params.id}`,
    method: 'post',
    data: {
      id: params.id,
    },
  });
}

// 删除已发布文章接口
export function deletePublishedArticle(params) {
  // 真实接口调用 - 删除已发布文章
  return request({
    url: `/txwx-social-crm/article/deletePublishedArticle/${params.id}`,
    method: 'delete'
  })
}

// 删除未发布文章接口
export function deleteDraftArticle(params) {
  // 真实接口调用 - 删除草稿
  return request({
    url: `/txwx-social-crm/article/deleteDraft/${params.id}`,
    method: 'delete'
  })
}

// 新增草稿接口
export function addDraft(data) {
  // 真实接口调用
  return request({
    url: '/txwx-social-crm/article/addDraft',
    method: 'post',
    data: data,
  });
}

// 更新草稿接口
export function updateDraft(data) {
  // 真实接口调用
  return request({
    url: '/txwx-social-crm/article/updateDraft',
    method: 'post',
    data: data,
  });
}

// // 提交审核接口
export function submitAudit(id) {
  // 真实接口调用
  return request({
    url: `/txwx-social-crm/article/submitForReview/${id}`,
    method: 'post'
  })
}

// 审核草稿接口
export function reviewDraft(data) {
  // 真实接口调用
  return request({
    url: `/txwx-social-crm/article/reviewDraft?id=${data.id}&reviewResult=${data.reviewResult}`,
    method: 'post',
    data: data,
  });
}

// 获取草稿详情接口
export function getDraftDetail(id) {
  // 真实接口调用 - 获取草稿详情
  return request({
    url: `/txwx-social-crm/article/draftDetail/${id}`,
    method: 'get'
  })
}

// 发布状态查询接口
export function getPublishStatus(id) {
  // 真实接口调用 - 查询发布状态
  return request({
    url: `/txwx-social-crm/article/publishStatus/${id}`,
    method: 'get'
  })
}
