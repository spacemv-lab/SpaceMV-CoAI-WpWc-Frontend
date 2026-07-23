/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="mobile-article-editor ignore-vw">
    <!-- 顶部 Hero -->
    <div class="hero-card">
      <div class="hero-top">
        <h1 class="hero-title">{{ isEdit ? '编辑文章' : '新建文章' }}</h1>
        <div class="hero-badge">
          <el-tag v-if="articleForm.status" round effect="light" size="small">
            {{ (ARTICLE_STATUS[articleForm.status] || {}).label || articleForm.status }}
          </el-tag>
        </div>
      </div>
      <div class="hero-desc">{{ isEdit ? '修改文章元信息和正文' : '填写文章信息并保存草稿' }}</div>
      <div class="action-buttons">
        <van-button round type="primary" @click="handleSave" :loading="saving">保存草稿</van-button>
        <van-button round plain type="primary" @click="handlePreview">预览</van-button>
        <van-button round plain @click="handleBack">返回</van-button>
      </div>
    </div>

    <!-- 基础信息 -->
    <section class="form-panel">
      <div class="panel-title">基础信息</div>

      <van-form @submit="handleSave" class="article-form">
        <van-field
          v-model="articleForm.title"
          name="title"
          label="文章标题"
          placeholder="请输入文章标题"
          :rules="[{ required: true, message: '请输入文章标题' }]"
          @input="onTitleInput"
        />

        <van-field
          v-model="articleForm.slug"
          label="Slug"
          placeholder="a-z、0-9、中划线"
          :rules="[
            { required: true, message: '请输入 slug' },
            { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'slug 只允许小写字母、数字和中划线' }
          ]"
          @input="onSlugInput"
        />
        <div class="field-tip">只允许小写字母、数字和中划线，例如：us-core-cpi-guide</div>

        <van-field
          v-model="articleForm.summary"
          label="摘要"
          type="textarea"
          placeholder="用于列表、SEO 和分享卡片，建议 80-200 字"
          :rows="3"
        />

        <van-field label="封面图">
          <template #input>
            <div class="cover-picker-wrapper">
              <div v-if="articleForm.coverUrl" class="cover-preview" @click="coverPickerVisible = true">
                <img :src="coverPreview" alt="封面" referrerpolicy="no-referrer" />
                <div class="cover-overlay">点击更换</div>
              </div>
              <div v-else class="cover-picker-placeholder" @click="coverPickerVisible = true">
                <span>选择封面图</span>
              </div>
              <van-button size="small" plain type="primary" @click="coverPickerVisible = true">从素材库选择</van-button>
            </div>
          </template>
        </van-field>

        <van-field
          v-model="articleForm.authorName"
          label="作者名称"
          placeholder="作者名称"
        />
      </van-form>
    </section>

    <!-- 文章标签 -->
    <section class="form-panel">
      <div class="panel-title">文章标签</div>
      <van-form>
        <van-field label="标签">
          <template #input>
            <div class="tag-input-wrap">
              <van-tag
                v-for="(tag, idx) in tagsArray"
                :key="idx"
                closeable
                size="small"
                type="primary"
                @close="removeTag(idx)"
                class="tag-item"
              >{{ tag }}</van-tag>
              <van-field
                v-model="tagInput"
                placeholder="输入标签后确认"
                clearable
                size="small"
                class="tag-field"
                @keyup.enter="addTag"
                @blur="addTag"
              />
            </div>
          </template>
        </van-field>
      </van-form>
      <div class="field-tip">用于文章分类和前端筛选，如：宏观经济、市场分析、AI/科技</div>
    </section>

    <!-- 正文编辑 - TipTap 编辑器 -->
    <section class="form-panel editor-panel">
      <div class="panel-title">正文</div>
      <!-- 格式工具栏 -->
      <div class="wx-format-toolbar" v-if="editor">
        <button class="wx-fmt-btn" @click="editor.chain().focus().undo().run()" :disabled="!editor.can()?.undo()" title="撤销">↩</button>
        <button class="wx-fmt-btn" @click="editor.chain().focus().redo().run()" :disabled="!editor.can()?.redo()" title="重做">↪</button>
        <span class="wx-format-divider"></span>
        <button class="wx-fmt-btn" :class="{ active: editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()" title="加粗"><strong>B</strong></button>
        <button class="wx-fmt-btn" :class="{ active: editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()" title="斜体"><em>I</em></button>
        <button class="wx-fmt-btn" :class="{ active: editor.isActive('underline') }" @click="editor.chain().focus().toggleUnderline().run()" title="下划线"><u>U</u></button>
        <button class="wx-fmt-btn" :class="{ active: editor.isActive('strike') }" @click="editor.chain().focus().toggleStrike().run()" title="删除线"><s>S</s></button>
        <span class="wx-format-divider"></span>
        <select class="wx-fmt-select" :value="currentFontSize" @change="setFontSize($event.target.value)" title="字体大小">
          <option v-for="s in fontSizes" :key="s" :value="s">{{ s }}px</option>
        </select>
        <select class="wx-fmt-select" :value="currentAlign" @change="setAlign($event.target.value)" title="对齐">
          <option value="left">左对齐</option>
          <option value="center">居中</option>
          <option value="right">右对齐</option>
        </select>
        <select class="wx-fmt-select" :value="currentLineHeight" @change="setLineHeight($event.target.value)" title="行距">
          <option v-for="v in lineHeights" :key="v" :value="v">{{ v }}</option>
        </select>
        <span class="wx-format-divider"></span>
        <button class="wx-fmt-btn" :class="{ active: editor.isActive('bulletList') }" @click="editor.chain().focus().toggleBulletList().run()" title="无序列表">•</button>
        <button class="wx-fmt-btn" :class="{ active: editor.isActive('orderedList') }" @click="editor.chain().focus().toggleOrderedList().run()" title="有序列表">1.</button>
        <button class="wx-fmt-btn" :class="{ active: editor.isActive('blockquote') }" @click="editor.chain().focus().toggleBlockquote().run()" title="引用">❝</button>
        <button class="wx-fmt-btn" @click="editor.chain().focus().setHorizontalRule().run()" title="分割线">—</button>
        <span class="wx-format-divider"></span>
        <button class="wx-fmt-btn" :class="{ active: editor.isActive('heading', { level: 1 }) }" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
        <button class="wx-fmt-btn" :class="{ active: editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
        <button class="wx-fmt-btn" :class="{ active: editor.isActive('heading', { level: 3 }) }" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
        <span class="wx-format-divider"></span>
        <button class="wx-fmt-btn wx-insert-btn--primary" @click="openChartPicker" title="插入图表">📊</button>
        <button class="wx-fmt-btn wx-insert-btn--primary" @click="openMapPicker" title="插入地图">🗺️</button>
        <span class="wx-insert-hint">图表：{{ chartCount }} · 地图：{{ mapCount }}</span>
      </div>
      <!-- 编辑器主体 -->
      <div class="editor-wrapper">
        <div class="editor-body" :class="{ 'is-focused': editorFocused }">
          <editor-content :editor="editor" class="editor-content" />
        </div>
      </div>
    </section>

    <!-- 发布设置 -->
    <section class="form-panel">
      <div class="panel-title">发布设置</div>

      <van-form>
        <van-field name="visibility" label="可见性">
          <template #input>
            <van-radio-group v-model="articleForm.visibility" direction="horizontal">
              <van-radio name="PUBLIC">公开</van-radio>
              <van-radio name="LOGIN">登录可见</van-radio>
              <van-radio name="PAID">付费可见</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field name="isPaid" label="是否付费">
          <template #input>
            <van-radio-group v-model="articleForm.isPaid" direction="horizontal">
              <van-radio value="0">否</van-radio>
              <van-radio value="1">是</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field
          v-model="articleForm.canonicalUrl"
          label="规范 URL"
          placeholder="可选"
        />
      </van-form>
    </section>

    <!-- SEO 设置 -->
    <section class="form-panel">
      <div class="panel-title">SEO 设置</div>

      <van-form>
        <van-field
          v-model="articleForm.seoTitle"
          label="SEO 标题"
          placeholder="为空默认使用文章标题"
        />
        <div class="field-tip">建议 20-60 字</div>

        <van-field
          v-model="articleForm.seoDescription"
          label="SEO 描述"
          type="textarea"
          placeholder="为空默认使用摘要"
          :rows="3"
        />
        <div class="field-tip">建议 80-160 字</div>

      </van-form>
    </section>

    <!-- 图表引用检查 -->
    <section class="form-panel">
      <div class="panel-title">图表引用检查</div>
      <div v-if="chartSlugs.length > 0" class="chart-check">
        <div class="chart-check__header">已引用 {{ chartSlugs.length }} 个图表</div>
        <div v-for="slug in chartSlugs" :key="slug" class="chart-check__item">
          <code>{{ slug }}</code>
        </div>
      </div>
      <div v-else class="empty-text">暂无图表引用</div>
    </section>

    <!-- 地图引用检查 -->
    <section class="form-panel">
      <div class="panel-title">地图引用检查</div>
      <div v-if="mapTokens.length > 0" class="chart-check">
        <div class="chart-check__header">已引用 {{ mapTokens.length }} 个地图</div>
        <div v-for="token in mapTokens" :key="token" class="chart-check__item">
          <code>{{ token }}</code>
        </div>
      </div>
      <div v-else class="empty-text">暂无地图引用</div>
    </section>

    <!-- 提交按钮 -->
    <div class="form-actions">
      <van-button round block type="primary" @click="handleSave" :loading="saving">
        保存草稿
      </van-button>
    </div>

    <div class="form-actions" v-if="articleForm.id">
      <van-button round block type="success" :loading="publishing" @click="handlePublish">
        发布
      </van-button>
    </div>

    <ChartPickerDialog v-model="chartPickerVisible" :wechat-account-ids="wechatAccountIds" @select="onChartSelect" />

    <MapPickerDialog v-model="mapPickerVisible" :wechat-account-ids="wechatAccountIds" @select="onMapSelect" />

    <ArticlePreviewDrawer v-model="previewVisible" :article="previewData" />

    <van-dialog v-model:show="publishDialogVisible" title="发布确认" show-cancel-button @confirm="confirmPublish" :before-close="onPublishBeforeClose" @open="onPublishDialogOpen">
      <div class="publish-confirm">
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">发布目标：</span>
          <div class="publish-confirm__targets">
            <van-checkbox v-model="targetSiteWendao" shape="square" :disabled="isTargetDisabled('SITE_WENDAO')">SpaceMV问道</van-checkbox>
            <van-checkbox v-model="targetWechat" shape="square" :disabled="isTargetDisabled('WECHAT_OFFICIAL_ACCOUNT')">微信公众号</van-checkbox>
          </div>
        </div>
        <div v-if="targetWechat" class="publish-confirm__item">
          <span class="publish-confirm__label">公众号账号：</span>
          <van-field
            v-model="selectedAccountId"
            is-link
            readonly
            :placeholder="wechatAccounts.length ? '请选择微信公众号账号' : '暂无可用账号'"
            @click="showWechatAccountPicker = true"
          />
        </div>
        <div v-if="publishRecords.length > 0" class="publish-records-section">
          <div class="publish-records-title">已发布的平台</div>
          <PublishRecordCard
            :article-id="articleForm.id"
            :records="publishRecords"
            @retry-success="onRetrySuccess"
            @confirm-published="onConfirmPublished"
            @ignore="onIgnorePlatform"
          />
        </div>
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">文章标题：</span>
          <span>{{ articleForm.title }}</span>
        </div>
        <div v-if="targetSiteWendao" class="publish-confirm__item">
          <span class="publish-confirm__label">Slug：</span>
          <code>{{ articleForm.slug }}</code>
        </div>
        <div v-if="targetSiteWendao" class="publish-confirm__item">
          <span class="publish-confirm__label">预计 URL：</span>
          <code>/blog/{{ articleForm.slug }}</code>
        </div>
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">SEO 标题：</span>
          <span>{{ articleForm.seoTitle || articleForm.title }}</span>
        </div>
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">SEO 描述：</span>
          <span>{{ articleForm.seoDescription || articleForm.summary }}</span>
        </div>
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">引用图表数量：</span>
          <span>{{ chartCount }}</span>
        </div>
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">引用地图数量：</span>
          <span>{{ mapCount }}</span>
        </div>
        <div v-if="!hasAnyTarget" class="publish-confirm__tip">请至少选择一个发布目标</div>
      </div>
    </van-dialog>

    <van-action-sheet v-model:show="showWechatAccountPicker" title="选择微信公众号账号">
      <van-radio-group v-model="selectedAccountId" class="account-radio-group">
        <van-cell-group>
          <van-cell v-for="acc in wechatAccounts" :key="acc.id" :title="acc.accountName" @click="selectedAccountId = acc.id; showWechatAccountPicker = false">
            <template #right-icon>
              <van-radio :name="acc.id" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </van-action-sheet>

    <van-dialog v-model:show="wechatDraftDialogVisible" title="保存选项" show-cancel-button @confirm="confirmSave">
      <div style="font-size: 14px; line-height: 1.6; padding: 16px;">
        <van-radio-group v-model="saveMode" direction="vertical" style="display:flex;flex-direction:column;gap:16px;">
          <van-radio name="save_only" shape="square">
            <div>
              <strong>仅保存草稿</strong>
              <div style="font-size:12px;color:#909399;margin-top:2px;">只保存到系统草稿箱，不同步到微信</div>
            </div>
          </van-radio>
          <van-radio name="save_and_sync" shape="square">
            <div>
              <strong>保存并同步到微信草稿箱</strong>
              <div style="font-size:12px;color:#909399;margin-top:2px;">保存到系统草稿箱后，自动同步到微信公众号</div>
            </div>
          </van-radio>
        </van-radio-group>

        <van-field
          v-if="saveMode === 'save_and_sync'"
          v-model="wechatDraftAccountId"
          label="公众号账号"
          is-link
          readonly
          :placeholder="wechatAccounts.length ? '请选择微信公众号账号' : '暂无可用账号'"
          @click="showWechatDraftAccountPicker = true"
          style="margin-top:12px;"
        />

        <van-checkbox v-model="rememberSaveChoice" shape="square" style="margin-top: 16px; font-size: 13px;">
          记住选择，下次不再显示
        </van-checkbox>
      </div>
    </van-dialog>

    <van-action-sheet v-model:show="showWechatDraftAccountPicker" title="选择微信公众号账号">
      <van-radio-group v-model="wechatDraftAccountId" class="account-radio-group">
        <van-cell-group>
          <van-cell v-for="acc in wechatAccounts" :key="acc.id" :title="acc.accountName" @click="wechatDraftAccountId = acc.id; showWechatDraftAccountPicker = false">
            <template #right-icon>
              <van-radio :name="acc.id" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </van-action-sheet>

    <van-dialog v-model:show="coverPickerVisible" title="选择封面图">
      <div style="min-height: 100px; padding: 16px;">
        <div v-if="coverPickerLoading" style="text-align:center;padding:40px 0;color:#999;">加载中...</div>
        <div v-else-if="coverPickerMaterials.length === 0" style="text-align:center;padding:40px 0;color:#999;">暂无素材，请先在素材库上传</div>
        <div v-else class="cover-material-grid">
          <div
            v-for="item in coverPickerMaterials"
            :key="item.mediaId"
            class="cover-material-item"
            :class="{ selected: isCoverMaterialSelected(item) }"
            @click="selectCoverMaterial(item)"
          >
            <img :src="getCoverMaterialDisplayUrl(item)" :alt="item.name" referrerpolicy="no-referrer" />
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <van-button @click="coverPickerVisible = false">取消</van-button>
        <van-button type="primary" @click="loadCoverPickerMaterials">刷新</van-button>
      </template>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getArticle, addArticle, updateArticle, publishToMultiPlatform, publishArticleToSite, listPublishRecords, saveDraftToWeChat } from '@/api/content/article'
