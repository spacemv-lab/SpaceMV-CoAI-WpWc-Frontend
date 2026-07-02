import { Extension } from '@tiptap/core'

export const Indent = Extension.create({
  name: 'indent',
  addOptions() { return { types: ['paragraph', 'heading'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        indent: { default: null, parseHTML: el => el.style.paddingLeft || null, renderHTML: attrs => attrs.indent ? { style: `padding-left:${attrs.indent}` } : {} }
      }
    }]
  },
  addCommands() {
    return {
      setIndent: v => ({ chain }) => chain().updateAttributes('paragraph', { indent: v }).updateAttributes('heading', { indent: v }).run(),
      unsetIndent: () => ({ chain }) => chain().updateAttributes('paragraph', { indent: null }).updateAttributes('heading', { indent: null }).run()
    }
  }
})
