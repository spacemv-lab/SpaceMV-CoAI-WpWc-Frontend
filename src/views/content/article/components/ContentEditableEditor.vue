<template>
  <div ref="editorWrapperRef" class="wx-editor">
    <div
      ref="editorRef"
      class="wx-editor__body"
      contenteditable="true"
      :class="{ 'is-empty': isEmpty }"
      @input="onInput"
      @copy="onCopy"
      @cut="onCut"
      @paste="onPaste"
      @drop="onDrop"
      @keydown="onKeydown"
      @keyup="applyFormatPainterIfReady"
      @mouseup="applyFormatPainterIfReady"
      @click="onEditorClick"
      @focus="onFocus"
      @blur="onBlur"
    ></div>
    <div v-if="selectedImage" class="wx-image-toolbar" :style="imageToolbarStyle" @mousedown.prevent>
      <button class="wx-image-toolbar__btn" :class="{ active: imageAlign === 'left' }" @click="setImageAlign('left')" title="左对齐">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="10" x2="15" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="15" y2="18"/></svg>
      </button>
      <button class="wx-image-toolbar__btn" :class="{ active: imageAlign === 'center' }" @click="setImageAlign('center')" title="居中">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="10" x2="18" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="6" y1="18" x2="18" y2="18"/></svg>
      </button>
      <button class="wx-image-toolbar__btn" :class="{ active: imageAlign === 'right' }" @click="setImageAlign('right')" title="右对齐">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="9" y1="18" x2="21" y2="18"/></svg>
      </button>
      <span class="wx-image-toolbar__divider"></span>
      <button class="wx-image-toolbar__btn" :class="{ active: imageWidthMode === 'auto' }" @click="setImageAutoFit" title="自适应">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        自适应
      </button>
      <span class="wx-image-toolbar__divider"></span>
      <button class="wx-image-toolbar__btn wx-image-toolbar__btn--danger" @click="deleteSelectedImage" title="删除">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import request from '@/utils/request'

const props = defineProps({
  contentHtml: { type: String, default: '' },
  wechatAccountIds: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'update:contentHtml',
  'wordCountChange',
  'selectionChange',
  'formatPainterDone',
  'focus',
  'blur',
])

const editorRef = ref(null)
const isEmpty = ref(true)
const internalContent = ref('')
const historyStack = ref([])
const redoStack = ref([])

const HISTORY_LIMIT = 80
let historyTimer = null
let isRestoringHistory = false
let lastSelectionRange = null

const wxImageOriginPattern = /https?:\/\/mmbiz\.qpic\.cn/g
const wxImageProxyPattern = /\/wx-mbiz/g

const toWechatDisplayHtml = (html) => {
  if (!html || !import.meta.env.DEV) return html
  return html.replace(wxImageOriginPattern, '/wx-mbiz')
}

const fromWechatDisplayHtml = (html) => {
  if (!html || !import.meta.env.DEV) return html
  return html.replace(wxImageProxyPattern, 'https://mmbiz.qpic.cn')
}

const saveCurrentSelection = () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || !editorRef.value) return false
  const range = sel.getRangeAt(0)
  if (!editorRef.value.contains(range.commonAncestorContainer)) return false
  lastSelectionRange = range.cloneRange()
  savedRange = range.cloneRange()
  return true
}

const selectionChangeHandler = () => {
  const sel = window.getSelection()
  if (!sel || !editorRef.value) return
  if (editorRef.value.contains(sel.anchorNode)) {
    if (!sel.isCollapsed) {
      lastSelectionRange = sel.getRangeAt(0).cloneRange()
      const states = getFormatStates()
      emit('selectionChange', states)
    } else {
      lastSelectionRange = sel.getRangeAt(0).cloneRange()
    }
  }
}

let selectionCheckTimer = null
const onInput = () => {
  clearTimeout(selectionCheckTimer)
  selectionCheckTimer = setTimeout(() => {
    syncContent()
    updateEmptyState()
  }, 0)
}

const getCurrentEditorHtml = () => {
  return editorRef.value ? fromWechatDisplayHtml(editorRef.value.innerHTML) : ''
}

const pushHistorySnapshot = (html = getCurrentEditorHtml()) => {
  if (isRestoringHistory || html === undefined) return
  const last = historyStack.value[historyStack.value.length - 1]
  if (last === html) return

  historyStack.value.push(html)
  if (historyStack.value.length > HISTORY_LIMIT) {
    historyStack.value.shift()
  }
  redoStack.value = []
}

const scheduleHistorySnapshot = (html) => {
  if (isRestoringHistory) return
  clearTimeout(historyTimer)
  historyTimer = setTimeout(() => {
    pushHistorySnapshot(html)
  }, 300)
}

const resetHistory = (html) => {
  clearTimeout(historyTimer)
  historyStack.value = [html || '<p><br></p>']
  redoStack.value = []
}

const syncContent = ({ recordHistory = true } = {}) => {
  if (!editorRef.value) return
  const html = getCurrentEditorHtml()
  internalContent.value = html
  emit('update:contentHtml', html)
  const text = editorRef.value.textContent || ''
  const wc = text.replace(/\s/g, '').length
  emit('wordCountChange', wc)
  if (recordHistory) scheduleHistorySnapshot(html)
}

const updateEmptyState = () => {
  if (!editorRef.value) return
  const text = editorRef.value.textContent || ''
  const plain = text.trim()
  isEmpty.value = plain === '' || plain === '\n'
}

