/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
import request from '@/utils/request'

// 公共上传图片接口
export function uploadImage(data) {
  return request({
    url: '/crm-website/upload/image',
    method: 'post',
    data: data
  })
}