import { getTemplate } from '@/api/content/template'
import { getMediaProductList } from '@/api/media/mediaProduct/index'
import { getPermanentMaterialsList } from '@/api/material/permanentMaterials'
import { ARTICLE_STATUS, TARGET_CODE_MAP } from '../article/constants'
import { templateContents } from '../article/template-data'
import { getWechatDisplayUrl } from '@/utils'
import settings from '@/settings'
import ChartPickerDialog from '../article/components/ChartPickerDialog.vue'
import MapPickerDialog from '../article/components/MapPickerDialog.vue'
import ArticlePreviewDrawer from '../article/components/ArticlePreviewDrawer.vue'
import PublishRecordCard from '../article/components/PublishRecordCard.vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import ImageExtension from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { ChartNode } from '../article/tiptap-extensions/ChartNode'
import { MapNode } from '../article/tiptap-extensions/MapNode'
import { StyledSection } from '../article/tiptap-extensions/StyledSection'
import { FontSize } from '../article/tiptap-extensions/FontSize'
import { LineHeight } from '../article/tiptap-extensions/LineHeight'
import { LetterSpacing } from '../article/tiptap-extensions/LetterSpacing'
import { RowSpacing } from '../article/tiptap-extensions/RowSpacing'
import { Indent } from '../article/tiptap-extensions/Indent'
import { ClearFormatting } from '../article/tiptap-extensions/ClearFormatting'