const setContent = (html) => {
  if (!editorRef.value) return
  if (html) {
    html = html.replace(/(<(?:span|div)[^>]*?data-chart-slug\s*=\s*["'][^"']*["'][^>]*?>)\s*\{\{chart:[^}]+\}\}\s*(<\/(?:span|div)>)/g, '$1$2')
    html = html.replace(/(<(?:span|div)[^>]*?data-map-token\s*=\s*["'][^"']*["'][^>]*?>)\s*\{\{map:[^}]+\}\}\s*(<\/(?:span|div)>)/g, '$1$2')
    html = html.replace(/(<(?:span|div)[^>]*?\bclass\s*=\s*["'][^"']*\bchart-node\b[^"']*["'][^>]*?>)\s*\{\{chart:[^}]+\}\}\s*(<\/(?:span|div)>)/g, '$1$2')
    html = html.replace(/(<(?:span|div)[^>]*?\bclass\s*=\s*["'][^"']*\bmap-node\b[^"']*["'][^>]*?>)\s*\{\{map:[^}]+\}\}\s*(<\/(?:span|div)>)/g, '$1$2')
  }
  internalContent.value = html || '<p><br></p>'
  editorRef.value.innerHTML = toWechatDisplayHtml(internalContent.value)
  resetHistory(internalContent.value)
  nextTick(() => {
    syncContent({ recordHistory: false })
    updateEmptyState()
  })
}

const getContent = () => {
  return editorRef.value ? fromWechatDisplayHtml(editorRef.value.innerHTML) : ''
}

const focus = () => {
  if (!editorRef.value) return
  editorRef.value.focus()
}

const getFormatStates = () => {
  return {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    strike: document.queryCommandState('strikeThrough'),
    fontSize: getFontSize(),
    foreColor: document.queryCommandValue('foreColor') || '#000000',
    backColor: document.queryCommandValue('backColor') || '#ffffff',
    alignLeft: document.queryCommandState('justifyLeft'),
    alignCenter: document.queryCommandState('justifyCenter'),
    alignRight: document.queryCommandState('justifyRight'),
    alignJustify: document.queryCommandState('justifyFull'),
    insertUnorderedList: document.queryCommandState('insertUnorderedList'),
    insertOrderedList: document.queryCommandState('insertOrderedList'),
    indent: document.queryCommandState('indent'),
    outdent: document.queryCommandState('outdent'),
    subscript: document.queryCommandState('subscript'),
    superscript: document.queryCommandState('superscript'),
    isBlockquote: isBlockquoteActive(),
    isCodeBlock: isCodeBlockActive(),
    isH1: isHeadingActive('h1'),
    isH2: isHeadingActive('h2'),
    isH3: isHeadingActive('h3'),
    marginTop: getCurrentMarginTop(),
    marginBottom: getCurrentMarginBottom(),
    lineHeight: getCurrentLineHeight(),
    letterSpacing: getCurrentLetterSpacing(),
  }
}

const getFontSize = () => {
  const sel = window.getSelection()
  if (!sel || !sel.anchorNode) return '16'
  const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement
  if (!el) return '16'
  const editor = editorRef.value
  if (!editor) return '16'
  const node = el.closest('[style*="font-size"]') || el.closest('font[size]') || el
  const sizeAttr = node?.getAttribute?.('size')
  if (sizeAttr) {
    const map = { '1': '12', '2': '14', '3': '16', '4': '18', '5': '20', '6': '24', '7': '36' }
    return map[sizeAttr] || sizeAttr || '16'
  }
  const style = node?.style?.fontSize
  if (style) return parseInt(style)
  return '16'
}

const isBlockquoteActive = () => {
  const sel = window.getSelection()
  if (!sel || !sel.anchorNode) return false
  const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement
  return !!el?.closest('blockquote')
}

const isCodeBlockActive = () => {
  const sel = window.getSelection()
  if (!sel || !sel.anchorNode) return false
  const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement
  return el?.closest('pre') !== null || el?.closest('code') !== null
}

const isHeadingActive = (tag) => {
  const sel = window.getSelection()
  if (!sel || !sel.anchorNode) return false
  const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement
  if (!el) return false
  const heading = el.closest('h1, h2, h3, h4, h5, h6')
  return heading?.tagName?.toLowerCase() === tag
}

const restoreSelection = (savedSel) => {
  if (!savedSel || !editorRef.value) return
  try {
    const range = document.createRange()
    const startNode = findTextNode(editorRef.value, savedSel.startOffset)
    const endNode = findTextNode(editorRef.value, savedSel.endOffset)
    if (startNode.node && endNode.node) {
      range.setStart(startNode.node, Math.min(startNode.offset, startNode.node.textContent.length))
      range.setEnd(endNode.node, Math.min(endNode.offset, endNode.node.textContent.length))
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
  } catch { /* ignore */ }
}

const saveSelection = () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || !editorRef.value) return null
  const range = sel.getRangeAt(0)
  if (!editorRef.value.contains(range.commonAncestorContainer)) return null
  return {
    startOffset: getTextOffset(editorRef.value, range.startContainer, range.startOffset),
    endOffset: getTextOffset(editorRef.value, range.endContainer, range.endOffset),
  }
}

const getTextOffset = (root, node, offset) => {
  let totalOffset = 0
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false)
  while (walker.nextNode()) {
    const textNode = walker.currentNode
    if (textNode === node) return totalOffset + offset
    totalOffset += textNode.textContent.length
  }
  return totalOffset + offset
}

const findTextNode = (root, targetOffset) => {
  let accumulated = 0
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false)
  while (walker.nextNode()) {
    const node = walker.currentNode
    const len = node.textContent.length
    if (accumulated + len >= targetOffset) {
      return { node, offset: targetOffset - accumulated }
    }
    accumulated += len
  }
  const lastText = walker.currentNode
  return lastText ? { node: lastText, offset: lastText.textContent.length } : { node: root, offset: 0 }
}

const exec = (command, value = null) => {
  editorRef.value?.focus()
  document.execCommand(command, false, value)
  syncContent()
}

const execWithValue = (command, value) => {
  editorRef.value?.focus()
  document.execCommand(command, false, value)
  syncContent()
}

const execFormatBlock = (tag) => {
  editorRef.value?.focus()
  document.execCommand('formatBlock', false, `<${tag}>`)
  syncContent()
}

const toggleHeading = (level) => {
  execFormatBlock(`h${level}`)
}

const toggleBold = () => exec('bold')
const toggleItalic = () => exec('italic')
const toggleUnderline = () => exec('underline')
const toggleStrike = () => exec('strikeThrough')

const toggleBlockquote = () => {
  const isActive = isBlockquoteActive()
  if (isActive) {
    execFormatBlock('p')
  } else {
    execFormatBlock('blockquote')
  }
}

const toggleCodeBlock = () => {
  const isActive = isCodeBlockActive()
  if (isActive) {
    execFormatBlock('p')
  } else {
    execFormatBlock('pre')
  }
}

const setFontSize = (size) => {
  editorRef.value?.focus()
  if (!size || size === '16') {
    removeFormat()
    syncContent()
    return
  }
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) { syncContent(); return }
  const range = sel.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer)) { syncContent(); return }

  if (sel.isCollapsed) {
    const p = range.startContainer.nodeType === 1
      ? range.startContainer
      : range.startContainer.parentElement
    const block = p?.closest('p, div, h1, h2, h3, h4, h5, h6, blockquote, li') || p
    if (block) {
      block.style.fontSize = size + 'px'
    }
  } else {
    const fragment = range.extractContents()
    const span = document.createElement('span')
    span.style.fontSize = size + 'px'
    span.appendChild(fragment)
    range.insertNode(span)
  }
  syncContent()
}

