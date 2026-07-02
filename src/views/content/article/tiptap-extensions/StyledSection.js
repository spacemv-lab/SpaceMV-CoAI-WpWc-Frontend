import { Node, mergeAttributes } from '@tiptap/core'

export const StyledSection = Node.create({
  name: 'styledSection',

  group: 'block',

  content: 'block*',

  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute('style'),
      },
      'data-tools': {
        default: null,
        parseHTML: (el) => el.getAttribute('data-tools'),
      },
      'data-id': {
        default: null,
        parseHTML: (el) => el.getAttribute('data-id'),
      },
      'data-role': {
        default: null,
        parseHTML: (el) => el.getAttribute('data-role'),
      },
      'data-pm-slice': {
        default: null,
        parseHTML: (el) => el.getAttribute('data-pm-slice'),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'section' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['section', mergeAttributes(HTMLAttributes), 0]
  },
})
