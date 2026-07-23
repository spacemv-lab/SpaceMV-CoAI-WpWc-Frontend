import { Node, mergeAttributes } from '@tiptap/core'

export const StyledTemplateNode = Node.create({
  name: 'styledTemplate',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      html: {
        default: '',
        parseHTML: (el) => el.outerHTML,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'section',
        priority: 80,
      },
    ]
  },

  renderHTML({ node }) {
    return ['div', { class: 'styled-template-node' }, 0]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.className = 'styled-template-node'
      if (node.attrs.html) {
        dom.innerHTML = node.attrs.html
      }
      return { dom, ignoreMutation: () => true }
    }
  },
})