const setColor = (color) => {
  editorRef.value?.focus()
  if (!color || color === '#000000' || color === '#000') {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    const selectedText = range.toString()
    if (selectedText) {
      const parentEl = range.startContainer.parentElement
      if (parentEl) {
        const ancestor = parentEl.closest('[style*="color"]')
        if (ancestor) {
          ancestor.style.color = ''
          if (ancestor.style.length === 0) ancestor.removeAttribute('style')
        }
      }
    }
    syncContent()
    return
  }
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return
  const range = sel.getRangeAt(0)
  if (!range.toString()) { syncContent(); return }
  const parentEl = range.startContainer.parentElement
  if (parentEl) {
    const ancestor = parentEl.closest('[style*="color"]')
    if (ancestor) {
      ancestor.style.color = ''
      if (ancestor.style.length === 0) ancestor.removeAttribute('style')
    }
  }
  execWithValue('foreColor', color)
}

const setBgColor = (color) => {
  editorRef.value?.focus()
  if (!color || color === '#ffffff' || color === '#fff') {
    execWithValue('backColor', '#ffffff')
    syncContent()
    return
  }
  execWithValue('backColor', color)
}

const setTextAlign = (align) => {
  editorRef.value?.focus()
  document.execCommand('justifyLeft', false, null)
  if (align === 'center') document.execCommand('justifyCenter', false, null)
  else if (align === 'right') document.execCommand('justifyRight', false, null)
  else if (align === 'justify') document.execCommand('justifyFull', false, null)
  syncContent()
}

const setIndent = () => exec('indent')
const setOutdent = () => exec('outdent')

const toggleUnorderedList = () => exec('insertUnorderedList')
const toggleOrderedList = () => exec('insertOrderedList')

const setListStyle = (style) => {
  editorRef.value?.focus()
  if (style === 'decimal') {
    toggleOrderedList()
  } else {
    toggleUnorderedList()
  }
  const sel = window.getSelection()
  if (sel?.rangeCount) {
    const node = sel.getRangeAt(0).commonAncestorContainer
    const list = node.nodeType === 1 ? node.closest?.('ul, ol') : node.parentElement?.closest?.('ul, ol')
    if (list && list.tagName === 'UL') {
      list.style.listStyleType = style
    }
  }
  syncContent()
}

const setLineHeight = (value) => {
  editorRef.value?.focus()
  wrapSelectionWithStyle('lineHeight', value)
  syncContent()
}

const setLetterSpacing = (value) => {
  editorRef.value?.focus()
  const v = value === '0' ? 'normal' : value + 'px'
  wrapSelectionWithStyle('letterSpacing', v)
  syncContent()
}

const setMarginTop = (value) => {
  editorRef.value?.focus()
  const v = value === '0' || value === '0px' ? '0px' : value + 'px'
  wrapSelectionWithStyle('marginTop', v)
  syncContent()
}

const setMarginBottom = (value) => {
  editorRef.value?.focus()
  const v = value === '0' || value === '0px' ? '0px' : value + 'px'
  wrapSelectionWithStyle('marginBottom', v)
  syncContent()
}

