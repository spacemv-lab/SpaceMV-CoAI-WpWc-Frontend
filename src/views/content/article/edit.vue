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
          <div class="wx-format-toolbar" v-if="editor">
            <!-- 撤销 / 重做 -->
            <button class="wx-fmt-btn" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" title="撤销"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button>
            <button class="wx-fmt-btn" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" title="重做"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
            <span class="wx-format-divider"></span>

            <!-- 清除格式 / 格式刷 -->
            <button class="wx-fmt-btn" @click="editor.chain().focus().clearFormatting().run()" title="清除格式"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h9l-2 7H9l-3 11"/><line x1="12" y1="3" x2="3" y2="21"/></svg></button>
            <button class="wx-fmt-btn" :class="{ 'format-painter-active': formatPainterActive }" @click="startFormatPainter" title="格式刷"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h14c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M9 10v8l3 3 3-3v-8"/></svg></button>
            <span class="wx-format-divider"></span>

            <!-- 字体大小 -->
            <select class="wx-fmt-select" :value="currentFontSize" @change="setFontSize($event.target.value)" title="字体大小">
              <option v-for="s in fontSizes" :key="s" :value="s">{{ s }}px</option>
            </select>

            <!-- 加粗 / 斜体 / 下划线 / 删除线 -->
            <button class="wx-fmt-btn" :class="{ active: editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()" title="加粗"><strong>B</strong></button>
            <button class="wx-fmt-btn" :class="{ active: editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()" title="斜体"><em>I</em></button>
            <button class="wx-fmt-btn" :class="{ active: editor.isActive('underline') }" @click="editor.chain().focus().toggleUnderline().run()" title="下划线"><u>U</u></button>
            <button class="wx-fmt-btn" :class="{ active: editor.isActive('strike') }" @click="editor.chain().focus().toggleStrike().run()" title="删除线"><s>S</s></button>

            <!-- 文字颜色 / 背景色 -->
            <label class="wx-fmt-color" title="文字颜色">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4L4 20h2.5L8 16h8l1.5 4H20L13 4h-2z"/><line x1="9" y1="12" x2="15" y2="12"/></svg>
              <input type="color" :value="currentColor" @input="setColor($event.target.value)" class="wx-color-input">
            </label>
            <label class="wx-fmt-color" title="背景色">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              <input type="color" :value="currentBgColor" @input="setBgColor($event.target.value)" class="wx-color-input">
            </label>
            <span class="wx-format-divider"></span>

            <!-- 对齐 -->
            <select class="wx-fmt-select" :value="currentAlign" @change="setAlign($event.target.value)" title="对齐">
              <option value="left">左对齐</option>
              <option value="center">居中对齐</option>
              <option value="right">右对齐</option>
              <option value="justify">两端对齐</option>
            </select>

            <!-- 缩进 -->
            <button class="wx-fmt-btn" @click="indentMore" title="增加缩进"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 10 15 6 21 18"/><line x1="3" y1="6" x2="3" y2="18"/></svg></button>

            <!-- 段前距 / 段后距 -->
            <select class="wx-fmt-select" :value="currentMarginTop" @change="setMarginTop($event.target.value)" title="段前距">
              <option value="0">段前距 0</option>
              <option v-for="v in [8,16,24,32,40,48]" :key="v" :value="v">{{ v }}px</option>
            </select>
            <select class="wx-fmt-select" :value="currentMarginBottom" @change="setMarginBottom($event.target.value)" title="段后距">
              <option value="0">段后距 0</option>
              <option v-for="v in [8,16,24,32,40,48]" :key="v" :value="v">{{ v }}px</option>
            </select>

            <!-- 行距 -->
            <select class="wx-fmt-select" :value="currentLineHeight" @change="setLineHeight($event.target.value)" title="行距">
              <option v-for="v in lineHeights" :key="v" :value="v">{{ v }}</option>
            </select>

            <!-- 字间距 -->
            <select class="wx-fmt-select" :value="currentLetterSpacing" @change="setLetterSpacing($event.target.value)" title="字间距">
              <option v-for="v in letterSpacings" :key="v" :value="v">{{ v === '0' ? '默认' : v + 'px' }}</option>
            </select>

            <!-- 列表样式 -->
            <select class="wx-fmt-select" :value="currentListStyle" @change="setListStyle($event.target.value)" title="列表样式">
              <option value="disc">● 小黑点</option>
              <option value="circle">○ 大圆圈</option>
              <option value="square">■ 小方块</option>
              <option value="decimal">1,2,3</option>
            </select>

            <!-- 浮动 -->
            <select class="wx-fmt-select" :value="currentFloat" @change="setFloat($event.target.value)" title="浮动">
              <option value="none">默认</option>
              <option value="left">左浮动</option>
              <option value="right">右浮动</option>
            </select>
            <span class="wx-format-divider"></span>

            <!-- 表格 -->
            <button class="wx-fmt-btn" @click="insertTable" title="插入表格"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg></button>

            <!-- 引用 / 分割线 / 代码 -->
            <button class="wx-fmt-btn" :class="{ active: editor.isActive('blockquote') }" @click="editor.chain().focus().toggleBlockquote().run()" title="引用"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
            <button class="wx-fmt-btn" @click="editor.chain().focus().setHorizontalRule().run()" title="分割线"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg></button>
            <button class="wx-fmt-btn" :class="{ active: editor.isActive('codeBlock') }" @click="editor.chain().focus().toggleCodeBlock().run()" title="代码块"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></button>

            <!-- 表情 -->
            <div class="wx-emoji-wrapper">
              <button class="wx-fmt-btn" @click="openEmojiPicker" title="表情"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
              <div v-if="emojiPickerVisible" class="wx-emoji-picker" @click.stop>
                <button v-for="e in emojiList" :key="e" class="wx-emoji-item" @click="insertEmoji(e)">{{ e }}</button>
              </div>
            </div>
            <span class="wx-format-divider"></span>

            <!-- 标题 -->
            <button class="wx-fmt-btn" :class="{ active: editor.isActive('heading', { level: 1 }) }" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" title="标题 1">H1</button>
            <button class="wx-fmt-btn" :class="{ active: editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" title="标题 2">H2</button>
            <button class="wx-fmt-btn" :class="{ active: editor.isActive('heading', { level: 3 }) }" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" title="标题 3">H3</button>
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
                <editor-content :editor="editor" class="editor-content" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Picture, QuestionFilled } from '@element-plus/icons-vue'
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
import { ChartNode } from './tiptap-extensions/ChartNode'
import { MapNode } from './tiptap-extensions/MapNode'
import { StyledSection } from './tiptap-extensions/StyledSection'
import { FontSize } from './tiptap-extensions/FontSize'
import { LineHeight } from './tiptap-extensions/LineHeight'
import { LetterSpacing } from './tiptap-extensions/LetterSpacing'
import { RowSpacing } from './tiptap-extensions/RowSpacing'
import { Indent } from './tiptap-extensions/Indent'
import { ClearFormatting } from './tiptap-extensions/ClearFormatting'
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
import BoldIcon from './icons/BoldIcon.vue'
import ItalicIcon from './icons/ItalicIcon.vue'
import UnderlineIcon from './icons/UnderlineIcon.vue'
import ListIcon from './icons/ListIcon.vue'
import OrderedListIcon from './icons/OrderedListIcon.vue'
import QuoteIcon from './icons/QuoteIcon.vue'
import PieChartIcon from './icons/PieChartIcon.vue'
import MapIcon from './icons/MapIcon.vue'
import CodeIcon from './icons/CodeIcon.vue'

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

