import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { mergeAttributes } from '@tiptap/core'

export const HorizontalRuleWithStyle = HorizontalRule.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: el => el.getAttribute('style'),
        renderHTML: attrs => attrs.style ? { style: attrs.style } : {},
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },
})
