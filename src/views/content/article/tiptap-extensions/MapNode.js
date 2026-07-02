import { Node, mergeAttributes } from '@tiptap/core'
import { getWechatDisplayUrl } from '@/utils'

// 地图短码节点：在正文中以 {{map:token}} 形式存在
// token 为 TXWX 工程的分享 token，渲染端（问道站点）凭它免鉴权取地图
// imageUrl / wechatImageUrl 仅随 contentJson 持久化（不进 contentHtml）：
//   - imageUrl      coai 后端托管，问道端取图用
//   - wechatImageUrl mmbiz.qpic.cn，公众号用
export const MapNode = Node.create({
  name: 'map',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      token: {
        default: null,
      },
      imageUrl: {
        default: null,
      },
      wechatImageUrl: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-map-token]',
      },
      {
        tag: 'img[data-map-token]',
        getAttrs: (el) => {
          if (typeof el === 'string') return {}
          return {
            token: el.getAttribute('data-map-token'),
            imageUrl: el.getAttribute('src'),
            wechatImageUrl: el.getAttribute('data-wechat-src'),
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-map-token': node.attrs.token,
        class: 'map-node',
      }),
      `{{map:${node.attrs.token}}}`,
    ]
  },

  addNodeView() {
    return ({ node, editor }) => {
      // 有图片：渲染图片型节点（悬浮 更换/删除）
      if (node.attrs.imageUrl) {
        const wrapper = document.createElement('span')
        wrapper.className = 'map-node-view map-node-view--image'
        wrapper.contentEditable = 'false'
        wrapper.dataset.mapToken = node.attrs.token

        const label = document.createElement('span')
        label.className = 'map-node-view__label'
        label.textContent = `🗺️ 地图`

        const displayUrl = node.attrs.wechatImageUrl || node.attrs.imageUrl
        const img = document.createElement('img')
        img.className = 'map-node-view__img'
        img.referrerPolicy = 'no-referrer'
        img.src = getWechatDisplayUrl(displayUrl)
        img.alt = '地图'

        const actions = document.createElement('span')
        actions.className = 'map-node-view__actions'
        actions.contentEditable = 'false'
        const changeBtn = document.createElement('span')
        changeBtn.className = 'map-node-view__action'
        changeBtn.textContent = '更换'
        changeBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          if (editor.isEditable) {
            editor.chain().focus().deleteSelection().run()
            editor.emit('map-picker-open', node.attrs.token)
          }
        })
        const delBtn = document.createElement('span')
        delBtn.className = 'map-node-view__action map-node-view__action--danger'
        delBtn.textContent = '删除'
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          if (editor.isEditable) {
            editor.chain().focus().deleteSelection().run()
          }
        })
        actions.appendChild(changeBtn)
        actions.appendChild(delBtn)

        wrapper.appendChild(label)
        wrapper.appendChild(actions)
        wrapper.appendChild(img)

        return {
          dom: wrapper,
          destroy: () => {},
        }
      }

      // 无图片：回退为文字 chip（老数据 / mock）
      const dom = document.createElement('span')
      dom.className = 'map-node'
      dom.dataset.mapToken = node.attrs.token
      dom.textContent = `{{map:${node.attrs.token}}}`

      dom.addEventListener('dblclick', () => {
        if (editor.isEditable) {
          editor.chain().focus().deleteSelection().run()
          editor.emit('map-picker-open', node.attrs.token)
        }
      })

      return { dom }
    }
  },
})