defineOptions({
  name: 'MobileContentArticleEdit'
})

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.query.id)
const saving = ref(false)
const publishing = ref(false)
const editorFocused = ref(false)

const articleForm = ref({
  id: '',
  title: '',
  slug: '',
  summary: '',
  coverUrl: '',
  coverDisplayUrl: '',
  coverMediaId: '',
  coverAccountId: null,
  authorId: '',
  authorName: '',
  contentHtml: '',
  contentMarkdown: '',
  contentJson: '',
  status: 'DRAFT',
  visibility: 'PUBLIC',
  isPaid: '0',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  canonicalUrl: '',
  tags: ''
})

// 封面图
const coverPickerVisible = ref(false)
const coverPickerLoading = ref(false)
const coverPickerMaterials = ref([])

const getCoverMaterialPreviewUrl = (item) => item?.url || item?.sourceUrl || ''
const getCoverMaterialDisplayUrl = (item) => getWechatDisplayUrl(getCoverMaterialPreviewUrl(item))
const getCoverMaterialSourceUrl = (item) => item?.sourceUrl || item?.url || ''

const isCoverMaterialSelected = (item) => {
  const sourceUrl = getCoverMaterialSourceUrl(item)
  return !!sourceUrl && articleForm.value.coverUrl === sourceUrl
}

const selectCoverMaterial = (item) => {
  articleForm.value.coverUrl = getCoverMaterialSourceUrl(item)
  articleForm.value.coverDisplayUrl = getCoverMaterialPreviewUrl(item)
  articleForm.value.coverMediaId = item?.mediaId || ''
  articleForm.value.coverAccountId = item?.accountId || null
  coverPickerVisible.value = false
}

watch(coverPickerVisible, (val) => {
  if (val) loadCoverPickerMaterials()
})

const loadCoverPickerMaterials = async () => {
  if (wechatAccounts.value.length === 0) {
    await loadWechatAccounts()
  }
  if (wechatAccounts.value.length === 0) return
  coverPickerLoading.value = true
  try {
    const accountIds = wechatAccounts.value.map(a => a.id)
    const res = await getPermanentMaterialsList({
      pageNum: 1,
      pageSize: 20,
      accountIds
    })
    if (res.code === 200) {
      coverPickerMaterials.value = res.data?.list || res.data || []
    } else {
      coverPickerMaterials.value = []
    }
  } catch {
    coverPickerMaterials.value = []
  } finally {
    coverPickerLoading.value = false
  }
}

// ---- TipTap Editor ----
const editor = useEditor({
  content: '',
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({ placeholder: '开始撰写正文...' }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ImageExtension,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    FontSize,
    LineHeight,
    LetterSpacing,
    RowSpacing,
    Indent,
    ClearFormatting,
    ChartNode,
    MapNode,
    StyledSection,
  ],
  onUpdate: () => {
    if (editor.value) {
      articleForm.value.contentHtml = editor.value.getHTML()
      articleForm.value.contentJson = JSON.stringify(editor.value.getJSON())
    }
  },
  onFocus: () => { editorFocused.value = true },
  onBlur: () => { editorFocused.value = false },
  editorProps: {
    attributes: { class: 'prose-editor' }
  }
})

const fontSizes = [12, 14, 15, 16, 17, 18, 20, 24]
const lineHeights = [1, 1.5, 1.6, 1.75, 2, 3, 4, 5]
const letterSpacings = ['0', '0.5', '1', '2']

const currentFontSize = computed(() => {
  if (!editor.value) return 16
  return editor.value.getAttributes('textStyle').fontSize || 16
})

const currentAlign = computed(() => {
  if (!editor.value) return 'left'
  return ['left', 'center', 'right', 'justify'].find(d => editor.value.isActive({ textAlign: d })) || 'left'
})