const wrapSelectionWithStyle = (prop, value) => {
  editorRef.value?.focus()
  let sel = window.getSelection()
  if (!sel || !sel.rangeCount || !editorRef.value?.contains(sel.getRangeAt(0).commonAncestorContainer)) {
    let restored = false
    if (lastSelectionRange && editorRef.value?.contains(lastSelectionRange.commonAncestorContainer)) {
      try {
        editorRef.value.focus()
        sel.removeAllRanges()
        sel.addRange(lastSelectionRange.cloneRange())
        sel = window.getSelection()
        restored = true
      } catch { /* fall through */ }
    }
    if (!restored && savedRange && editorRef.value?.contains(savedRange.commonAncestorContainer)) {
      try {
        editorRef.value.focus()
        sel.removeAllRanges()
        sel.addRange(savedRange)
        sel = window.getSelection()
        restored = true
      } catch { /* fall through */ }
    }
    if (!restored) {
      const lastChild = editorRef.value?.lastElementChild || editorRef.value?.lastChild
      if (lastChild) {
        const range = document.createRange()
        range.setStart(lastChild, 0)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
        sel = window.getSelection()
      }
    }
  }
  if (!sel || !sel.rangeCount) return
  const range = sel.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer)) return

  if (sel.isCollapsed) {
    const p = range.startContainer.nodeType === 1
      ? range.startContainer
      : range.startContainer.parentElement
    const block = p?.closest('p, div, h1, h2, h3, h4, h5, h6, blockquote, li') || p
    if (block) {
      block.style[prop] = value
      if (value === '0' || value === 'normal' || value === '0px') {
        block.style[prop] = ''
        if (block.style.length === 0) block.removeAttribute('style')
      }
    }
    return
  }

  const fragment = range.extractContents()
  const wrapper = document.createElement('div')
  wrapper.style[prop] = value
  if (value === '0' || value === 'normal' || value === '0px') wrapper.style[prop] = ''
  wrapper.appendChild(fragment)
  range.insertNode(wrapper)
  while (wrapper.firstChild) {
    wrapper.parentNode?.insertBefore(wrapper.firstChild, wrapper)
  }
  wrapper.remove()
}

const removeFormat = () => exec('removeFormat')

const insertHorizontalRule = () => exec('insertHorizontalRule')

const insertTable = (rows = 3, cols = 3) => {
  editorRef.value?.focus()
  let html = '<table style="border-collapse:collapse;width:100%;margin:12px 0;border:1px solid #d0d0d0;">'
  for (let r = 0; r < rows; r++) {
    html += '<tr>'
    for (let c = 0; c < cols; c++) {
      const tag = r === 0 ? 'th' : 'td'
      html += `<${tag} style="border:1px solid #d0d0d0;padding:8px 10px;min-width:60px;">&nbsp;</${tag}>`
    }
    html += '</tr>'
  }
  html += '</table>'
  document.execCommand('insertHTML', false, html)
  syncContent()
}

const insertHtml = (html) => {
  if (!editorRef.value) return
  restoreSavedSelection()
  document.execCommand('insertHTML', false, toWechatDisplayHtml(html))
  syncContent()
}

const insertChart = ({ slug, imageUrl, wechatImageUrl }) => {
  const src = wechatImageUrl || imageUrl
  if (src) {
    const html = `<div data-chart-slug="${slug}" class="chart-node" contenteditable="false" style="margin:12px 0;cursor:pointer;"><img src="${src}" alt="chart:${slug}" style="display:block;max-width:100%;height:auto;border-radius:4px;"></div>`
    insertHtml(html)
  } else {
    const html = `<span data-chart-slug="${slug}" class="chart-node" contenteditable="false" style="display:inline-block;background:#f0f5ff;border:1px solid #d6e4ff;border-radius:4px;padding:2px 8px;margin:0 2px;cursor:pointer;font-size:13px;color:#1d66b0;"></span>`
    insertHtml(html)
  }
}

const insertMap = ({ token, imageUrl, wechatImageUrl }) => {
  const src = wechatImageUrl || imageUrl
  if (src) {
    const html = `<div data-map-token="${token}" class="map-node" contenteditable="false" style="margin:12px 0;cursor:pointer;"><img src="${src}" alt="map:${token}" style="display:block;max-width:100%;height:auto;border-radius:4px;"></div>`
    insertHtml(html)
  } else {
    const html = `<span data-map-token="${token}" class="map-node" contenteditable="false" style="display:inline-block;background:#f0fff0;border:1px solid #b7eb8f;border-radius:4px;padding:2px 8px;margin:0 2px;cursor:pointer;font-size:13px;color:#389e0d;"></span>`
    insertHtml(html)
  }
}

const insertImage = (src, alt = '') => {
  editorRef.value?.focus()
  const html = `<img src="${src}" alt="${alt}" style="display:block;max-width:100%;height:auto;margin:12px auto;border-radius:4px;">`
  document.execCommand('insertHTML', false, toWechatDisplayHtml(html))
  syncContent()
}

const insertLink = (href, text = '') => {
  editorRef.value?.focus()
  if (!text) {
    const sel = window.getSelection()
    text = sel?.toString() || href
  }
  document.execCommand('insertHTML', false, `<a href="${href}" style="color:#607fa6;text-decoration:none;">${text}</a>`)
  syncContent()
}

const insertEmoji = (emoji) => {
  editorRef.value?.focus()
  document.execCommand('insertText', false, emoji)
  syncContent()
}

const restoreHistoryHtml = (html) => {
  if (!editorRef.value) return
  isRestoringHistory = true
  internalContent.value = html || '<p><br></p>'
  editorRef.value.innerHTML = toWechatDisplayHtml(internalContent.value)
  syncContent({ recordHistory: false })
  updateEmptyState()
  isRestoringHistory = false
}

const undo = () => {
  if (!editorRef.value) return false
  clearTimeout(historyTimer)
  const current = getCurrentEditorHtml()
  pushHistorySnapshot(current)
  if (historyStack.value.length <= 1) return false

  const currentSnapshot = historyStack.value.pop()
  redoStack.value.push(currentSnapshot)
  const previous = historyStack.value[historyStack.value.length - 1]
  restoreHistoryHtml(previous)
  return true
}