const wordCount = computed(() => {
  if (!editor.value || editor.value.isDestroyed) return 0
  const text = editor.value.getText() || ''
  return text.replace(/\s/g, '').length
})

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

const chartSlugs = computed(() => {
  const slugs = []
  if (!editor.value) return slugs
  const html = editor.value.getHTML() || ''
  let match
  while ((match = chartRegex.exec(html)) !== null) {
    if (!slugs.includes(match[1])) {
      slugs.push(match[1])
    }
  }
  return slugs
})

const chartCount = computed(() => chartSlugs.value.length)

const mapRegex = /\{\{map:([a-zA-Z0-9-_]+)\}\}/g

const mapTokens = computed(() => {
  const tokens = []
  if (!editor.value) return tokens
  const html = editor.value.getHTML() || ''
  let match
  while ((match = mapRegex.exec(html)) !== null) {
    if (!tokens.includes(match[1])) {
      tokens.push(match[1])
    }
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
  contentHtml: editor.value ? editor.value.getHTML() : articleForm.value.contentHtml
}))

const editor = useEditor({
  content: '',
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
      link: { openOnClick: false }
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
    articleForm.value.contentHtml = editor.value.getHTML()
    articleForm.value.contentJson = JSON.stringify(editor.value.getJSON())
  },
  onFocus: () => { editorFocused.value = true },
  onBlur: () => { editorFocused.value = false },
  editorProps: {
    attributes: { class: 'prose-editor' }
  }
})
onMounted(() => {
  editor.value?.on('chart-picker-open', () => {
    openChartPicker()
  })
})