const currentLineHeight = computed(() => {
  if (!editor.value) return 1.6
  return editor.value.getAttributes('paragraph').lineHeight || editor.value.getAttributes('heading').lineHeight || 1.6
})

const setFontSize = (size) => {
  if (!editor.value) return
  if (size) {
    editor.value.chain().focus().setFontSize(size).run()
  } else {
    editor.value.chain().focus().unsetFontSize().run()
  }
}

const setAlign = (align) => {
  if (!editor.value) return
  editor.value.chain().focus().setTextAlign(align).run()
}

const setLineHeight = (v) => {
  if (!editor.value) return
  if (v) {
    editor.value.chain().focus().setLineHeight(v).run()
  } else {
    editor.value.chain().focus().unsetLineHeight().run()
  }
}

const coverPreview = computed(() => {
  const url = articleForm.value.coverDisplayUrl || articleForm.value.coverUrl || ''
  return getWechatDisplayUrl(url)
})

// 标签
const tagInput = ref('')
const tagsArray = computed(() =>
  articleForm.value.tags ? articleForm.value.tags.split(',').map(t => t.trim()).filter(Boolean) : []
)

const addTag = () => {
  const val = tagInput.value.trim()
  if (val && !tagsArray.value.includes(val)) {
    const arr = [...tagsArray.value, val]
    articleForm.value.tags = arr.join(',')
  }
  tagInput.value = ''
}

const removeTag = (idx) => {
  const arr = tagsArray.value.filter((_, i) => i !== idx)
  articleForm.value.tags = arr.join(',')
}