const redo = () => {
  if (!editorRef.value || redoStack.value.length === 0) return false
  clearTimeout(historyTimer)
  const next = redoStack.value.pop()
  historyStack.value.push(next)
  restoreHistoryHtml(next)
  return true
}

const canUndo = () => historyStack.value.length > 1
const canRedo = () => redoStack.value.length > 0

let formatPainterSource = null
let formatPainterActive = false

const textStyleProps = [
  'color',
  'backgroundColor',
  'fontSize',
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'textDecorationLine',
  'lineHeight',
  'letterSpacing',
]

const blockStyleProps = [
  'textAlign',
  'marginTop',
  'marginBottom',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'backgroundColor',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopStyle',
  'borderRightStyle',
  'borderBottomStyle',
  'borderLeftStyle',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
]

const getSelectionElement = (sel) => {
  const node = sel?.anchorNode
  if (!node) return null
  return node.nodeType === 1 ? node : node.parentElement
}

const getSelectionBlock = (el) => {
  return el?.closest?.('p, div, h1, h2, h3, h4, h5, h6, blockquote, li, section') || null
}

const getBoundaryBlock = (node, offset = 0, direction = 'start') => {
  let el = node?.nodeType === 1 ? node : node?.parentElement
  if (!el) return null

  if (el === editorRef.value) {
    const childCount = el.childNodes.length
    if (!childCount) return null
    const childIndex = direction === 'end'
      ? Math.max(0, Math.min(offset - 1, childCount - 1))
      : Math.max(0, Math.min(offset, childCount - 1))
    el = el.childNodes[childIndex]
    if (el?.nodeType !== 1) el = el?.parentElement
  }

  return getSelectionBlock(el)
}
let editorDefaultStylesCache = null
const getEditorDefaultStyles = () => {
  if (editorDefaultStylesCache) return editorDefaultStylesCache
  if (!editorRef.value) return {}
  editorDefaultStylesCache = textStyleProps.reduce((acc, prop) => {
    acc[prop] = window.getComputedStyle(editorRef.value)[prop]
    return acc
  }, {})
  return editorDefaultStylesCache
}

const editorDefaultStyles = getEditorDefaultStyles()

const pickComputedStyles = (el, props, defaults = {}) => {
  if (!el) return {}
  const computed = window.getComputedStyle(el)
  return props.reduce((acc, prop) => {
    const value = computed[prop]
    const defaultVal = defaults[prop] || editorDefaultStyles[prop]
    if (value && value !== 'normal' && value !== 'none' && value !== 'rgba(0, 0, 0, 0)' && value !== defaultVal) {
      acc[prop] = value
    }
    return acc
  }, {})
}

const pickInheritedTextStyles = (el, stopEl, defaults = {}) => {
  const chain = []
  let node = el
  while (node && node !== editorRef.value) {
    chain.unshift(node)
    if (node === stopEl) break
    node = node.parentElement
  }

  return chain.reduce((acc, item) => {
    return {
      ...acc,
      ...pickComputedStyles(item, textStyleProps, defaults),
    }
  }, {})
}

const getBlockTextContainer = (block) => {
  let node = block
  while (node?.parentElement && node.parentElement !== editorRef.value) {
    const parent = node.parentElement
    const tagName = parent.tagName?.toLowerCase()
    if (tagName === 'section' && (parent.hasAttribute('data-autoskip') || parent.getAttribute('style'))) {
      node = parent
      continue
    }
    break
  }
  return node || block
}

const normalizeSelectionText = (text) => String(text || '')
  .normalize('NFKC')
  .replace(/[\s\u200B\uFEFF]+/gu, '')

const getTextBeforeBoundary = (block, node, offset) => {
  try {
    const prefixRange = document.createRange()
    prefixRange.selectNodeContents(block)
    prefixRange.setEnd(node, offset)
    return normalizeSelectionText(prefixRange.toString())
  } catch {
    return null
  }
}

const getTextAfterBoundary = (block, node, offset) => {
  try {
    const suffixRange = document.createRange()
    suffixRange.selectNodeContents(block)
    suffixRange.setStart(node, offset)
    return normalizeSelectionText(suffixRange.toString())
  } catch {
    return null
  }
}

const isWholeBlockSelection = (range, block, selectedText) => {
  if (!block || !selectedText || !range) return false

  const blockText = normalizeSelectionText(block.textContent)
  const normalizedSelectedText = normalizeSelectionText(selectedText)
  if (!blockText || !normalizedSelectedText || blockText !== normalizedSelectedText) return false
  if (blockText === normalizedSelectedText) return true

  const textBefore = getTextBeforeBoundary(block, range.startContainer, range.startOffset)
  const textAfter = getTextAfterBoundary(block, range.endContainer, range.endOffset)
  return textBefore === '' && textAfter === ''
}
const applyStyles = (el, styles) => {
  Object.entries(styles || {}).forEach(([prop, value]) => {
    el.style[prop] = value
  })
}

const applyFormatToBlock = (block) => {
  if (!block || !formatPainterSource?.isBlockSelection) return false
  applyStyles(block, {
    ...formatPainterSource.blockStyles,
    ...formatPainterSource.textStyles,
  })
  return true
}

const applyFormatToRange = (range) => {
  const fragment = range.extractContents()
  const wrapper = document.createElement('span')
  applyStyles(wrapper, formatPainterSource.textStyles)
  wrapper.appendChild(fragment)
  range.insertNode(wrapper)
  return wrapper
}