function loadArticleContent(data) {
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
      if (editor.value && !editor.value.isDestroyed) {
        loadArticleContent(data)
      }
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
  if (editor.value && !editor.value.isDestroyed) {
    return {
      contentHtml: escapeHtmlAttrQuotes(editor.value.getHTML()),
      contentJson: JSON.stringify(editor.value.getJSON()),
    }
  }
  return {
    contentHtml: escapeHtmlAttrQuotes(articleForm.value.contentHtml),
    contentJson: articleForm.value.contentJson,
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

function buildSaveData() {
  const rawHtml = editor.value?.getHTML() || articleForm.value.contentHtml
  const rawJson = editor.value ? JSON.stringify(editor.value.getJSON()) : articleForm.value.contentJson
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
  // restoreStaticUrlsInHtml must run BEFORE escapeHtmlAttrQuotes (needs double-quoted attributes)
  data.contentHtml = escapeHtmlAttrQuotes(restoreStaticUrlsInHtml(rawHtml))
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

const showSourceDialog = () => {
  if (editor.value && !editor.value.isDestroyed) {
    sourceHtml.value = editor.value.getHTML()
  }
  sourceDialogVisible.value = true
}

const applySourceHtml = () => {
  if (editor.value && !editor.value.isDestroyed) {
    editor.value.commands.setContent(sourceHtml.value, true)
  }
  sourceDialogVisible.value = false
}

const insertImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    // TODO: upload image and insert
    ElMessage.info('图片上传功能待集成')
  }
  input.click()
}

const insertVideo = () => {
  ElMessage.info('视频插入功能待集成')
}

const insertAudio = () => {
  ElMessage.info('音频插入功能待集成')
}

const insertLink = () => {
  const url = prompt('请输入链接地址：')
  if (url && editor.value && !editor.value.isDestroyed) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}

// ===== 工具栏数据 =====
const fontSizes = [12, 14, 15, 16, 17, 18, 20, 24]
const lineHeights = [1, 1.5, 1.6, 1.75, 2, 3, 4, 5]
const letterSpacings = ['0', '0.5', '1', '2']

const currentFontSize = computed(() => {
  if (!editor.value) return '16'
  const attrs = editor.value.getAttributes('textStyle')
  return attrs.fontSize || '16'
})

const currentColor = computed(() => {
  if (!editor.value) return '#000000'
  return editor.value.getAttributes('textStyle').color || '#000000'
})

const currentBgColor = computed(() => {
  if (!editor.value) return '#ffffff'
  return editor.value.getAttributes('highlight').color || '#ffffff'
})

const currentAlign = computed(() => {
  if (!editor.value) return 'left'
  if (editor.value.isActive({ textAlign: 'left' })) return 'left'
  if (editor.value.isActive({ textAlign: 'center' })) return 'center'
  if (editor.value.isActive({ textAlign: 'right' })) return 'right'
  if (editor.value.isActive({ textAlign: 'justify' })) return 'justify'
  return 'left'
})

const currentMarginTop = computed(() => {
  if (!editor.value) return '0'
  const node = editor.value.state.selection.$head.parent
  return node.attrs.marginTop || '0'
})

const currentMarginBottom = computed(() => {
  if (!editor.value) return '0'
  const node = editor.value.state.selection.$head.parent
  return node.attrs.marginBottom || '0'
})

const currentLineHeight = computed(() => {
  if (!editor.value) return '1.6'
  const node = editor.value.state.selection.$head.parent
  return node.attrs.lineHeight || '1.6'
})

const currentLetterSpacing = computed(() => {
  if (!editor.value) return '0'
  const node = editor.value.state.selection.$head.parent
  return node.attrs.letterSpacing || '0'
})

const currentListStyle = computed(() => {
  if (!editor.value) return 'disc'
  if (editor.value.isActive('bulletList')) return 'disc'
  if (editor.value.isActive('orderedList')) return 'decimal'
  return 'disc'
})

const currentFloat = computed(() => {
  if (!editor.value) return 'none'
  const attrs = editor.value.getAttributes('image')
  return attrs.float || 'none'
})

// ===== 工具栏操作 =====
const setFontSize = (size) => {
  if (!editor.value) return
  if (size === '16') editor.value.chain().focus().unsetFontSize().run()
  else editor.value.chain().focus().setFontSize(size).run()
}

const setColor = (color) => {
  if (!editor.value) return
  if (color === '#000000' || color === '#000') editor.value.chain().focus().unsetColor().run()
  else editor.value.chain().focus().setColor(color).run()
}

const setBgColor = (color) => {
  if (!editor.value) return
  if (color === '#ffffff' || color === '#fff') editor.value.chain().focus().unsetHighlight().run()
  else editor.value.chain().focus().toggleHighlight({ color }).run()
}

const setAlign = (align) => {
  if (!editor.value) return
  editor.value.chain().focus().setTextAlign(align).run()
}

const indentMore = () => {
  if (!editor.value) return
  const node = editor.value.state.selection.$head.parent
  const cur = parseInt(node.attrs.indent) || 0
  const next = cur + 20
  editor.value.chain().focus().setIndent(next + 'px').run()
}

const setMarginTop = (v) => {
  if (!editor.value) return
  if (v === '0') editor.value.chain().focus().unsetMarginTop().run()
  else editor.value.chain().focus().setMarginTop(v + 'px').run()
}

const setMarginBottom = (v) => {
  if (!editor.value) return
  if (v === '0') editor.value.chain().focus().unsetMarginBottom().run()
  else editor.value.chain().focus().setMarginBottom(v + 'px').run()
}

const setLineHeight = (v) => {
  if (!editor.value) return
  if (v === '1.6') editor.value.chain().focus().unsetLineHeight().run()
  else editor.value.chain().focus().setLineHeight(v).run()
}

const setLetterSpacing = (v) => {
  if (!editor.value) return
  if (v === '0') editor.value.chain().focus().unsetLetterSpacing().run()
  else editor.value.chain().focus().setLetterSpacing(v + 'px').run()
}

const setListStyle = (style) => {
  if (!editor.value) return
  if (style === 'decimal') editor.value.chain().focus().toggleOrderedList().run()
  else editor.value.chain().focus().toggleBulletList().run()
}

const setFloat = (v) => {
  if (!editor.value) return
  if (v === 'none') ElMessage.info('取消浮动')
  else ElMessage.info('设置浮动: ' + v)
}

const insertTable = () => {
  if (!editor.value) return
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const formatPainterActive = ref(false)
let copiedMarks = []

const startFormatPainter = () => {
  if (!editor.value) return
  if (formatPainterActive.value) {
    if (copiedMarks.length > 0) {
      const chain = editor.value.chain().focus()
      copiedMarks.forEach(mark => {
        if (mark.type === 'bold') chain.setBold()
        else if (mark.type === 'italic') chain.setItalic()
        else if (mark.type === 'underline') chain.setUnderline()
        else if (mark.type === 'strike') chain.setStrike()
        else if (mark.type === 'textStyle' && mark.attrs) {
          if (mark.attrs.fontSize) chain.setFontSize(mark.attrs.fontSize)
          if (mark.attrs.color) chain.setColor(mark.attrs.color)
        }
        else if (mark.type === 'highlight' && mark.attrs) chain.toggleHighlight(mark.attrs)
      })
      chain.run()
    }
    formatPainterActive.value = false
    copiedMarks = []
  } else {
    const marks = editor.value.state.selection.$head.marks()
    copiedMarks = marks.map(m => ({ type: m.type.name, attrs: { ...m.attrs } }))
    formatPainterActive.value = true
    ElMessage.info('格式刷已激活，请选择要应用格式的文本')
  }
}

const emojiPickerVisible = ref(false)
const emojiList = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤟', '🤘', '👌', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '💯', '🔥', '⭐', '🌟', '✨', '💡', '📌', '🎉', '🎊', '🎈', '🏆', '✅', '❌', '❗', '❓', '💪', '🤷', '🙋', '💃', '🕺']

const openEmojiPicker = () => {
  emojiPickerVisible.value = !emojiPickerVisible.value
}

const insertEmoji = (emoji) => {
  if (!editor.value) return
  editor.value.chain().focus().insertContent(emoji).run()
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

  if (editor.value && !editor.value.isDestroyed) {
    articleForm.value.contentHtml = editor.value.getHTML()
    articleForm.value.contentJson = JSON.stringify(editor.value.getJSON())
  }

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
        } catch { /* 兼容旧版 publish_job 表 */ }
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
  if (tplHtml && editor.value && !editor.value.isDestroyed) {
    editor.value.commands.setContent(tplHtml, true)
    return
  }
  try {
    const res = await getTemplate(templateId)
    if (res.code === 200 && res.data) {
      const tpl = res.data
      if (tpl.snapshotJson && editor.value && !editor.value.isDestroyed) {
        const content = typeof tpl.snapshotJson === 'string' ? JSON.parse(tpl.snapshotJson) : tpl.snapshotJson
        editor.value.commands.setContent(content)
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

onMounted(() => {
  // 页面级 referrer 策略：防止微信防盗链拦截图片
  referrerMeta = document.createElement('meta')
  referrerMeta.name = 'referrer'
  referrerMeta.content = 'no-referrer'
  document.head.appendChild(referrerMeta)

  document.addEventListener('click', closeEmojiPicker)
  if (route.query.id) {
    loadArticle()
  } else if (route.query.templateId) {
    loadTemplate(route.query.templateId)
  }
})

onBeforeUnmount(() => {
  if (referrerMeta) referrerMeta.remove()
  document.removeEventListener('click', closeEmojiPicker)
  if (editor.value && !editor.value.isDestroyed) {
    editor.value.destroy()
  }
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

/* ===================== 媒体插入工具栏 ===================== */
.wx-insert-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 8px;
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
  position: sticky;
  top: 52px;
  z-index: 9;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 4px 8px;
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 8px;

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

  .wx-fmt-color {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 26px;
    cursor: pointer;

    svg { width: 15px; height: 15px; color: #606266; }
    &:hover svg { color: #409eff; }

    .wx-color-input {
      position: absolute;
      width: 0;
      height: 0;
      opacity: 0;
      padding: 0;
      border: none;
      overflow: hidden;
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

.editor-content {
  padding: 2px 0;
  min-height: 180px;
  font-size: 15px;
  color: #333;
  word-wrap: break-word;

  :deep(.ProseMirror) {
    min-height: 180px;
    outline: none;

    p {
      margin: 0 0 8px;
    }

    p.is-editor-empty:first-child::before {
      color: #c0c4cc;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
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
  }
}

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
</style>
