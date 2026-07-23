import { Extension } from '@tiptap/core'

export const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() { return { types: ['paragraph', 'heading'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        lineHeight: { default: null, parseHTML: el => el.style.lineHeight || null, renderHTML: attrs => attrs.lineHeight ? { style: `line-height:${attrs.lineHeight}` } : {} }
      }
    }]
  },
  addCommands() {
    return {
      setLineHeight: v => ({ chain }) => chain().updateAttributes('paragraph', { lineHeight: v }).updateAttributes('heading', { lineHeight: v }).run(),
      unsetLineHeight: () => ({ chain }) => chain().updateAttributes('paragraph', { lineHeight: null }).updateAttributes('heading', { lineHeight: null }).run()
    }
  }
})