const getUsableSelectionRange = () => {
  const sel = window.getSelection()
  if (sel && !sel.isCollapsed && sel.rangeCount > 0 && editorRef.value?.contains(sel.getRangeAt(0).commonAncestorContainer)) {
    return { sel, range: sel.getRangeAt(0) }
  }

  if (lastSelectionRange && editorRef.value?.contains(lastSelectionRange.commonAncestorContainer)) {
    const restoredSel = window.getSelection()
    restoredSel.removeAllRanges()
    restoredSel.addRange(lastSelectionRange.cloneRange())
    return { sel: restoredSel, range: restoredSel.getRangeAt(0) }
  }

  return { sel: null, range: null }
}

const startFormatPainter = () => {
  const { sel, range } = getUsableSelectionRange()
  if (!sel || !range) return

  const sourceEl = getSelectionElement(sel)
  const sourceBlock = getSelectionBlock(sourceEl)
  const selectedText = sel.toString().trim()
  const isBlockSelection = isWholeBlockSelection(range, sourceBlock, selectedText)
  const textStyleStopEl = isBlockSelection ? getBlockTextContainer(sourceBlock) : sourceBlock
  const defaultStyles = getEditorDefaultStyles()
  formatPainterSource = {
    textStyles: pickInheritedTextStyles(sourceEl, textStyleStopEl, defaultStyles),
    blockStyles: isBlockSelection ? pickComputedStyles(sourceBlock, blockStyleProps, defaultStyles) : {},
    isBlockSelection,
  }
  formatPainterActive = true
  return formatPainterActive
}

const applyFormatPainter = () => {
  if (!formatPainterSource || !formatPainterActive) return false
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return false
  const range = sel.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer)) return false

  const targetElBeforeChange = getSelectionElement(sel)
  const targetBlockBeforeChange = getSelectionBlock(targetElBeforeChange)
  if (sel.isCollapsed) {
    if (!applyFormatToBlock(targetBlockBeforeChange)) return false
    syncContent()
    cancelFormatPainter()
    emit('formatPainterDone')
    return true
  }

  const targetStartBlock = getBoundaryBlock(range.startContainer, range.startOffset, 'start')
  const targetEndBlock = getBoundaryBlock(range.endContainer, range.endOffset, 'end')
  const isSingleTargetBlock = targetStartBlock && targetStartBlock === targetEndBlock

  if (formatPainterSource.isBlockSelection && isSingleTargetBlock) {
    if (applyFormatToBlock(targetStartBlock)) {
      syncContent()
      cancelFormatPainter()
      emit('formatPainterDone')
      return true
    }
  }

  const wrapper = applyFormatToRange(range)

  const nextRange = document.createRange()
  nextRange.selectNodeContents(wrapper)
  sel.removeAllRanges()
  sel.addRange(nextRange)

  syncContent()
  cancelFormatPainter()
  emit('formatPainterDone')
  return true
}

const applyFormatPainterIfReady = () => {
  if (!formatPainterActive || !formatPainterSource) return
  window.setTimeout(() => {
    applyFormatPainter()
  }, 150)
}

const cancelFormatPainter = () => {
  formatPainterSource = null
  formatPainterActive = false
}

const getCurrentLineHeight = () => {
  const sel = window.getSelection()
  if (!sel || !sel.anchorNode) return '1.6'
  const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement
  if (!el) return '1.6'
  const block = el.closest('[style*="line-height"]') || el.closest('p, div, h1, h2, h3, h4, h5, h6, li')
  const lh = block?.style?.lineHeight
  return lh || '1.6'
}

const getCurrentLetterSpacing = () => {
  const sel = window.getSelection()
  if (!sel || !sel.anchorNode) return '0'
  const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement
  if (!el) return '0'
  const block = el.closest('[style*="letter-spacing"]') || el.closest('p, div, h1, h2, h3, h4, h5, h6, li')
  const ls = block?.style?.letterSpacing
  if (!ls || ls === 'normal') return '0'
  return parseInt(ls) + ''
}

const getCurrentMarginTop = () => {
  const sel = window.getSelection()
  if (!sel || !sel.anchorNode) return '0'
  const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement
  if (!el) return '0'
  const block = el.closest('[style*="margin-top"]') || el.closest('p, div, h1, h2, h3, h4, h5, h6, li')
  const mt = block?.style?.marginTop
  return mt ? parseInt(mt) + '' : '0'
}

const getCurrentMarginBottom = () => {
  const sel = window.getSelection()
  if (!sel || !sel.anchorNode) return '0'
  const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement
  if (!el) return '0'
  const block = el.closest('[style*="margin-bottom"]') || el.closest('p, div, h1, h2, h3, h4, h5, h6, li')
  const mb = block?.style?.marginBottom
  return mb ? parseInt(mb) + '' : '0'
}

const writeSelectionToClipboard = (e, preventDefault = false) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || !editorRef.value?.contains(selection.anchorNode)) return

  const range = selection.getRangeAt(0)
  const container = document.createElement('div')
  container.appendChild(range.cloneContents())

  if (preventDefault) e.preventDefault()
  e.clipboardData?.setData('text/html', container.innerHTML)
  e.clipboardData?.setData('text/plain', selection.toString())
  e.clipboardData?.setData('text/x-wx-editor', 'true')
}

const onCopy = (e) => writeSelectionToClipboard(e, true)
const onCut = (e) => writeSelectionToClipboard(e)