// 图表
const chartRegex = /\{\{chart:([a-zA-Z0-9-_]+)\}\}/g
const chartSpanRegex = /data-chart-slug\s*=\s*["']([a-zA-Z0-9-_]+)["']/g
const chartClassRegex = /alt\s*=\s*["']chart:([a-zA-Z0-9-_]+)["'][^>]*>\s*<\/(?:span|div)>/g

const chartSlugs = computed(() => {
  const slugs = []
  const html = articleForm.value.contentHtml || ''
  let match
  while ((match = chartRegex.exec(html)) !== null) {
    if (!slugs.includes(match[1])) {
      slugs.push(match[1])
    }
  }
  while ((match = chartSpanRegex.exec(html)) !== null) {
    if (!slugs.includes(match[1])) slugs.push(match[1])
  }
  while ((match = chartClassRegex.exec(html)) !== null) {
    if (!slugs.includes(match[1])) slugs.push(match[1])
  }
  return slugs
})

const chartCount = computed(() => chartSlugs.value.length)

// 地图
const mapRegex = /\{\{map:([a-zA-Z0-9-_]+)\}\}/g
const mapSpanRegex = /data-map-token\s*=\s*["']([a-zA-Z0-9-_]+)["']/g
const mapClassRegex = /alt\s*=\s*["']map:([a-zA-Z0-9-_]+)["'][^>]*>\s*<\/(?:span|div)>/g

const mapTokens = computed(() => {
  const tokens = []
  const html = articleForm.value.contentHtml || ''
  let match
  while ((match = mapRegex.exec(html)) !== null) {
    if (!tokens.includes(match[1])) {
      tokens.push(match[1])
    }
  }
  while ((match = mapSpanRegex.exec(html)) !== null) {
    if (!tokens.includes(match[1])) tokens.push(match[1])
  }
  while ((match = mapClassRegex.exec(html)) !== null) {
    if (!tokens.includes(match[1])) tokens.push(match[1])
  }
  return tokens
})

const mapCount = computed(() => mapTokens.value.length)

const chartPickerVisible = ref(false)
const mapPickerVisible = ref(false)
const previewVisible = ref(false)
const publishDialogVisible = ref(false)
const showWechatAccountPicker = ref(false)

const targetSiteWendao = ref(true)
const targetWechat = ref(false)
const wechatAccounts = ref([])
const wechatAccountIds = computed(() => wechatAccounts.value.map(a => a.id))
const selectedAccountId = ref(null)

const hasAnyTarget = computed(() => targetSiteWendao.value || targetWechat.value)

const isTargetDisabled = (targetCode) => {
  if (targetCode === 'WECHAT_OFFICIAL_ACCOUNT') {
    return wechatAccounts.value.length === 0
  }
  return false
}

// 发布记录
const publishRecords = ref([])
const loadPublishRecords = async () => {
  if (!articleForm.value.id) return
  try {
    const res = await listPublishRecords(articleForm.value.id)
    if (res.code === 200 && res.data) {
      publishRecords.value = res.data
    }
  } catch {
    // 静默失败
  }
}
const onRetrySuccess = async () => { await loadPublishRecords() }
const onConfirmPublished = async () => { await loadPublishRecords() }
const onIgnorePlatform = () => { loadPublishRecords() }

const loadWechatAccounts = async () => {
  try {
    const res = await getMediaProductList({
      pageNum: 1,
      pageSize: 1000000,
      queryConfig: { queryProduct: true, queryChannels: true, queryAccount: true }
    })
    if (res.code === 200) {
      const rawProducts = res.rows || res.data?.rows || res.data || []
      const accounts = []
      rawProducts.forEach(item => {
        const channels = item.channelDTOList || []
        channels.forEach(channel => {
          if (channel.channelType === 'wechat' && Array.isArray(channel.accountDTOList)) {
            channel.accountDTOList.forEach(acc => {
              if (acc.id) accounts.push({ id: acc.id, accountName: acc.accountName || channel.channelName })
            })
          }
        })
      })
      wechatAccounts.value = accounts
    }
  } catch {
    wechatAccounts.value = []
  }
}

const onPublishDialogOpen = async () => {
  targetSiteWendao.value = true
  targetWechat.value = false
  selectedAccountId.value = null

  await loadPublishRecords()
  await loadWechatAccounts()
}

const previewData = computed(() => ({
  ...articleForm.value,
  contentHtml: articleForm.value.contentHtml
}))

const loadArticle = async () => {
  const id = route.query.id
  if (!id) return

  try {
    const res = await getArticle(id)
    if (res.code === 200 && res.data) {
      const data = res.data
      articleForm.value = {
        id: data.id || '',
        title: data.title || '',
        slug: data.slug || '',
        summary: data.summary || '',
        coverUrl: data.coverUrl || '',
        coverDisplayUrl: data.coverDisplayUrl || '',
        coverMediaId: data.coverMediaId || '',
        coverAccountId: data.coverAccountId || null,
        authorId: data.authorId || '',
        authorName: data.authorName || '',
        contentHtml: data.contentHtml || '',
        contentMarkdown: data.contentMarkdown || '',
        contentJson: data.contentJson || '',
        status: data.status || 'DRAFT',
        visibility: data.visibility || 'PUBLIC',
        isPaid: data.isPaid || '0',
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        seoKeywords: data.seoKeywords || '',
        canonicalUrl: data.canonicalUrl || '',
        tags: data.tags || ''
      }
      loadArticleContent(data)
    } else {
      showToast(res.msg || '获取文章详情失败')
    }
  } catch {
    showToast('获取文章详情失败')
  }
}

function loadArticleContent(data) {
  if (!editor.value || editor.value.isDestroyed) {
    articleForm.value.contentHtml = data.contentHtml || ''
    articleForm.value.contentJson = data.contentJson || ''
    return
  }
  if (data.contentJson) {
    try {
      const json = typeof data.contentJson === 'string' ? JSON.parse(data.contentJson) : data.contentJson
      editor.value.commands.setContent(json)
      return
    } catch {
      // fallback to html
    }
  }
  if (data.contentHtml) {
    editor.value.commands.setContent(data.contentHtml, true)
  }
}

const loadTemplate = async (templateId) => {
  const cached = templateContents[templateId]
  if (cached && editor.value && !editor.value.isDestroyed) {
    editor.value.commands.setContent(cached, true)
    return
  }
  try {
    const res = await getTemplate(templateId)
    if (res.code === 200 && res.data) {
      const tpl = res.data
      if (tpl.contentHtml && editor.value && !editor.value.isDestroyed) {
        editor.value.commands.setContent(tpl.contentHtml, true)
      } else if (tpl.snapshotJson && editor.value && !editor.value.isDestroyed) {
        const content = typeof tpl.snapshotJson === 'string'
          ? JSON.parse(tpl.snapshotJson)
          : tpl.snapshotJson
        editor.value.commands.setContent(content)
      }
    }
  } catch {
    showToast('加载模板失败')
  }
}

const onTitleInput = (val) => {
  if (!isEdit.value && !articleForm.value.slug) {
    articleForm.value.slug = val
      ? 'article-' + Date.now()
      : ''
  }
}

const onSlugInput = (val) => {
  articleForm.value.slug = val
    ? val.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : ''
}

function escapeHtmlAttrQuotes(html) {
  return html.replace(/<[^>]+>/g, (tag) => {
    return tag.replace(/([\w-]+)=(["'])(.*?)\2/g, (m, name, quote, value) => {
      return `${name}='${value.replace(/'/g, '&apos;')}'`
    })
  })
}

const restoreStaticUrl = (url) => {
  if (!url || !import.meta.env.DEV) return url
  if (typeof url === 'string' && url.startsWith('/statics/') && settings.staticAssetBaseUrl) {
    return settings.staticAssetBaseUrl + url
  }
  return url
}

const restoreStaticUrlsInHtml = (html) => {
  if (!html || !import.meta.env.DEV) return html
  if (!settings.staticAssetBaseUrl) return html
  return html.replace(/src=["']\/statics\//g, `src="${settings.staticAssetBaseUrl}/statics/`)
}

function stripInteractivePrompts(html) {
  return html.replace(/<section[^>]*>[\s\S]*?(?:查看图表|查看地图)[\s\S]*?<\/section>/gi, '')
}

function stripShortcodes(html) {
  return html.replace(/\{\{(?:chart|map):[^}]+\}\}/g, '')
}

function stripEditorArtifacts(html) {
  return html
    .replace(/<img\b[^>]*\bclass=(["'])[^"']*\bProseMirror-separator\b[^"']*\1[^>]*>/gi, '')
    .replace(/<br\b[^>]*\bclass=(["'])[^"']*\bProseMirror-trailingBreak\b[^"']*\1[^>]*>/gi, '<br>')
}

function normalizeWendaoTitleOffsets(html) {
  return html.replace(/<section\b[^>]*\bstyle=(["'])([^"']*margin-left:\s*)0(?:px)?(\s*;[^"']*?)(?:position\s*:\s*relative\s*;\s*)?left\s*:\s*-8px\s*;?([^"']*)\1[^>]*>/gi, (tag, quote, before, middle, after) => {
    const style = `${before}-8px${middle}${after}`
      .replace(/;\s*;/g, ';')
      .replace(/\s{2,}/g, ' ')
      .trim()
    return tag.replace(/\bstyle=(["'])(.*?)\1/i, `style=${quote}${style}${quote}`)
  })
}

function stripWechatRuntimeAttrs(tag) {
  return tag
    .replace(/\sid=(["'])js_content\1/gi, '')
    .replace(/\sdata-src=(["'])(.*?)\1/gi, '')
    .replace(/\sdata-css=(["'])(.*?)\1/gi, '')
    .replace(/\sdata-lazy-bgimg=(["'])(.*?)\1/gi, '')
    .replace(/\salign=(["'])(.*?)\1/gi, '')
    .replace(/\scontenteditable=(["'])(.*?)\1/gi, '')
}

function stripWechatRuntimeClassTokens(tag) {
  return tag.replace(/\sclass=(["'])(.*?)\1/gi, (match, quote, value) => {
    const className = value
      .split(/\s+/)
      .filter(Boolean)
      .filter(name => !['rich_media_content', 'js_underline_content', 'autoTypeSetting24psection'].includes(name))
      .join(' ')
    return className ? ` class=${quote}${className}${quote}` : ''
  })
}

function normalizeWechatDraftHtml(html) {
  if (!html) return html
  return normalizeWendaoTitleOffsets(stripEditorArtifacts(html)).replace(/<[^>]+>/g, (tag) => {
    let next = tag
    if (/^<img\b/i.test(next) && !/\ssrc=(["']).*?\1/i.test(next)) {
      next = next.replace(/\sdata-src=(["'])(.*?)\1/i, ' src=$1$2$1')
    }
    return stripWechatRuntimeClassTokens(stripWechatRuntimeAttrs(next))
  })
}

function buildWenDaoContentHtml(html) {
  return html
    .replace(/(<(?:span|div)[^>]*?data-chart-slug\s*=\s*["'][^"']*["'][^>]*?>)\s*<img[^>]*?>\s*/g, '$1')
    .replace(/(<(?:span|div)[^>]*?data-map-token\s*=\s*["'][^"']*["'][^>]*?>)\s*<img[^>]*?>\s*/g, '$1')
    .replace(/(<(?:span|div)[^>]*?\bclass\s*=\s*["'][^"']*\bchart-node\b[^"']*["'][^>]*?>)\s*<img[^>]*?>\s*/g, '$1')
    .replace(/(<(?:span|div)[^>]*?\bclass\s*=\s*["'][^"']*\bmap-node\b[^"']*["'][^>]*?>)\s*<img[^>]*?>\s*/g, '$1')
}

function buildSaveData() {
  const rawHtml = editor.value?.getHTML() || articleForm.value.contentHtml
  const rawJson = editor.value ? JSON.stringify(editor.value.getJSON()) : articleForm.value.contentJson
  const wechatHtml = normalizeWechatDraftHtml(stripShortcodes(stripInteractivePrompts(restoreStaticUrlsInHtml(rawHtml))))
  return {
    id: articleForm.value.id,
    title: articleForm.value.title,
    slug: articleForm.value.slug,
    summary: articleForm.value.summary,
    coverUrl: restoreStaticUrl(articleForm.value.coverUrl),
    tags: articleForm.value.tags,
    authorId: articleForm.value.authorId,
    authorName: articleForm.value.authorName,
    status: articleForm.value.status,
    visibility: articleForm.value.visibility,
    isPaid: articleForm.value.isPaid,
    seoTitle: articleForm.value.seoTitle,
    seoDescription: articleForm.value.seoDescription,
    seoKeywords: articleForm.value.seoKeywords,
    canonicalUrl: restoreStaticUrl(articleForm.value.canonicalUrl),
    contentMarkdown: articleForm.value.contentMarkdown,
    contentHtml: escapeHtmlAttrQuotes(wechatHtml),
    wenDaoContentHtml: escapeHtmlAttrQuotes(buildWenDaoContentHtml(restoreStaticUrlsInHtml(rawHtml))),
    contentJson: rawJson
  }
}

const SAVE_PREF_KEY = 'editor_save_preference'

const handleSave = async () => {
  if (!articleForm.value.title) {
    showToast('请输入文章标题')
    return
  }
  if (!articleForm.value.slug) {
    showToast('请输入 slug')
    return
  }

  if (wechatAccounts.value.length === 0) {
    await loadWechatAccounts()
  }

  const pref = loadSavePreference()
  if (pref) {
    await doSave(pref.mode === 'save_and_sync', pref.accountId)
    return
  }

  saveMode.value = 'save_only'
  wechatDraftAccountId.value = null
  rememberSaveChoice.value = false
  wechatDraftDialogVisible.value = true
}

const loadSavePreference = () => {
  try {
    const raw = localStorage.getItem(SAVE_PREF_KEY)
    if (raw) {
      const pref = JSON.parse(raw)
      if (pref.mode === 'save_only') return pref
      if (pref.mode === 'save_and_sync' && pref.accountId && wechatAccounts.value.some(a => a.id === pref.accountId)) {
        return pref
      }
    }
  } catch { /* ignore */ }
  return null
}

const savePreference = (mode, accountId) => {
  try {
    localStorage.setItem(SAVE_PREF_KEY, JSON.stringify({ mode, accountId: accountId || null }))
  } catch { /* ignore */ }
}

const doSave = async (syncToWechat, accountId) => {
  saving.value = true
  try {
    const data = buildSaveData()
    const res = isEdit.value
      ? await updateArticle(articleForm.value.id, data)
      : await addArticle(data)
    if (res.code === 200) {
      if (res.data?.id) {
        articleForm.value = { ...articleForm.value, ...res.data }
      }
      if (!isEdit.value && res.data?.id) {
        await router.replace(`/contentCenter/article/edit?id=${res.data.id}`)
      }

      if (syncToWechat && accountId) {
        try {
          await saveDraftToWeChat(articleForm.value.id || res.data?.id, { accountId })
          showToast('保存成功，已同步到微信草稿箱')
        } catch {
          showToast('保存成功，但同步微信草稿箱失败')
        }
      } else {
        showToast('保存成功')
      }

      wechatDraftDialogVisible.value = false
    } else {
      showToast(res.msg || '保存失败')
    }
  } catch {
    showToast('保存失败')
  } finally {
    saving.value = false
  }
}

const wechatDraftDialogVisible = ref(false)
const wechatDraftAccountId = ref(null)
const showWechatDraftAccountPicker = ref(false)
const saveMode = ref('save_only')
const rememberSaveChoice = ref(false)
const savingWechatDraft = ref(false)

const confirmSave = async () => {
  savingWechatDraft.value = true
  try {
    if (rememberSaveChoice.value) {
      savePreference(saveMode.value, wechatDraftAccountId.value)
    }
    if (saveMode.value === 'save_and_sync') {
      if (!wechatDraftAccountId.value) {
        showToast('请选择微信公众号账号')
        savingWechatDraft.value = false
        return
      }
      await doSave(true, wechatDraftAccountId.value)
    } else {
      await doSave(false)
    }
  } finally {
    savingWechatDraft.value = false
  }
}

const handlePreview = () => {
  previewVisible.value = true
}

const openChartPicker = async () => {
  if (wechatAccounts.value.length === 0) {
    await loadWechatAccounts()
  }
  chartPickerVisible.value = true
}

const onChartSelect = ({ slug, imageUrl, wechatImageUrl }) => {
  if (editor.value && !editor.value.isDestroyed) {
    editor.value.chain().focus().insertContent({
      type: 'chart',
      attrs: { slug, imageUrl: imageUrl || null, wechatImageUrl: wechatImageUrl || null }
    }).insertContent(' ').run()
  }
  chartPickerVisible.value = false
}

const openMapPicker = async () => {
  if (wechatAccounts.value.length === 0) {
    await loadWechatAccounts()
  }
  mapPickerVisible.value = true
}

const onMapSelect = ({ token, imageUrl, wechatImageUrl }) => {
  if (editor.value && !editor.value.isDestroyed) {
    editor.value.chain().focus().insertContent({
      type: 'map',
      attrs: { token, imageUrl: imageUrl || null, wechatImageUrl: wechatImageUrl || null }
    }).insertContent(' ').run()
  }
  mapPickerVisible.value = false
}

const checkCharts = () => {}

const handlePublish = async () => {
  if (!articleForm.value.id) {
    showToast('请先保存草稿')
    return
  }
  publishDialogVisible.value = true
}

const onPublishBeforeClose = (action) => {
  return new Promise((resolve) => {
    if (action === 'confirm') {
      confirmPublish().then(resolve).catch(() => resolve(false))
    } else {
      resolve(true)
    }
  })
}

const confirmPublish = async () => {
  if (!articleForm.value.id) return
  const targets = []
  if (targetSiteWendao.value) {
    targets.push({ targetCode: 'SITE_WENDAO' })
  }
  if (targetWechat.value) {
    if (!selectedAccountId.value) {
      showToast('请选择微信公众号账号')
      return
    }
    targets.push({ targetCode: 'WECHAT_OFFICIAL_ACCOUNT', accountId: selectedAccountId.value })
  }
  if (targets.length === 0) return

  publishing.value = true
  try {
    const res = await publishToMultiPlatform(articleForm.value.id, targets)
    if (res.code === 200) {
      if (targetSiteWendao.value) {
        try {
          await publishArticleToSite(articleForm.value.id)
        } catch (e) {
          console.error('publishArticleToSite 失败:', e)
        }
      }
      showToast('发布成功')
      publishDialogVisible.value = false

      if (res.data && res.data.length > 0) {
        const siteResult = res.data.find(r => r.targetCode === 'SITE_WENDAO')
        if (siteResult) {
          if (siteResult.articleStatus) {
            articleForm.value.status = siteResult.articleStatus
          }
          if (siteResult.canonicalUrl) {
            articleForm.value.canonicalUrl = siteResult.canonicalUrl
          }
          if (siteResult.publishedAt) {
            articleForm.value.publishedAt = siteResult.publishedAt
          }
        }
      } else {
        const detailRes = await getArticle(articleForm.value.id)
        if (detailRes.code === 200 && detailRes.data) {
          Object.assign(articleForm.value, detailRes.data)
        }
      }
    } else {
      showToast(res.msg || '发布失败')
    }
  } catch {
    showToast('发布失败')
  } finally {
    publishing.value = false
  }
}

const handleBack = () => {
  router.push('/contentCenter/article')
}

let referrerMeta = null

onMounted(() => {
  // 页面级 referrer 策略：防止微信防盗链拦截图片
  referrerMeta = document.createElement('meta')
  referrerMeta.name = 'referrer'
  referrerMeta.content = 'no-referrer'
  document.head.appendChild(referrerMeta)

  if (route.query.id) {
    loadArticle()
  } else if (route.query.templateId) {
    loadTemplate(route.query.templateId)
  }
})

onBeforeUnmount(() => {
  if (referrerMeta) referrerMeta.remove()
  if (editor.value && !editor.value.isDestroyed) {
    editor.value.destroy()
  }
})
</script>

<style scoped lang="scss">
$page-top: #f7f9ff;
$page-bottom: #edf2fb;
$card-bg: rgba(255, 255, 255, 0.96);
$card-border: rgba(225, 231, 244, 0.95);
$card-shadow: 0 16px 34px rgba(106, 124, 163, 0.12);
$text-main: #3f4963;
$text-sub: #8f97ad;
$text-light: #a8b0c4;
$brand-start: #5f7cf0;
$brand-end: #7a8fe7;

.ignore-vw {
  &.mobile-article-editor {
    min-height: 100vh;
    min-height: 100dvh;
    padding: calc(env(safe-area-inset-top, 0px) + 16px) 16px calc(env(safe-area-inset-bottom, 0px) + 28px);
    background:
      radial-gradient(circle at 14% 10%, rgba(107, 126, 239, 0.15), rgba(107, 126, 239, 0) 26%),
      radial-gradient(circle at 86% 6%, rgba(111, 161, 224, 0.14), rgba(111, 161, 224, 0) 24%),
      linear-gradient(180deg, $page-top 0%, $page-bottom 100%);
    -webkit-font-smoothing: antialiased;
    box-sizing: border-box;
  }

  /* Hero 卡片 */
  .hero-card {
    margin-bottom: 12px;
    padding: 18px 16px;
    background: $card-bg;
    border: 1px solid $card-border;
    border-radius: 24px;
    box-shadow: $card-shadow;
    backdrop-filter: blur(16px);
  }

  .hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .hero-title {
    margin: 0;
    font-size: 20px;
    line-height: 1.3;
    font-weight: 700;
    color: $text-main;
  }

  .hero-badge {
    flex-shrink: 0;
  }

  .hero-desc {
    font-size: 13px;
    line-height: 18px;
    color: $text-sub;
    margin-bottom: 14px;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;

    :deep(.van-button) {
      font-size: 13px;
      min-height: 38px;
      font-weight: 600;
    }
  }

  /* 表单面板 */
  .form-panel {
    margin-bottom: 12px;
    padding: 16px;
    background: $card-bg;
    border: 1px solid $card-border;
    border-radius: 24px;
    box-shadow: $card-shadow;
    backdrop-filter: blur(16px);
  }

  .panel-title {
    font-size: 16px;
    line-height: 22px;
    font-weight: 700;
    color: $text-main;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid $card-border;
  }

  .article-form {
    :deep(.van-cell) {
      padding: 12px 0;
    }

    :deep(.van-field__label) {
      font-size: 13px;
      color: $text-sub;
      width: 80px;
    }

    :deep(.van-field__body input),
    :deep(.van-field__body textarea) {
      font-size: 14px;
      color: $text-main;
    }

    :deep(.van-radio-group--horizontal) {
      flex-wrap: wrap;
      gap: 8px;
    }

    :deep(.van-radio__label) {
      font-size: 14px;
    }
  }

  .field-tip {
    font-size: 12px;
    line-height: 16px;
    color: $text-light;
    padding: 0 0 8px 80px;
    margin-top: -4px;
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 0 10px;

    :deep(.van-button) {
      font-size: 12px;
      height: 30px;
      padding: 0 12px;
    }

    .toolbar-hint {
      font-size: 12px;
      color: $text-sub;
      margin-left: auto;

      strong {
        color: $brand-start;
      }
    }
  }

  .html-editor {
    :deep(.van-field__body textarea) {
      font-family: monospace;
      font-size: 13px;
      line-height: 1.5;
    }
  }

  .chart-check {
    &__header {
      font-size: 13px;
      color: $text-main;
      margin-bottom: 8px;
      font-weight: 600;
    }

    &__item {
      margin-bottom: 4px;

      code {
        font-family: monospace;
        font-size: 12px;
        background: #f5f7fa;
        padding: 2px 6px;
        border-radius: 4px;
        color: $brand-start;
      }
    }
  }

  .empty-text {
    text-align: center;
    padding: 16px 0;
    font-size: 14px;
    line-height: 20px;
    color: $text-light;
  }

  .form-actions {
    margin-bottom: 12px;

    :deep(.van-button) {
      min-height: 44px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 22px;
    }
  }

  :deep(.van-button) {
    min-height: 42px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 16px;
  }

  :deep(.van-button--primary) {
    border: none;
    background: linear-gradient(135deg, #5f7cf0 0%, #7a8fe7 100%);
    box-shadow: 0 12px 24px rgba(103, 121, 190, 0.18);
  }

  :deep(.van-button--plain.van-button--primary) {
    background: rgba(247, 249, 253, 0.96);
    color: #5d6bd8;
    border: 1px solid rgba(101, 114, 220, 0.24);
    box-shadow: none;
  }

  :deep(.van-button--small) {
    min-width: 76px;
    min-height: 34px;
    padding: 0 12px;
    font-size: 13px;
    border-radius: 12px;
  }

  .publish-confirm {
    padding: 8px 16px;

    &__item {
      font-size: 14px;
      line-height: 1.8;
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }

    &__label {
      color: $text-sub;
      white-space: nowrap;
    }

    &__targets {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__tip {
      font-size: 12px;
      color: #e74c3c;
      margin-top: 8px;
      text-align: center;
    }

    code {
      font-family: monospace;
      font-size: 12px;
      background: #f5f7fa;
      padding: 1px 4px;
      border-radius: 3px;
      word-break: break-all;
    }
  }

  .account-radio-group {
    :deep(.van-cell) {
      align-items: center;
    }
  }

  .cover-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .cover-preview {
    position: relative;
    width: 80px;
    height: 48px;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid $card-border;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .cover-overlay {
      opacity: 1;
    }
  }

  .cover-picker-placeholder {
    width: 80px;
    height: 48px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 11px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .cover-material-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .cover-material-item {
    width: 90px;
    border: 2px solid transparent;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s;
    text-align: center;

    img {
      width: 100%;
      height: 60px;
      object-fit: cover;
      display: block;
    }

    span {
      display: block;
      font-size: 11px;
      color: #666;
      padding: 4px 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover { border-color: $brand-start; }
    &.selected { border-color: $brand-start; box-shadow: 0 0 0 1px $brand-start; }
  }

  .tag-input-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;

    .tag-item {
      flex-shrink: 0;
    }

    .tag-field {
      flex: 1;
      min-width: 120px;
      padding: 0;
      background: transparent;

      .van-field__body input {
        font-size: 13px;
      }
    }
  }

  .publish-records-section {
    padding: 8px 0;
    border-top: 1px solid $card-border;
    margin-bottom: 8px;
  }

  .publish-records-title {
    font-size: 13px;
    font-weight: 600;
    color: $text-main;
    margin-bottom: 8px;
  }

  .editor-panel {
    padding-bottom: 8px;
  }

  .wx-format-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    padding: 8px 0;
    border-bottom: 1px solid #e4e7ed;
    margin-bottom: 8px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .wx-fmt-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: #303133;
    flex-shrink: 0;

    &:hover { background: #f5f7fa; }
    &.active { background: #ecf5ff; color: #409eff; }
    &:disabled { opacity: 0.3; cursor: default; }
  }

  .wx-fmt-select {
    height: 28px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 0 4px;
    font-size: 12px;
    color: #303133;
    background: #fff;
    flex-shrink: 0;
  }

  .wx-format-divider {
    width: 1px;
    height: 20px;
    background: #dcdfe6;
    flex-shrink: 0;
  }

  .wx-insert-hint {
    font-size: 11px;
    color: #909399;
    margin-left: auto;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .wx-insert-btn--primary {
    color: #409eff !important;
    font-weight: 600;
  }

  .editor-wrapper {
    min-height: 200px;
  }

  .editor-body {
    min-height: 180px;

    &.is-focused {
      .editor-content {
        outline: none;
      }
    }
  }

  .editor-content {
    :deep(.ProseMirror) {
      min-height: 180px;
      outline: none;
      padding: 8px 0;
      font-size: 15px;
      line-height: 1.8;
      color: #303133;

      p { margin: 0 0 8px; }
      h1 { font-size: 22px; font-weight: 700; margin: 16px 0 8px; }
      h2 { font-size: 18px; font-weight: 600; margin: 14px 0 6px; }
      h3 { font-size: 16px; font-weight: 600; margin: 12px 0 6px; }
      ul, ol { padding-left: 24px; margin: 0 0 8px; }
      li { margin-bottom: 4px; }
      blockquote {
        border-left: 3px solid #409eff;
        padding-left: 12px;
        color: #606266;
        margin: 8px 0;
      }
      img { max-width: 100%; height: auto; }
      pre {
        background: #f5f7fa;
        border-radius: 4px;
        padding: 12px;
        font-size: 13px;
        overflow-x: auto;
      }
      hr { border: none; border-top: 1px solid #dcdfe6; margin: 16px 0; }
      p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: #c0c4cc;
        pointer-events: none;
        height: 0;
      }
    }

    :deep(.chart-node-view),
    :deep(.map-node-view) {
      margin: 12px 0;
      padding: 8px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      background: #fafafa;
    }
  }
}

@media (min-width: 769px) {
  .ignore-vw.mobile-article-editor {
    padding: 24px;
  }

  .ignore-vw .hero-card,
  .ignore-vw .form-panel {
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>

<!-- Global overrides for imported shared components on mobile -->
<style lang="scss">
.ignore-vw {
  /* PublishRecordCard */
  .platform-label { font-size: 14px; }
  .record-meta { font-size: 13px; }
  .error-msg { font-size: 13px; }
  .no-records { font-size: 13px; }

  /* ArticlePreviewDrawer */
  .preview__title { font-size: 22px; }
  .preview__loading { font-size: 13px; }
  .preview__summary { font-size: 14px; }
  .preview__meta { font-size: 13px; }
  .preview__body { font-size: 15px; }
  .preview__wechat-empty { font-size: 14px; }
  .preview__seo h3 { font-size: 14px; }
  .preview__seo-item { font-size: 13px; }

  /* MapPickerDialog */
  .map-picker__tip { font-size: 12px; }
  .map-card__no-preview { font-size: 12px; }
  .map-card__id { font-size: 11px; }
  .map-card__name { font-size: 14px; }
  .map-card__desc { font-size: 12px; }
  .map-card__meta { font-size: 12px; }

  /* ChartPickerDialog / ChartPreview */
  .chart-preview__header { font-size: 12px; }
  .chart-preview__chart { height: 240px !important; }
  .chart-preview__loading { height: 240px !important; font-size: 13px; }
  .chart-preview__error { height: 240px !important; font-size: 13px; }

  /* ChartNode in editor */
  .chart-node-view__chart { height: 240px !important; }

  /* MapEmbed */
  .map-embed__fs-btn { font-size: 15px; }
  .map-embed__fallback-icon { font-size: 32px; }
  .map-embed__fallback-text { font-size: 15px; }
  .map-embed__fallback-sub { font-size: 13px; }
  .map-embed__fallback-link { font-size: 13px; }

  /* ============================================ */
  /* Element Plus Dialog / Drawer sizing (mobile) */
  /* ============================================ */
  .el-dialog {
    width: 95vw !important;
    max-width: 95vw !important;
    margin-top: 4vh !important;
    border-radius: 8px;
  }

  .el-dialog__header {
    padding: 14px 16px 8px;
  }

  .el-dialog__body {
    padding: 12px 16px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 8px 16px 14px;
  }

  .el-drawer {
    width: 100vw !important;
    max-width: 100vw !important;
  }

  .el-drawer__header {
    padding: 14px 16px 0;
    margin-bottom: 8px;
  }

  .el-drawer__body {
    padding: 12px 16px;
  }

  /* ============================================ */
  /* TemplatePickerDialog                         */
  /* ============================================ */
  .template-grid {
    grid-template-columns: 1fr !important;
  }

  .template-card {
    padding: 10px !important;
    gap: 10px !important;
  }

  .template-card__thumb {
    width: 60px !important;
    height: 46px !important;
  }

  /* ============================================ */
  /* ArticlePreviewDrawer                         */
  /* ============================================ */
  .preview__wechat-frame {
    min-height: 360px !important;
  }

  .preview-mode-tabs {
    margin-bottom: 12px !important;
  }

  .preview__body img {
    max-width: 100% !important;
    height: auto !important;
  }

  /* ============================================ */
  /* ChartPickerDialog                            */
  /* ============================================ */
  .chart-picker__layout {
    grid-template-columns: 1fr !important;
    min-height: auto !important;
  }

  .chart-picker__list {
    overflow-x: auto !important;
  }

  .chart-picker__filters {
    flex-wrap: wrap !important;
  }

  .chart-picker__preview {
    min-height: 200px;
  }

  .preview__chart {
    min-height: 180px;
  }

  .chart-picker .el-table {
    max-height: 250px !important;
  }

  /* ============================================ */
  /* MapPickerDialog                              */
  /* ============================================ */
  .map-picker__cards {
    grid-template-columns: 1fr !important;
  }

  .map-card__thumb {
    height: 72px !important;
  }

  .map-picker__list {
    max-height: none !important;
  }

  /* ============================================ */
  /* PublishRecordCard                            */
  /* ============================================ */
  .publish-record-card {
    padding: 10px 12px !important;
  }

  .record-header {
    margin-bottom: 6px !important;
  }

  .record-meta {
    flex-wrap: wrap !important;
    gap: 8px !important;
  }

  .ProseMirror {
    font-size: 15px;
    line-height: 1.8;
  }
  .ProseMirror h1 { font-size: 22px; }
  .ProseMirror h2 { font-size: 18px; }
  .ProseMirror h3 { font-size: 16px; }
}
</style>
