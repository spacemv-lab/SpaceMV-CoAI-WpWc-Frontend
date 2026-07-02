import { Extension } from '@tiptap/core'

export const LetterSpacing = Extension.create({
  name: 'letterSpacing',
  addOptions() { return { types: ['paragraph', 'heading'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        letterSpacing: { default: null, parseHTML: el => el.style.letterSpacing || null, renderHTML: attrs => attrs.letterSpacing ? { style: `letter-spacing:${attrs.letterSpacing}` } : {} }
      }
    }]
  },
  addCommands() {
    return {
      setLetterSpacing: v => ({ chain }) => chain().updateAttributes('paragraph', { letterSpacing: v }).updateAttributes('heading', { letterSpacing: v }).run(),
      unsetLetterSpacing: () => ({ chain }) => chain().updateAttributes('paragraph', { letterSpacing: null }).updateAttributes('heading', { letterSpacing: null }).run()
    }
  }
})
