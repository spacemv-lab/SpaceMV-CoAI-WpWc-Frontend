<template>
  <div class="content-page" v-loading="pageLoading">
    <div class="editor-topbar">
      <h3 class="editor-topbar__title">{{ isEdit ? '编辑文章' : '新建文章' }}</h3>
      <div class="editor-topbar__actions">
        <el-button type="primary" :loading="saving" @click="handleSave">保存草稿</el-button>
        <el-button @click="handlePreview">预览</el-button>
        <el-button type="success" :loading="publishing" @click="handlePublish">发布</el-button>
      </div>
    </div>

    <div class="editor-layout">
      <div class="editor-main">
        <div class="editor-section">
          <h4 class="editor-section__title">基础信息</h4>
          <el-form :model="articleForm" label-width="100px" size="small" ref="formRef" :rules="formRules">
            <el-form-item label="文章标题" prop="title">
              <el-input v-model="articleForm.title" placeholder="请输入文章标题" maxlength="120" show-word-limit @input="onTitleInput" />
            </el-form-item>
            <el-form-item prop="slug">
              <template #label>
                <el-tooltip content="Slug 是 URL 中唯一标识文章的简短英文标识（如 us-core-cpi-guide），一旦发布不可修改，请谨慎填写" placement="top">
                  <span>Slug <el-icon class="slug-help-icon"><QuestionFilled /></el-icon></span>
                </el-tooltip>
              </template>
              <el-input v-model="articleForm.slug" placeholder="a-z、0-9、中划线" @input="onSlugInput" />
              <div class="form-tip">只允许小写字母、数字和中划线，例如：us-core-cpi-guide</div>
            </el-form-item>
            <el-form-item label="摘要">
              <el-input v-model="articleForm.summary" type="textarea" :rows="3" placeholder="用于列表、SEO 和分享卡片，建议 80-200 字" />
            </el-form-item>
            <el-form-item label="作者名称">
              <el-input v-model="articleForm.authorName" placeholder="作者名称" />
            </el-form-item>
            <el-form-item label="封面图">
              <div class="cover-picker-wrapper">
                <div v-if="articleForm.coverUrl" class="cover-preview" @click="coverPickerVisible = true">
                  <img :src="coverPreview" alt="封面" referrerpolicy="no-referrer" />
                  <div class="cover-overlay">点击更换</div>
                </div>
                <div v-else class="cover-picker-placeholder" @click="coverPickerVisible = true">
                  <el-icon size="24"><Picture /></el-icon>
                  <span>选择封面图</span>
                </div>
                <el-button size="small" type="primary" link @click="coverPickerVisible = true">从素材库选择</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div class="editor-section">
          <h4 class="editor-section__title">正文</h4>
          <div class="editor-toolbars">
            <!-- 媒体插入工具栏 -->
            <div class="wx-insert-toolbar">
              <button class="wx-insert-btn" @click="insertImage" title="插入图片">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                图片
              </button>
              <button class="wx-insert-btn" @click="insertVideo" title="插入视频">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                视频
              </button>
              <button class="wx-insert-btn" @click="insertAudio" title="插入音频">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                音频
              </button>
              <button class="wx-insert-btn" @click="insertLink" title="插入超链接">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                超链接
              </button>
              <button class="wx-insert-btn" @click="openTemplatePicker" title="模板">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                模板
              </button>
              <button class="wx-insert-btn" @click="importArticle" title="导入">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                导入
              </button>
              <span class="wx-insert-divider"></span>
              <button class="wx-insert-btn wx-insert-btn--primary" @click="openChartPicker" title="插入图表">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                图表
              </button>
              <button class="wx-insert-btn wx-insert-btn--primary" @click="openMapPicker" title="插入地图">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                地图
              </button>
              <button class="wx-insert-btn" @click="showSourceDialog" title="HTML 源码">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                HTML
              </button>
              <span class="wx-insert-hint">图表：{{ chartCount }} · 地图：{{ mapCount }}</span>
            </div>

            <!-- 格式工具栏 -->
            <div class="wx-format-toolbar">
              <!-- 撤销 / 重做 -->
              <button class="wx-fmt-btn" @click="execUndo" title="撤销"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button>
              <button class="wx-fmt-btn" @click="execRedo" title="重做"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
              <span class="wx-format-divider"></span>

              <!-- 清除格式 / 格式刷 -->
              <button class="wx-fmt-btn" @click="execRemoveFormat" title="清除格式"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h9l-2 7H9l-3 11"/><line x1="12" y1="3" x2="3" y2="21"/></svg></button>
              <button class="wx-fmt-btn" :class="{ 'format-painter-active': formatPainterActive }" @mousedown.prevent="execFormatPainter" title="格式刷"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h14c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M9 10v8l3 3 3-3v-8"/></svg></button>
              <span class="wx-format-divider"></span>

              <!-- 字体大小 -->
              <select class="wx-fmt-select" :value="currentFontSize" @change="execSetFontSize($event.target.value)" title="字体大小">
                <option v-for="s in fontSizes" :key="s" :value="s">{{ s }}px</option>
              </select>

              <!-- 加粗 / 斜体 / 下划线 / 删除线 -->
              <button class="wx-fmt-btn" :class="{ active: selectionState.bold }" @click="execBold" title="加粗"><strong>B</strong></button>
              <button class="wx-fmt-btn" :class="{ active: selectionState.italic }" @click="execItalic" title="斜体"><em>I</em></button>
              <button class="wx-fmt-btn" :class="{ active: selectionState.underline }" @click="execUnderline" title="下划线"><u>U</u></button>
              <button class="wx-fmt-btn" :class="{ active: selectionState.strike }" @click="execStrike" title="删除线"><s>S</s></button>

              <!-- 文字颜色 / 背景色 -->
              <div class="wx-color-wrapper">
                <button class="wx-fmt-btn" @click="toggleColorPicker('fore')" title="文字颜色" :style="{ color: currentColor }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4L4 20h2.5L8 16h8l1.5 4H20L13 4h-2z"/><line x1="9" y1="12" x2="15" y2="12"/></svg>
                </button>
                <div v-if="colorPickerVisible === 'fore'" class="wx-color-popup" @click.stop>
                  <div class="wx-color-popup__title">文字颜色</div>
                  <div class="wx-color-popup__grid">
                    <button v-for="c in presetColors" :key="c" class="wx-color-popup__swatch" :class="{ active: tempColor === c }" :style="{ background: c }" :title="c" @click="tempColor = c"></button>
                  </div>
                  <div class="wx-color-popup__custom">
                    <input type="color" :value="tempColor" @input="tempColor = $event.target.value" class="wx-color-popup__input" title="自定义颜色">
                    <span class="wx-color-popup__hex">{{ tempColor }}</span>
                  </div>
                  <div class="wx-color-popup__actions">
                    <button class="wx-color-popup__btn" @click="colorPickerVisible = null" title="取消">取消</button>
                    <button class="wx-color-popup__btn wx-color-popup__btn--primary" @click="applyColorPicker('fore')" title="应用颜色">确认</button>
                  </div>
                </div>
              </div>
              <div class="wx-color-wrapper">
                <button class="wx-fmt-btn" @click="toggleColorPicker('bg')" title="背景色" :style="{ color: currentBgColor }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                </button>
                <div v-if="colorPickerVisible === 'bg'" class="wx-color-popup" @click.stop>
                  <div class="wx-color-popup__title">背景色</div>
                  <div class="wx-color-popup__grid">
                    <button v-for="c in presetColors" :key="c" class="wx-color-popup__swatch" :class="{ active: tempColor === c }" :style="{ background: c }" :title="c" @click="tempColor = c"></button>
                  </div>
                  <div class="wx-color-popup__custom">
                    <input type="color" :value="tempColor" @input="tempColor = $event.target.value" class="wx-color-popup__input" title="自定义颜色">
                    <span class="wx-color-popup__hex">{{ tempColor }}</span>
                  </div>
                  <div class="wx-color-popup__actions">
                    <button class="wx-color-popup__btn" @click="colorPickerVisible = null" title="取消">取消</button>
                    <button class="wx-color-popup__btn wx-color-popup__btn--primary" @click="applyColorPicker('bg')" title="应用颜色">确认</button>
                  </div>
                </div>
              </div>
              <span class="wx-format-divider"></span>

              <!-- 对齐 -->
              <select class="wx-fmt-select" :value="currentAlign" @change="execSetAlign($event.target.value)" title="对齐">
                <option value="left">左对齐</option>
                <option value="center">居中对齐</option>
                <option value="right">右对齐</option>
                <option value="justify">两端对齐</option>
              </select>

              <!-- 缩进 -->
              <button class="wx-fmt-btn" @click="execIndent" title="增加缩进"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 10 15 6 21 18"/><line x1="3" y1="6" x2="3" y2="18"/></svg></button>

              <!-- 段前距 / 段后距 -->
              <select class="wx-fmt-select" :value="currentMarginTop" @change="execSetMarginTop($event.target.value)" title="段前距">
                <option value="0">段前距 0</option>
                <option v-for="v in [8,16,24,32,40,48]" :key="v" :value="v">{{ v }}px</option>
              </select>
              <select class="wx-fmt-select" :value="currentMarginBottom" @change="execSetMarginBottom($event.target.value)" title="段后距">
                <option value="0">段后距 0</option>
                <option v-for="v in [8,16,24,32,40,48]" :key="v" :value="v">{{ v }}px</option>
              </select>

              <!-- 行距 -->
              <select class="wx-fmt-select" :value="currentLineHeight" @change="execSetLineHeight($event.target.value)" title="行距">
                <option v-for="v in lineHeights" :key="v" :value="v">{{ v }}</option>
              </select>

              <!-- 字间距 -->
              <select class="wx-fmt-select" :value="currentLetterSpacing" @change="execSetLetterSpacing($event.target.value)" title="字间距">
                <option v-for="v in letterSpacings" :key="v" :value="v">{{ v === '0' ? '默认' : v + 'px' }}</option>
              </select>

              <!-- 列表样式 -->
              <select class="wx-fmt-select" :value="currentListStyle" @change="execSetListStyle($event.target.value)" title="列表样式">
                <option value="disc">● 小黑点</option>
                <option value="circle">○ 大圆圈</option>
                <option value="square">■ 小方块</option>
                <option value="decimal">1,2,3</option>
              </select>

              <span class="wx-format-divider"></span>

              <!-- 表格 -->
              <button class="wx-fmt-btn" @click="execInsertTable" title="插入表格"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg></button>

              <!-- 引用 / 分割线 / 代码 -->
              <button class="wx-fmt-btn" :class="{ active: selectionState.isBlockquote }" @click="execBlockquote" title="引用"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
              <button class="wx-fmt-btn" @click="execHorizontalRule" title="分割线"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg></button>
              <button class="wx-fmt-btn" :class="{ active: selectionState.isCodeBlock }" @click="execCodeBlock" title="代码块"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></button>

              <!-- 表情 -->
              <div class="wx-emoji-wrapper">
                <button class="wx-fmt-btn" @click="openEmojiPicker" title="表情"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
                <div v-if="emojiPickerVisible" class="wx-emoji-picker" @click.stop>
                  <button v-for="e in emojiList" :key="e" class="wx-emoji-item" @click="insertEmoji(e)" :title="e">{{ e }}</button>
                </div>
              </div>
              <span class="wx-format-divider"></span>

              <!-- 标题 -->
              <button class="wx-fmt-btn" :class="{ active: selectionState.isH1 }" @click="execHeading(1)" title="标题 1">H1</button>
              <button class="wx-fmt-btn" :class="{ active: selectionState.isH2 }" @click="execHeading(2)" title="标题 2">H2</button>
              <button class="wx-fmt-btn" :class="{ active: selectionState.isH3 }" @click="execHeading(3)" title="标题 3">H3</button>
            </div>
          </div>

          <!-- 编辑器主体 -->
          <div class="editor-wrapper">
            <div class="editor-container">
              <div class="editor-article-title" v-text="articleForm.title || '标题'" contenteditable="false"></div>
              <div class="editor-article-meta">
                <span class="editor-article-meta__author">{{ articleForm.authorName || 'SpaceMV格物' }}</span>
                <span class="editor-article-meta__sep">·</span>
                <span class="editor-article-meta__date">{{ displayDate }}</span>
              </div>
              <div class="editor-body" :class="{ 'is-focused': editorFocused }">
                <ContentEditableEditor ref="contentEditorRef" v-model:content-html="articleForm.contentHtml" :wechat-account-ids="wechatAccountIds" @word-count-change="onWordCountChange" @selection-change="onSelectionChange" @format-painter-done="formatPainterActive = false" @focus="editorFocused = true" @blur="editorFocused = false" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-sidebar">
        <div class="editor-section">
          <h4 class="editor-section__title">发布设置</h4>
          <el-form label-width="70px" size="small">
            <el-form-item label="可见性">
              <el-select v-model="articleForm.visibility">
                <el-option label="公开" value="PUBLIC" />
                <el-option label="登录可见" value="LOGIN" />
                <el-option label="付费可见" value="PAID" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否付费">
              <el-radio-group v-model="articleForm.isPaid">
                <el-radio value="0">否</el-radio>
                <el-radio value="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="状态">
              <el-tag v-if="articleForm.status" :type="(ARTICLE_STATUS[articleForm.status] || {}).type || 'info'" size="small">
                {{ (ARTICLE_STATUS[articleForm.status] || {}).label || articleForm.status }}
              </el-tag>
              <span v-else class="text-muted">-</span>
            </el-form-item>
          </el-form>
        </div>

        <div class="editor-section">
          <h4 class="editor-section__title">文章标签</h4>
          <el-form label-width="70px" size="small">
            <el-form-item label="标签">
              <el-select v-model="tagsArray" multiple allow-create filterable default-first-option placeholder="输入标签后回车" :reserve-keyword="false" />
              <div class="form-tip">用于文章分类和前端筛选，如：宏观经济、市场分析、AI/科技</div>
            </el-form-item>
          </el-form>
        </div>

        <div class="editor-section">
          <h4 class="editor-section__title">SEO 设置</h4>
          <el-form label-width="70px" size="small">
            <el-form-item label="SEO 标题">
              <el-input v-model="articleForm.seoTitle" placeholder="为空默认使用文章标题" maxlength="100" show-word-limit />
              <div class="form-tip">建议 20-60 字</div>
            </el-form-item>
            <el-form-item label="SEO 描述">
              <el-input v-model="articleForm.seoDescription" type="textarea" :rows="3" placeholder="为空默认使用摘要" />
              <div class="form-tip">建议 80-160 字</div>
            </el-form-item>
          </el-form>
        </div>

        <div class="editor-section">
          <h4 class="editor-section__title">图表引用检查</h4>
          <div v-if="chartSlugs.length > 0" class="chart-check">
            <div class="chart-check__header">已引用 {{ chartSlugs.length }} 个图表</div>
            <div v-for="slug in chartSlugs" :key="slug" class="chart-check__item">
              <code>{{ slug }}</code>
            </div>
          </div>
          <div v-else class="text-muted">暂无图表引用</div>
        </div>

        <div class="editor-section">
          <h4 class="editor-section__title">地图引用检查</h4>
          <div v-if="mapTokens.length > 0" class="chart-check">
            <div class="chart-check__header">已引用 {{ mapTokens.length }} 个地图</div>
            <div v-for="token in mapTokens" :key="token" class="chart-check__item">
              <code>{{ token }}</code>
            </div>
          </div>
          <div v-else class="text-muted">暂无地图引用</div>
        </div>
      </div>
    </div>

    <ChartPickerDialog v-model="chartPickerVisible" :wechat-account-ids="wechatAccountIds" @select="onChartSelect" />

    <MapPickerDialog v-model="mapPickerVisible" :wechat-account-ids="wechatAccountIds" @select="onMapSelect" />

    <ArticlePreviewDrawer v-model="previewVisible" :article="previewData" />

    <el-dialog v-model="publishDialogVisible" title="发布" width="560px" @open="onPublishDialogOpen">
      <div class="publish-confirm">
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">发布目标：</span>
          <div class="publish-confirm__targets">
            <el-checkbox v-model="targetSiteWendao" :disabled="isTargetDisabled('SITE_WENDAO')">
              SpaceMV问道
            </el-checkbox>
            <el-checkbox v-model="targetWechat" :disabled="isTargetDisabled('WECHAT_OFFICIAL_ACCOUNT')">
              微信公众号
            </el-checkbox>
          </div>
        </div>
        <div v-if="targetWechat" class="publish-confirm__item">
          <span class="publish-confirm__label">公众号账号：</span>
          <el-select v-model="selectedAccountId" placeholder="请选择微信公众号账号" size="small" style="width: 260px">
            <el-option v-for="acc in wechatAccounts" :key="acc.id" :label="acc.accountName" :value="acc.id" />
          </el-select>
        </div>
        <el-divider v-if="publishRecords.length > 0" />
        <div v-if="publishRecords.length > 0" class="publish-records-section">
          <h4 class="publish-records-title">已发布的平台</h4>
          <PublishRecordCard
            :article-id="articleForm.id"
            :records="publishRecords"
            @retry-success="onRetrySuccess"
            @confirm-published="onConfirmPublished"
            @ignore="onIgnorePlatform"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="publishing" :disabled="!hasAnyTarget" @click="confirmPublish">确认发布</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="wechatDraftDialogVisible" title="保存选项" width="520px">
      <div style="font-size: 14px; line-height: 1.6;">
        <el-radio-group v-model="saveMode" style="display:flex;flex-direction:column;gap:16px;">
          <el-radio value="save_only" style="height:auto;">
            <div>
              <strong>仅保存草稿</strong>
              <div style="font-size:12px;color:#909399;margin-top:2px;">只保存到系统草稿箱，不同步到微信</div>
            </div>
          </el-radio>
          <el-radio value="save_and_sync" style="height:auto;">
            <div>
              <strong>保存并同步到微信草稿箱</strong>
              <div style="font-size:12px;color:#909399;margin-top:2px;">保存到系统草稿箱后，自动同步到微信公众号</div>
            </div>
          </el-radio>
        </el-radio-group>

        <el-form v-if="saveMode === 'save_and_sync'" label-width="100px" size="small" style="margin-top: 16px; padding-left: 24px;">
          <el-form-item label="公众号账号">
            <el-select v-model="wechatDraftAccountId" placeholder="请选择微信公众号账号" style="width: 260px">
              <el-option v-for="acc in wechatAccounts" :key="acc.id" :label="acc.accountName" :value="acc.id" />
            </el-select>
          </el-form-item>
        </el-form>

        <el-checkbox v-model="rememberSaveChoice" style="margin-top: 16px; font-size: 13px;">
          记住选择，下次不再显示
        </el-checkbox>
      </div>
      <template #footer>
        <el-button @click="wechatDraftDialogVisible = false">取消</el-button>
        <el-button :loading="savingWechatDraft" @click="confirmSave">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="coverPickerVisible" title="选择封面图" width="520px">
      <div style="min-height: 100px;">
        <div v-if="coverPickerLoading" style="text-align:center;padding:40px 0;color:#999;">加载中...</div>
        <div v-else-if="coverPickerMaterials.length === 0" style="text-align:center;padding:40px 0;color:#999;">暂无素材，请先在素材库上传</div>
        <div v-else style="display:flex;flex-wrap:wrap;gap:12px;">
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
        <el-button @click="coverPickerVisible = false">取消</el-button>
        <el-button type="primary" @click="loadCoverPickerMaterials">刷新</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="sourceDialogVisible" title="HTML 源码" width="700px">
      <el-input v-model="sourceHtml" type="textarea" :rows="20" placeholder="HTML 源码" />
      <template #footer>
        <el-button @click="sourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="applySourceHtml">应用</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="imagePickerVisible" title="插入图片" width="620px" @open="onImagePickerOpen">
      <div class="image-picker">
        <div class="image-picker__upload">
          <el-upload
            ref="imageUploadRef"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="onImageFileChange"
            accept="image/*"
          >
            <el-button type="primary" size="small">
              <el-icon style="margin-right:4px;"><Picture /></el-icon>
              从本地选择图片
            </el-button>
          </el-upload>
          <span v-if="imageUploading" class="image-picker__uploading">上传中...</span>
        </div>

        <div class="image-picker__divider"></div>

        <div class="image-picker__list">
          <div class="image-picker__list-header">永久素材列表</div>
          <div v-if="imagePickerLoading" class="image-picker__empty">加载中...</div>
          <div v-else-if="imagePickerMaterials.length === 0" class="image-picker__empty">暂无素材</div>
          <div v-else class="image-picker__grid">
            <div
              v-for="item in imagePickerMaterials"
              :key="item.mediaId"
              class="image-picker__item"
              :class="{ selected: imagePickerSelectedId === item.mediaId }"
              @click="selectImagePickerItem(item)"
            >
              <img :src="getWechatDisplayUrl(item.url || item.sourceUrl || '')" :alt="item.name" referrerpolicy="no-referrer" />
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="imagePickerVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!imagePickerSelectedId" @click="confirmInsertImage">插入图片</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Picture, QuestionFilled } from '@element-plus/icons-vue'
import { generateJSON, generateHTML } from '@tiptap/html'
import { Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import { default as Link } from '@tiptap/extension-link'
import { default as ImageExt } from '@tiptap/extension-image'
import { default as Blockquote } from '@tiptap/extension-blockquote'
import { default as BulletList } from '@tiptap/extension-bullet-list'
import { default as OrderedList } from '@tiptap/extension-ordered-list'
import { default as ListItem } from '@tiptap/extension-list-item'
import { default as Heading } from '@tiptap/extension-heading'
import { default as HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { default as TextAlign } from '@tiptap/extension-text-align'
import { default as Color } from '@tiptap/extension-color'
import { default as Highlight } from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import ContentEditableEditor from './components/ContentEditableEditor.vue'
import request from '@/utils/request'

const CodeBlockExt = Node.create({
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  code: true,
  defining: true,
  parseHTML: [{ tag: 'pre' }],
  renderHTML: () => ['pre', ['code', 0]],
})
import { getArticle, addArticle, updateArticle, publishToMultiPlatform, publishArticleToSite, listPublishRecords, saveDraftToWeChat } from '@/api/content/article'
import { getTemplate } from '@/api/content/template'
import { templateContents } from './template-data'
import { getMediaProductList } from '@/api/media/mediaProduct/index'
import { getPermanentMaterialsList } from '@/api/material/permanentMaterials'
import auth from '@/plugins/auth'
import settings from '@/settings'
import { getWechatDisplayUrl } from '@/utils'
import { ARTICLE_STATUS, TARGET_CODE_MAP } from './constants'
import ChartPickerDialog from './components/ChartPickerDialog.vue'
import MapPickerDialog from './components/MapPickerDialog.vue'
import ArticlePreviewDrawer from './components/ArticlePreviewDrawer.vue'
import PublishRecordCard from './components/PublishRecordCard.vue'
const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.query.id)

const pageLoading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const formRef = ref(null)
const editorFocused = ref(false)
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

const loadCoverPickerMaterials = async () => {
  if (wechatAccounts.value.length === 0) {
    await loadWechatAccounts()
  }
  if (wechatAccounts.value.length === 0) {
    ElMessage.warning('暂无绑定的微信公众号')
    return
  }
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

watch(coverPickerVisible, (val) => {
  if (val) loadCoverPickerMaterials()
})

// WeChat-like sidebar state
const isOriginal = ref(false)
const enableComments = ref(true)
const autoSelectComments = ref(false)
const platformRecommend = ref(true)
const recommendLevel = ref('open')
const collectionName = ref('')
const collectionId = ref('')
const originalLinkText = ref('')
const showAdvanced = ref(false)

const coverPreview = computed(() => {
  const url = articleForm.value.coverDisplayUrl || articleForm.value.coverUrl || ''
  return getWechatDisplayUrl(url)
})

const displayDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const wordCount = ref(0)
const onWordCountChange = (count) => {
  wordCount.value = count
}

const contentEditorRef = ref(null)
const selectionState = ref({
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  fontSize: '16',
  foreColor: '#000000',
  backColor: '#ffffff',
  alignLeft: true,
  alignCenter: false,
  alignRight: false,
  alignJustify: false,
  isBlockquote: false,
  isCodeBlock: false,
  isH1: false,
  isH2: false,
  isH3: false,
  insertUnorderedList: false,
  insertOrderedList: false,
})

const onSelectionChange = (states) => {
  selectionState.value = { ...selectionState.value, ...states }
  if (states.marginTop !== undefined) currentMarginTop.value = states.marginTop
  if (states.marginBottom !== undefined) currentMarginBottom.value = states.marginBottom
  if (states.lineHeight !== undefined) currentLineHeight.value = states.lineHeight
  if (states.letterSpacing !== undefined) currentLetterSpacing.value = states.letterSpacing
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

const articleForm = ref({
  id: '',
  title: '',
  slug: '',
  summary: '',
  coverUrl: '',
  coverDisplayUrl: '',
  coverMediaId: '',
  coverAccountId: null,
  tags: '',
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
  canonicalUrl: ''
})

const formRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  slug: [
    { required: true, message: '请输入 slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'slug 只允许小写字母、数字和中划线', trigger: 'blur' }
  ]
}

const tagsArray = computed({
  get: () => articleForm.value.tags ? articleForm.value.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
  set: (val) => { articleForm.value.tags = val.join(',') }
})

const chartRegex = /\{\{chart:([a-zA-Z0-9-_]+)\}\}/g
const chartSpanRegex = /data-chart-slug\s*=\s*["']([a-zA-Z0-9-_]+)["']/g
const chartClassRegex = /alt\s*=\s*["']chart:([a-zA-Z0-9-_]+)["'][^>]*>\s*<\/(?:span|div)>/g

const chartSlugs = computed(() => {
  const slugs = []
  const html = articleForm.value.contentHtml || ''
  let match
  while ((match = chartRegex.exec(html)) !== null) {
    if (!slugs.includes(match[1])) slugs.push(match[1])
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

const mapRegex = /\{\{map:([a-zA-Z0-9-_]+)\}\}/g
const mapSpanRegex = /data-map-token\s*=\s*["']([a-zA-Z0-9-_]+)["']/g
const mapClassRegex = /alt\s*=\s*["']map:([a-zA-Z0-9-_]+)["'][^>]*>\s*<\/(?:span|div)>/g

const mapTokens = computed(() => {
  const tokens = []
  const html = articleForm.value.contentHtml || ''
  let match
  while ((match = mapRegex.exec(html)) !== null) {
    if (!tokens.includes(match[1])) tokens.push(match[1])
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
const wechatDraftDialogVisible = ref(false)
const savingWechatDraft = ref(false)
const saveMode = ref('save_only')
const rememberSaveChoice = ref(false)
const sourceDialogVisible = ref(false)
const sourceHtml = ref('')

const targetSiteWendao = ref(true)
const targetWechat = ref(false)
const wechatAccounts = ref([])
const wechatAccountIds = computed(() => wechatAccounts.value.map(a => a.id))
const selectedAccountId = ref(null)
const wechatDraftAccountId = ref(null)

const hasAnyTarget = computed(() => targetSiteWendao.value || targetWechat.value)

const isTargetDisabled = (targetCode) => {
  if (targetCode === 'WECHAT_OFFICIAL_ACCOUNT') {
    return wechatAccounts.value.length === 0
  }
  return false
}

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

  // 加载已有发布记录
  await loadPublishRecords()

  await loadWechatAccounts()
}

const previewData = computed(() => ({
  ...articleForm.value,
  contentHtml: contentEditorRef.value ? contentEditorRef.value.getContent() : articleForm.value.contentHtml
}))

function loadArticleContent(data) {
  if (contentEditorRef.value) {
    contentEditorRef.value.setContent(data.contentHtml || '')
  }
}

const tiptapExtensions = [
  Document, Paragraph, Text,
  Bold, Italic, Underline, Strike,
  Link, ImageExt, Blockquote,
  BulletList, OrderedList, ListItem,
  Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
  HorizontalRule, CodeBlockExt,
  Table, TableRow, TableCell, TableHeader,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Color, Highlight.configure({ multicolor: true }), TextStyle,
  {
    name: 'chart',
    parseHTML: [{ tag: 'span[data-chart-slug]' }],
  },
  {
    name: 'map',
    parseHTML: [{ tag: 'span[data-map-token]' }],
  },
]

function generateHTMLFromJson(contentJson) {
  try {
    const json = typeof contentJson === 'string' ? JSON.parse(contentJson) : contentJson
    return generateHTML(json, tiptapExtensions)
  } catch { return '' }
}

function generateContentJson(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const allowedTags = new Set(['p','div','br','hr','span','strong','b','em','i','u','s','strike','sub','sup','a','img','ul','ol','li','blockquote','pre','code','h1','h2','h3','h4','h5','h6','table','thead','tbody','tfoot','tr','th','td','caption','figure','figcaption','video','source','audio','iframe','font','small','mark','del','ins','abbr','cite','q','dl','dt','dd'])
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null, false)
    const toRemove = []
    while (walker.nextNode()) {
      const el = walker.currentNode
      const tag = el.tagName.toLowerCase()
      if (tag === 'style' || tag === 'script' || tag === 'section' || tag === 'mpcpc' || tag === 'mp-style-type') {
        toRemove.push(el)
      } else if (!allowedTags.has(tag)) {
        toRemove.push(el)
      } else {
        const keepAttrs = ['style','href','src','alt','title','target','rel','width','height','class','id','colspan','rowspan','start','type','data-chart-slug','data-map-token']
        ;[...el.attributes].forEach(attr => {
          if (!keepAttrs.includes(attr.name) && !attr.name.startsWith('data-')) {
            el.removeAttribute(attr.name)
          }
        })
      }
    }
    toRemove.forEach(el => {
      const parent = el.parentNode
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el)
        parent.removeChild(el)
      }
    })
    const cleaned = doc.body.innerHTML
    const json = generateJSON(cleaned, tiptapExtensions)
    return JSON.stringify(json)
  } catch (e) {
    console.warn('[generateContentJson] failed, using fallback', e)
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const text = doc.body.textContent || ''
      const els = Array.from(doc.body.children)
      const content = els.length > 0
        ? els.map(el => ({ type: 'paragraph', content: [{ type: 'text', text: el.textContent || '' }] }))
        : [{ type: 'paragraph', content: [{ type: 'text', text }] }]
      return JSON.stringify({ type: 'doc', content })
    } catch {
      return JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] })
    }
  }
}

const loadArticle = async () => {
  const id = route.query.id
  if (!id) return

  pageLoading.value = true
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
        tags: data.tags || '',
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
        canonicalUrl: data.canonicalUrl || ''
      }
      loadArticleContent(data)
    } else {
      ElMessage.error(res.msg || '获取文章详情失败')
    }
  } catch {
    ElMessage.error('获取文章详情失败')
  } finally {
    pageLoading.value = false
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

const validateForm = async () => {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

function escapeHtmlAttrQuotes(html) {
  return html.replace(/<[^>]+>/g, (tag) => {
    return tag.replace(/([\w-]+)=(["'])(.*?)\2/g, (m, name, quote, value) => {
      return `${name}='${value.replace(/'/g, '&apos;')}'`
    })
  })
}

function getEditorContent() {
  const html = contentEditorRef.value ? contentEditorRef.value.getContent() : articleForm.value.contentHtml
  return {
    contentHtml: escapeHtmlAttrQuotes(html),
    contentJson: generateContentJson(html),
  }
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

function ensureShortcodesInContent(html) {
  html = html.replace(/(<(?:span|div)[^>]*?data-chart-slug\s*=\s*["']([a-zA-Z0-9-_]+)["'][^>]*?>)(.*?)(<\/(?:span|div)>)/gs, (match, openTag, slug, inner, closeTag) => {
    if (inner.includes('{{chart:')) return match
    return `${openTag}${inner}{{chart:${slug}}}${closeTag}`
  })
  html = html.replace(/(<(?:span|div)[^>]*?data-map-token\s*=\s*["']([a-zA-Z0-9-_]+)["'][^>]*?>)(.*?)(<\/(?:span|div)>)/gs, (match, openTag, token, inner, closeTag) => {
    if (inner.includes('{{map:')) return match
    return `${openTag}${inner}{{map:${token}}}${closeTag}`
  })
  html = html.replace(/(<(?:span|div)[^>]*?\bclass\s*=\s*["'][^"']*\bchart-node\b[^"']*["'][^>]*?>)(.*?)(<\/(?:span|div)>)/gs, (match, openTag, inner, closeTag) => {
    if (inner.includes('{{chart:')) return match
    if (inner.includes('data-chart-slug')) return match
    const altMatch = inner.match(/alt\s*=\s*["']chart:([a-zA-Z0-9-_]+)["']/)
    if (!altMatch) return match
    return `${openTag}${inner}{{chart:${altMatch[1]}}}${closeTag}`
  })
  html = html.replace(/(<(?:span|div)[^>]*?\bclass\s*=\s*["'][^"']*\bmap-node\b[^"']*["'][^>]*?>)(.*?)(<\/(?:span|div)>)/gs, (match, openTag, inner, closeTag) => {
    if (inner.includes('{{map:')) return match
    if (inner.includes('data-map-token')) return match
    const altMatch = inner.match(/alt\s*=\s*["']map:([a-zA-Z0-9-_]+)["']/)
    if (!altMatch) return match
    return `${openTag}${inner}{{map:${altMatch[1]}}}${closeTag}`
  })
  return html
}

function buildWenDaoContentHtml(html) {
  return html
    .replace(/(<(?:span|div)[^>]*?data-chart-slug\s*=\s*["'][^"']*["'][^>]*?>)\s*<img[^>]*?>\s*/g, '$1')
    .replace(/(<(?:span|div)[^>]*?data-map-token\s*=\s*["'][^"']*["'][^>]*?>)\s*<img[^>]*?>\s*/g, '$1')
    .replace(/(<(?:span|div)[^>]*?\bclass\s*=\s*["'][^"']*\bchart-node\b[^"']*["'][^>]*?>)\s*<img[^>]*?>\s*/g, '$1')
    .replace(/(<(?:span|div)[^>]*?\bclass\s*=\s*["'][^"']*\bmap-node\b[^"']*["'][^>]*?>)\s*<img[^>]*?>\s*/g, '$1')
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

function buildSaveData() {
  const rawHtml = contentEditorRef.value ? contentEditorRef.value.getContent() : articleForm.value.contentHtml
  const rawJson = generateContentJson(rawHtml)
  const data = {
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
  }
  const processedHtml = ensureShortcodesInContent(restoreStaticUrlsInHtml(rawHtml))
  data.contentHtml = escapeHtmlAttrQuotes(normalizeWechatDraftHtml(stripShortcodes(stripInteractivePrompts(processedHtml))))
  data.wenDaoContentHtml = escapeHtmlAttrQuotes(buildWenDaoContentHtml(processedHtml))
  data.contentJson = rawJson
  return data
}

const SAVE_PREF_KEY = 'editor_save_preference'

const handleSave = async () => {
  const valid = await validateForm()
  if (!valid) return

  if (wechatAccounts.value.length === 0) {
    await loadWechatAccounts()
  }

  // 检查是否有保存偏好
  const pref = loadSavePreference()
  if (pref) {
    await doSave(pref.mode === 'save_and_sync', pref.accountId)
    return
  }

  saveMode.value = wechatAccounts.value.length > 0 ? 'save_only' : 'save_only'
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
      const articleId = res.data?.id || articleForm.value.id
      if (res.data?.id) {
        articleForm.value = { ...articleForm.value, ...res.data }
      }
      if (!isEdit.value && res.data?.id) {
        await router.replace(`/contentCenter/article/edit?id=${res.data.id}`)
      } else if (!res.data?.id) {
        const detailRes = await getArticle(articleForm.value.id)
        if (detailRes.code === 200 && detailRes.data) {
          Object.assign(articleForm.value, detailRes.data)
        }
      }

      if (syncToWechat && accountId) {
        try {
          await saveDraftToWeChat(articleId, { accountId })
          ElMessage.success('保存成功，已同步到微信草稿箱')
        } catch {
          ElMessage.warning('保存成功，但同步微信草稿箱失败')
        }
      } else {
        ElMessage.success('保存成功')
      }

      wechatDraftDialogVisible.value = false
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const confirmSave = async () => {
  savingWechatDraft.value = true
  try {
    if (rememberSaveChoice.value) {
      savePreference(saveMode.value, wechatDraftAccountId.value)
    }
    if (saveMode.value === 'save_and_sync') {
      if (!wechatDraftAccountId.value) {
        ElMessage.warning('请选择微信公众号账号')
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

const fontSizes = [12, 14, 15, 16, 17, 18, 20, 24]
const lineHeights = [1, 1.5, 1.6, 1.75, 2, 3, 4, 5]
const letterSpacings = ['0', '0.5', '1', '2']

const currentFontSize = computed(() => selectionState.value.fontSize || '16')
const currentColor = computed(() => selectionState.value.foreColor || '#000000')
const currentBgColor = computed(() => selectionState.value.backColor || '#ffffff')

const currentAlign = computed(() => {
  const s = selectionState.value
  if (s.alignCenter) return 'center'
  if (s.alignRight) return 'right'
  if (s.alignJustify) return 'justify'
  return 'left'
})

const currentMarginTop = ref('0')
const currentMarginBottom = ref('0')
const currentLineHeight = ref('1.6')
const currentLetterSpacing = ref('0')
const currentListStyle = ref('disc')

const formatPainterActive = ref(false)

const presetColors = ['#000000','#333333','#666666','#999999','#cccccc','#ffffff','#ff0000','#ff4500','#ff8c00','#ffd700','#ffff00','#7cfc00','#00ff00','#00fa9a','#00ced1','#00bfff','#1e90ff','#0000ff','#8a2be2','#9400d3','#ff1493','#ff69b4','#dc143c','#8b0000','#b8860b','#556b2f','#2e8b57','#008080','#191970','#4b0082']
const colorPickerVisible = ref(null)
const tempColor = ref('#000000')

const toggleColorPicker = (type) => {
  if (colorPickerVisible.value === type) {
    colorPickerVisible.value = null
    return
  }
  colorPickerVisible.value = type
  tempColor.value = type === 'fore' ? currentColor.value : currentBgColor.value
}

const applyColorPicker = (type) => {
  if (type === 'fore') execSetColor(tempColor.value)
  else execSetBgColor(tempColor.value)
  colorPickerVisible.value = null
}

const closeColorPicker = (e) => {
  if (colorPickerVisible.value && !e.target.closest('.wx-color-wrapper')) {
    colorPickerVisible.value = null
  }
}

// ===== 工具栏操作（转发到 ContentEditableEditor） =====
const execUndo = () => contentEditorRef.value?.undo()
const execRedo = () => contentEditorRef.value?.redo()
const execBold = () => contentEditorRef.value?.toggleBold()
const execItalic = () => contentEditorRef.value?.toggleItalic()
const execUnderline = () => contentEditorRef.value?.toggleUnderline()
const execStrike = () => contentEditorRef.value?.toggleStrike()
const execRemoveFormat = () => contentEditorRef.value?.removeFormat()
const execFormatPainter = () => {
  if (formatPainterActive.value) {
    const applied = contentEditorRef.value?.applyFormatPainter()
    if (applied) formatPainterActive.value = false
  } else {
    const activated = contentEditorRef.value?.startFormatPainter()
    if (activated) {
      formatPainterActive.value = true
      ElMessage.info('格式刷已激活，请选择要应用格式的文本')
    }
  }
}
const execBlockquote = () => contentEditorRef.value?.toggleBlockquote()
const execCodeBlock = () => contentEditorRef.value?.toggleCodeBlock()
const execHorizontalRule = () => contentEditorRef.value?.insertHorizontalRule()
const execHeading = (level) => contentEditorRef.value?.toggleHeading(level)
const execSetFontSize = (size) => contentEditorRef.value?.setFontSize(size)
const execSetColor = (color) => contentEditorRef.value?.setColor(color)
const execSetBgColor = (color) => contentEditorRef.value?.setBgColor(color)
const execSetAlign = (align) => contentEditorRef.value?.setTextAlign(align)
const execIndent = () => contentEditorRef.value?.setIndent()
const execSetMarginTop = (v) => {
  if (contentEditorRef.value) {
    contentEditorRef.value.focus()
    contentEditorRef.value.setMarginTop(v)
  }
  currentMarginTop.value = v
}
const execSetMarginBottom = (v) => {
  if (contentEditorRef.value) {
    contentEditorRef.value.focus()
    contentEditorRef.value.setMarginBottom(v)
  }
  currentMarginBottom.value = v
}
const execSetLineHeight = (v) => {
  if (contentEditorRef.value) {
    contentEditorRef.value.focus()
    contentEditorRef.value.setLineHeight(v)
  }
  currentLineHeight.value = v
}
const execSetLetterSpacing = (v) => {
  if (contentEditorRef.value) {
    contentEditorRef.value.focus()
    contentEditorRef.value.setLetterSpacing(v)
  }
  currentLetterSpacing.value = v
}
const execSetListStyle = (style) => {
  contentEditorRef.value?.setListStyle(style)
  currentListStyle.value = style
}
const execInsertTable = () => contentEditorRef.value?.insertTable()

const openChartPicker = async () => {
  if (wechatAccounts.value.length === 0) {
    await loadWechatAccounts()
  }
  contentEditorRef.value?.saveSelection()
  chartPickerVisible.value = true
}

const onChartSelect = ({ slug, imageUrl, wechatImageUrl }) => {
  contentEditorRef.value?.insertChart({ slug, imageUrl, wechatImageUrl })
  chartPickerVisible.value = false
  contentEditorRef.value?.focus()
}

const openMapPicker = async () => {
  if (wechatAccounts.value.length === 0) {
    await loadWechatAccounts()
  }
  contentEditorRef.value?.saveSelection()
  mapPickerVisible.value = true
}

const onMapSelect = ({ token, imageUrl, wechatImageUrl }) => {
  contentEditorRef.value?.insertMap({ token, imageUrl, wechatImageUrl })
  mapPickerVisible.value = false
  contentEditorRef.value?.focus()
}

const showSourceDialog = () => {
  sourceHtml.value = contentEditorRef.value ? contentEditorRef.value.getContent() : ''
  sourceDialogVisible.value = true
}

const applySourceHtml = () => {
  contentEditorRef.value?.setContent(sourceHtml.value)
  sourceDialogVisible.value = false
}

const imagePickerVisible = ref(false)
const imagePickerLoading = ref(false)
const imagePickerMaterials = ref([])
const imagePickerSelectedId = ref('')
const imagePickerSelectedUrl = ref('')
const imageUploading = ref(false)
const imageUploadRef = ref(null)

const loadImagePickerMaterials = async () => {
  if (wechatAccounts.value.length === 0) await loadWechatAccounts()
  if (wechatAccounts.value.length === 0) return
  imagePickerLoading.value = true
  try {
    const res = await getPermanentMaterialsList({
      pageNum: 1,
      pageSize: 100,
      accountIds: wechatAccounts.value.map(a => a.id)
    })
    if (res.code === 200) {
      imagePickerMaterials.value = res.data?.list || res.data || []
    } else {
      imagePickerMaterials.value = []
    }
  } catch {
    imagePickerMaterials.value = []
  } finally {
    imagePickerLoading.value = false
  }
}

const onImagePickerOpen = () => {
  imagePickerSelectedId.value = ''
  imagePickerSelectedUrl.value = ''
  loadImagePickerMaterials()
}

const onImageFileChange = async (uploadFile) => {
  const file = uploadFile.raw
  if (!file) return
  if (!wechatAccounts.value.length) {
    ElMessage.warning('请先绑定微信公众号')
    return
  }

  imageUploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await request({
      url: '/txwx-social-crm/material/permanentAdd',
      method: 'post',
      data: form,
      params: { accountId: wechatAccounts.value[0].id },
      timeout: 120000,
    })
    if (res?.data?.url) {
      ElMessage.success('上传成功')
      await loadImagePickerMaterials()
    }
  } catch {
    ElMessage.error('上传失败')
  } finally {
    imageUploading.value = false
  }
}

const selectImagePickerItem = (item) => {
  imagePickerSelectedId.value = item.mediaId
  imagePickerSelectedUrl.value = item.url || item.sourceUrl || ''
}

const confirmInsertImage = () => {
  if (!imagePickerSelectedUrl.value || !contentEditorRef.value) return
  contentEditorRef.value.insertImage(imagePickerSelectedUrl.value, '')
  imagePickerVisible.value = false
}

const insertImage = () => {
  imagePickerVisible.value = true
}

const insertVideo = () => {
  ElMessage.info('视频插入功能待集成')
}

const insertAudio = () => {
  ElMessage.info('音频插入功能待集成')
}

const insertLink = () => {
  const url = prompt('请输入链接地址：')
  if (url && contentEditorRef.value) {
    contentEditorRef.value.insertLink(url)
  }
}

const emojiPickerVisible = ref(false)
const emojiList = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤟', '🤘', '👌', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '💯', '🔥', '⭐', '🌟', '✨', '💡', '📌', '🎉', '🎊', '🎈', '🏆', '✅', '❌', '❗', '❓', '💪', '🤷', '🙋', '💃', '🕺']

const openEmojiPicker = () => {
  emojiPickerVisible.value = !emojiPickerVisible.value
}

const insertEmoji = (emoji) => {
  contentEditorRef.value?.insertEmoji(emoji)
  emojiPickerVisible.value = false
}

const openTemplatePicker = () => {
  ElMessage.info('模板选择功能待集成')
}

const importArticle = () => {
  ElMessage.info('导入功能待集成')
}

const selectCover = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    // TODO: upload cover image
    ElMessage.info('封面上传功能待集成')
  }
  input.click()
}

const openCollectionPicker = () => {
  ElMessage.info('合集选择功能待集成')
}

const setOriginalLink = () => {
  const url = prompt('请输入原文链接地址：')
  if (url) {
    originalLinkText.value = url
  }
}

const handlePublish = async () => {
  if (!articleForm.value.id) {
    ElMessage.warning('请先保存草稿')
    return
  }

  const valid = await validateForm()
  if (!valid) return

  const html = contentEditorRef.value ? contentEditorRef.value.getContent() : articleForm.value.contentHtml
  articleForm.value.contentHtml = html

  publishDialogVisible.value = true
}

const confirmPublish = async () => {
  if (!articleForm.value.id) return
  const targets = []
  if (targetSiteWendao.value) {
    targets.push({ targetCode: 'SITE_WENDAO' })
  }
  if (targetWechat.value) {
    if (!selectedAccountId.value) {
      ElMessage.warning('请选择微信公众号账号')
      return
    }
    targets.push({ targetCode: 'WECHAT_OFFICIAL_ACCOUNT', accountId: selectedAccountId.value })
  }
  if (targets.length === 0) return

  // 发布前先保存最新内容到数据库
  const saveRes = isEdit.value
    ? await updateArticle(articleForm.value.id, buildSaveData())
    : await addArticle(buildSaveData())
  if (saveRes.code !== 200) {
    ElMessage.error(saveRes.msg || '保存失败，请先手动保存再发布')
    publishing.value = false
    return
  }
  if (saveRes.data?.id) {
    articleForm.value.id = saveRes.data.id
  }

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
      ElMessage.success('发布成功')
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
      ElMessage.error(res.msg || '发布失败')
    }
  } catch {
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}

const loadTemplate = async (templateId) => {
  const tplHtml = templateContents[templateId]
  if (tplHtml && contentEditorRef.value) {
    contentEditorRef.value.setContent(tplHtml)
    return
  }
  try {
    const res = await getTemplate(templateId)
    if (res.code === 200 && res.data) {
      const tpl = res.data
      if (tpl.snapshotJson && contentEditorRef.value) {
        const content = typeof tpl.snapshotJson === 'string' ? JSON.parse(tpl.snapshotJson) : tpl.snapshotJson
        articleForm.value.contentHtml = typeof content === 'object' ? JSON.stringify(content) : content
        contentEditorRef.value.setContent(articleForm.value.contentHtml)
      }
    }
  } catch {
    // 静默失败
  }
}

const handleBack = () => {
  router.push('/contentCenter/article')
}

const closeEmojiPicker = (e) => {
  if (emojiPickerVisible.value && !e.target.closest('.wx-emoji-wrapper')) {
    emojiPickerVisible.value = false
  }
}

let referrerMeta = null

onMounted(async () => {
  referrerMeta = document.createElement('meta')
  referrerMeta.name = 'referrer'
  referrerMeta.content = 'no-referrer'
  document.head.appendChild(referrerMeta)

  document.addEventListener('click', closeEmojiPicker)
  document.addEventListener('click', closeColorPicker)
  loadWechatAccounts()
  if (route.query.id) {
    loadArticle()
  } else if (route.query.templateId) {
    loadTemplate(route.query.templateId)
  }
})

onBeforeUnmount(() => {
  if (referrerMeta) referrerMeta.remove()
  document.removeEventListener('click', closeEmojiPicker)
  document.removeEventListener('click', closeColorPicker)
})
</script>

<style scoped lang="scss">
.content-page {
  padding: 20px;
}

.editor-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 16px;
  position: sticky;
  top: 0;
  z-index: 10;

  &__title {
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #303133;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.editor-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-section {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
}

/* ===================== 编辑器工具栏容器（固定） ===================== */
.editor-toolbars {
  position: sticky;
  top: 52px;
  z-index: 9;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

/* ===================== 媒体插入工具栏 ===================== */
.wx-insert-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  flex-wrap: wrap;

  .wx-insert-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
    color: #606266;
    border-radius: 3px;
    white-space: nowrap;
    transition: background 0.15s;

    svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    &:hover {
      background: #ecf5ff;
      color: #409eff;
    }

    &--primary {
      color: #409eff;

      &:hover {
        background: #ecf5ff;
      }
    }
  }

  .wx-insert-divider {
    width: 1px;
    height: 16px;
    background: #dcdfe6;
    margin: 0 4px;
  }

  .wx-insert-hint {
    margin-left: auto;
    font-size: 11px;
    color: #c0c4cc;
  }
}

/* ===================== 格式工具栏 ===================== */
.wx-format-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 4px 8px;
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;

  .wx-fmt-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 26px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    color: #606266;
    border-radius: 3px;
    transition: all 0.15s;
    flex-shrink: 0;

    &:hover { background: #ecf5ff; }
    &.active { color: #409eff; background: #ecf5ff; }
    &[disabled] { opacity: 0.4; cursor: default; &:hover { background: transparent; } }

    strong, em, u, s { font-style: inherit; }
    svg { width: 15px; height: 15px; }
  }

  .wx-fmt-select {
    height: 24px;
    border: 1px solid #dcdfe6;
    border-radius: 3px;
    background: #fff;
    font-size: 12px;
    color: #606266;
    padding: 0 4px;
    cursor: pointer;
    outline: none;
    &:hover { border-color: #409eff; }
  }

  .wx-color-wrapper {
    position: relative;
    display: inline-flex;
  }

  .wx-color-popup {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 100;
    width: 196px;
    padding: 10px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    margin-top: 4px;

    &__title {
      font-size: 12px;
      color: #909399;
      margin-bottom: 8px;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(10, 16px);
      gap: 3px;
      margin-bottom: 8px;
    }

    &__swatch {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      border: 1px solid #dcdfe6;
      cursor: pointer;
      padding: 0;
      transition: transform 0.1s;

      &:hover { transform: scale(1.3); z-index: 1; position: relative; }
      &.active { outline: 2px solid #409eff; outline-offset: 1px; }
    }

    &__custom {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    &__input {
      width: 28px;
      height: 28px;
      border: 1px solid #dcdfe6;
      border-radius: 3px;
      padding: 1px;
      cursor: pointer;
      background: none;
      &::-webkit-color-swatch-wrapper { padding: 0; }
      &::-webkit-color-swatch { border: none; border-radius: 2px; }
    }

    &__hex {
      font-size: 12px;
      color: #606266;
      font-family: monospace;
    }

    &__actions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
    }

    &__btn {
      padding: 4px 12px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
      font-size: 12px;
      color: #606266;
      transition: all 0.15s;

      &:hover { border-color: #409eff; color: #409eff; }

      &--primary {
        background: #409eff;
        border-color: #409eff;
        color: #fff;
        &:hover { background: #66b1ff; border-color: #66b1ff; color: #fff; }
      }
    }
  }

  .wx-format-divider {
    width: 1px;
    height: 14px;
    background: #dcdfe6;
    margin: 0 4px;
    flex-shrink: 0;
  }

  .format-painter-active {
    color: #409eff !important;
    background: #ecf5ff !important;
    box-shadow: inset 0 0 0 1px #409eff;
  }

  .wx-emoji-wrapper {
    position: relative;
    display: inline-flex;
  }

  .wx-emoji-picker {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 100;
    display: grid;
    grid-template-columns: repeat(10, 28px);
    gap: 2px;
    padding: 6px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    max-height: 200px;
    overflow-y: auto;
    margin-top: 4px;
  }

  .wx-emoji-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 18px;
    border-radius: 4px;
    &:hover { background: #f0f0f0; }
  }
}

/* ===================== 编辑器主体 ===================== */
.editor-wrapper {
  padding: 12px 0;
}

.editor-container {
  background: #fff;
  padding: 24px 48px;
  position: relative;
  max-width: 780px;
  margin: 0 auto;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.editor-article-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: #1a1a1a;
  margin-bottom: 8px;
  word-wrap: break-word;
}

.editor-article-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #b0b0b0;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;

  &__author {
    color: #333;
  }

  &__sep {
    color: #ddd;
  }
}

.editor-body {}

.editor-content {}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 2px;
}

.text-muted {
  font-size: 13px;
  color: #c0c4cc;
}

.chart-check {
  &__header {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }

  &__item {
    margin-bottom: 4px;

    code {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      background: #f5f7fa;
      padding: 2px 6px;
      border-radius: 3px;
    }
  }
}

.slug-help-icon {
  cursor: pointer;
  color: #909399;
  font-size: 14px;
}

.publish-confirm {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__item {
    font-size: 14px;
    line-height: 1.6;
  }

  &__label {
    color: #909399;
    margin-right: 8px;
  }

  code {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    background: #f5f7fa;
    padding: 1px 4px;
    border-radius: 3px;
  }

  &__targets {
    display: inline-flex;
    gap: 16px;
    align-items: center;
  }
}

.cover-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;

  .cover-preview {
    position: relative;
    width: 120px;
    height: 68px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid #e4e7ed;
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
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .cover-overlay {
      opacity: 1;
    }
  }

  .cover-picker-placeholder {
    width: 120px;
    height: 68px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #999;
    font-size: 12px;
    cursor: pointer;
    flex-shrink: 0;
    transition: border-color 0.2s;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }
  }
}

.cover-material-item {
  width: 110px;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
  text-align: center;

  img {
    width: 100%;
    height: 80px;
    object-fit: cover;
    display: block;
  }

  span {
    display: block;
    font-size: 12px;
    color: #666;
    padding: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    border-color: #409eff;
  }

  &.selected {
    border-color: #409eff;
    box-shadow: 0 0 0 1px #409eff;
  }
}

/* ===================== 图片选择对话框 ===================== */
.image-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__upload {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__uploading {
    font-size: 13px;
    color: #909399;
  }

  &__divider {
    height: 1px;
    background: #e4e7ed;
  }

  &__list-header {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  &__empty {
    text-align: center;
    padding: 24px 0;
    font-size: 13px;
    color: #c0c4cc;
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    max-height: 320px;
    overflow-y: auto;
  }

  &__item {
    width: 110px;
    border: 2px solid transparent;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s;
    text-align: center;

    img {
      width: 100%;
      height: 80px;
      object-fit: cover;
      display: block;
    }

    span {
      display: block;
      font-size: 12px;
      color: #666;
      padding: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover {
      border-color: #409eff;
    }

    &.selected {
      border-color: #409eff;
      box-shadow: 0 0 0 1px #409eff;
    }
  }
}
</style>