const insertHtmlAtRange = (html, range) => {
  const fragment = range.createContextualFragment(html)
  range.deleteContents()
  range.insertNode(fragment)
  range.collapse(false)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

const onPaste = async (e) => {
  const types = e.clipboardData?.types
  const isInternalPaste = types && Array.prototype.indexOf.call(types, 'text/x-wx-editor') !== -1
  const files = e.clipboardData?.files

  e.preventDefault()
  editorRef.value?.focus()

  if (files && files.length > 0) {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        await uploadAndInsertImage(file)
      }
    }
    syncContent()
    return
  }

  const text = e.clipboardData?.getData('text/plain') || ''
  const html = e.clipboardData?.getData('text/html') || ''

  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) { syncContent(); return }
  const range = sel.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer)) { syncContent(); return }

  if (html) {
    const content = isInternalPaste ? html : sanitizePastedHtml(html)
    insertHtmlAtRange(toWechatDisplayHtml(content), range)
  } else if (text) {
    document.execCommand('insertText', false, text)
  }
  syncContent()
}

const uploadAndInsertImage = async (file) => {
  if (uploading) return
  if (!props.wechatAccountIds.length) return

  saveSelectionInternal()
  uploading = true
  editorWrapperRef.value?.classList.add('is-uploading')
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await request({
      url: '/txwx-social-crm/material/permanentAdd',
      method: 'post',
      data: form,
      params: { accountId: props.wechatAccountIds[0] },
      timeout: 120000,
    })
    if (res?.data?.url) {
      restoreSavedSelection()
      const imgHtml = `<img src="${res.data.url}" alt="" style="max-width:100%;height:auto;display:block;margin:12px auto;border-radius:4px;">`
      document.execCommand('insertHTML', false, toWechatDisplayHtml(imgHtml))
      syncContent()
    }
  } catch {
  } finally {
    uploading = false
    editorWrapperRef.value?.classList.remove('is-uploading')
  }
}

const sanitizePastedHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null, false)
  while (walker.nextNode()) {
    const el = walker.currentNode
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'IFRAME') {
      el.remove()
      continue
    }

    for (const attribute of Array.from(el.attributes)) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim().toLowerCase()
      if (name.startsWith('on') || ((name === 'href' || name === 'src' || name === 'action') && value.startsWith('javascript:'))) {
        el.removeAttribute(attribute.name)
      }
    }

    if (el.hasAttribute('style')) {
      const cleaned = el.getAttribute('style').split(';')
        .map(declaration => declaration.trim())
        .filter(declaration => declaration && !/(expression\s*\(|javascript\s*:|-moz-binding)/i.test(declaration))
        .join('; ')
      if (cleaned) el.setAttribute('style', cleaned)
      else el.removeAttribute('style')
    }
  }
  return doc.body.innerHTML
}

const onDrop = (e) => {
  e.preventDefault()
}

const selectedImage = ref(null)
const imageToolbarStyle = ref({})
const imageAlign = ref('')
const imageWidthMode = ref('')

const onEditorClick = (e) => {
  const img = e.target.closest('img')
  if (img && editorRef.value?.contains(img)) {
    selectImage(img)
  } else if (!e.target.closest('.wx-image-toolbar')) {
    clearImageSelection()
  }
}

const selectImage = (img) => {
  selectedImage.value = img
  const rect = img.getBoundingClientRect()
  const editorRect = editorWrapperRef.value?.getBoundingClientRect()
  if (editorRect) {
    const toolbarWidth = 280
    let left = rect.left + rect.width / 2 - toolbarWidth / 2
    left = Math.max(10, Math.min(left, editorRect.width - toolbarWidth - 10))
    imageToolbarStyle.value = {
      position: 'fixed',
      top: (rect.top - 44) + 'px',
      left: left + 'px',
    }
  }
  imageWidthMode.value = img.style.width === '100%' ? 'auto' : 'custom'

  const parent = img.parentElement
  if (parent) {
    const pa = parent.style.textAlign
    if (pa === 'center') imageAlign.value = 'center'
    else if (pa === 'right') imageAlign.value = 'right'
    else imageAlign.value = 'left'
  }
}

const clearImageSelection = () => {
  selectedImage.value = null
  imageToolbarStyle.value = {}
}

const wrapImageInBlock = (img) => {
  let parent = img.parentElement
  if (!parent || parent.tagName === 'BODY') {
    parent = document.createElement('p')
    img.parentNode?.insertBefore(parent, img)
    parent.appendChild(img)
  } else if (parent.tagName !== 'P' && parent.tagName !== 'DIV' && parent.tagName !== 'SECTION') {
    const wrapper = document.createElement('p')
    img.parentNode?.insertBefore(wrapper, img)
    wrapper.appendChild(img)
    parent = wrapper
  }
  return parent
}

const setImageAlign = (align) => {
  const img = selectedImage.value
  if (!img) return
  const parent = wrapImageInBlock(img)
  parent.style.textAlign = align
  img.style.display = 'inline-block'
  if (align === 'center') {
    img.style.margin = '12px auto'
  } else {
    img.style.margin = '12px 0'
  }
  imageAlign.value = align
  syncContent()
}

const setImageAutoFit = () => {
  const img = selectedImage.value
  if (!img) return
  if (imageWidthMode.value === 'auto') {
    img.style.width = ''
    img.style.maxWidth = '100%'
    img.style.display = 'inline-block'
    imageWidthMode.value = 'custom'
  } else {
    const parent = wrapImageInBlock(img)
    parent.style.textAlign = 'center'
    img.style.display = 'block'
    img.style.margin = '12px auto'
    img.style.width = '100%'
    img.style.maxWidth = '100%'
    if (img.naturalWidth) {
      img.setAttribute('data-w', img.naturalWidth)
      img.setAttribute('data-ratio', (img.naturalHeight / img.naturalWidth).toFixed(4))
    }
    imageWidthMode.value = 'auto'
  }
  syncContent()
}

const deleteSelectedImage = () => {
  const img = selectedImage.value
  if (!img) return
  const parent = img.parentElement
  img.remove()
  if (parent && !parent.textContent.trim() && parent.tagName !== 'BODY') {
    parent.remove()
  }
  clearImageSelection()
  syncContent()
}

const onKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && !e.altKey) {
    const key = e.key.toLowerCase()
    if (key === 'z') {
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
      return
    }
    if (key === 'y') {
      e.preventDefault()
      redo()
      return
    }
  }

  if (e.key === 'Tab') {
    e.preventDefault()
    document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
    syncContent()
  }
}

watch(() => props.contentHtml, (val) => {
  if (val !== undefined && val !== internalContent.value) {
    setContent(val)
  }
})

let selectionObserver = null

let savedRange = null
const editorWrapperRef = ref(null)
let uploading = false

const saveSelectionInternal = () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || !editorRef.value) return null
  const range = sel.getRangeAt(0)
  if (!editorRef.value.contains(range.commonAncestorContainer)) return null
  savedRange = range.cloneRange()
  return true
}

const restoreSavedSelection = () => {
  if (!savedRange || !editorRef.value) return false
  try {
    editorRef.value.focus()
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(savedRange)
    return true
  } catch {
    return false
  }
}

onMounted(() => {
  setContent(props.contentHtml || '<p><br></p>')
  document.addEventListener('selectionchange', selectionChangeHandler)
  updateEmptyState()
})

onBeforeUnmount(() => {
  clearTimeout(selectionCheckTimer)
  clearTimeout(historyTimer)
  document.removeEventListener('selectionchange', selectionChangeHandler)
})

defineExpose({
  setContent,
  getContent,
  focus,
  saveSelection: saveSelectionInternal,
  restoreSelection: restoreSavedSelection,
  undo,
  redo,
  canUndo,
  canRedo,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrike,
  toggleBlockquote,
  toggleCodeBlock,
  setFontSize,
  setColor,
  setBgColor,
  setTextAlign,
  setIndent,
  setOutdent,
  toggleUnorderedList,
  toggleOrderedList,
  setListStyle,
  setLineHeight,
  setLetterSpacing,
  setMarginTop,
  setMarginBottom,
  removeFormat,
  insertHorizontalRule,
  insertTable,
  insertChart,
  insertMap,
  insertImage,
  insertLink,
  insertEmoji,
  insertHtml,
  startFormatPainter,
  applyFormatPainter,
  cancelFormatPainter,
  toggleHeading,
  getFormatStates,
  getCurrentLineHeight,
  getCurrentLetterSpacing,
  getCurrentMarginTop,
  getCurrentMarginBottom,
  insertImage,
  setImageAutoFit,
  setImageAlign,
  clearImageSelection,
})
</script>

<style scoped lang="scss">
.wx-editor {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: hidden;

  &__body {
    width: 100%;
    max-width: 677px;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 2px 0;
    min-height: 180px;
    font-size: 15px;
    color: #333;
    line-height: 1.6;
    word-wrap: break-word;
    outline: none;
    cursor: text;

    :deep(*) {
      box-sizing: border-box;
    }

    :deep(section),
    :deep(p),
    :deep(div) {
      max-width: 100%;
    }

    :deep(img) {
      max-width: 100% !important;
      height: auto !important;
    }

    :deep([style*="width: 677px"]),
    :deep([style*="width:677px"]),
    :deep([style*="width: 676.989px"]),
    :deep([style*="width:676.989px"]),
    :deep([data-width="100%"]) {
      max-width: 100% !important;
    }

    &:empty:before,
    &.is-empty:before {
      content: '从这里开始写正文';
      color: #c0c4cc;
      float: left;
      height: 0;
      pointer-events: none;
    }

    p {
      margin: 0 0 8px;
    }

    img {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 12px auto;
      border-radius: 4px;
    }

    strong {
      font-weight: 600;
    }

    a {
      color: #607fa6;
      text-decoration: none;
      word-break: break-all;
    }

    ul, ol {
      padding-left: 1.5em;
      margin: 8px 0;
    }

    li {
      margin-bottom: 6px;
    }

    blockquote {
      margin: 12px 0;
      padding: 10px 14px;
      background: #f7f7f7;
      border-left: 3px solid #ddd;
      color: #666;
      font-size: 14px;
    }

    pre {
      margin: 12px 0;
      padding: 14px 16px;
      background: #f5f5f5;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
      border: 1px solid #d0d0d0;

      th, td {
        border: 1px solid #d0d0d0;
        padding: 8px 10px;
        min-width: 60px;
        vertical-align: top;
      }

      th {
        background: #fafafa;
        font-weight: 600;
      }
    }

    h1 { font-size: 22px; font-weight: 700; margin: 16px 0 10px; }
    h2 { font-size: 19px; font-weight: 700; margin: 14px 0 8px; }
    h3 { font-size: 17px; font-weight: 600; margin: 12px 0 8px; }
  }

  .wx-image-toolbar {
    position: fixed;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px 8px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    font-size: 12px;

    &__btn {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 4px 6px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 3px;
      color: #606266;
      white-space: nowrap;
      font-size: 12px;
      transition: all 0.15s;

      &:hover { background: #ecf5ff; color: #409eff; }
      &.active { color: #409eff; background: #ecf5ff; }

      &--danger:hover { color: #f56c6c; background: #fef0f0; }

      svg { width: 14px; height: 14px; }
    }

    &__divider {
      width: 1px;
      height: 14px;
      background: #dcdfe6;
      margin: 0 4px;
      flex-shrink: 0;
    }
  }

  &.is-uploading::after {
    content: '正在上传图片...';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.8);
    font-size: 14px;
    color: #999;
    z-index: 10;
    pointer-events: none;
  }
}
</style>
