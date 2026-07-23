import { Extension } from '@tiptap/core'

export const RowSpacing = Extension.create({
  name: 'rowSpacing',
  addOptions() { return { types: ['paragraph', 'heading'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        marginTop: { default: null, parseHTML: el => el.style.marginTop || null, renderHTML: attrs => attrs.marginTop ? { style: `margin-top:${attrs.marginTop}` } : {} },
        marginBottom: { default: null, parseHTML: el => el.style.marginBottom || null, renderHTML: attrs => attrs.marginBottom ? { style: `margin-bottom:${attrs.marginBottom}` } : {} }
      }
    }]
  },
  addCommands() {
    return {
      setMarginTop: v => ({ chain }) => chain().updateAttributes('paragraph', { marginTop: v }).updateAttributes('heading', { marginTop: v }).run(),
      setMarginBottom: v => ({ chain }) => chain().updateAttributes('paragraph', { marginBottom: v }).updateAttributes('heading', { marginBottom: v }).run(),
      unsetMarginTop: () => ({ chain }) => chain().updateAttributes('paragraph', { marginTop: null }).updateAttributes('heading', { marginTop: null }).run(),
      unsetMarginBottom: () => ({ chain }) => chain().updateAttributes('paragraph', { marginBottom: null }).updateAttributes('heading', { marginBottom: null }).run()
    }
  }
})
