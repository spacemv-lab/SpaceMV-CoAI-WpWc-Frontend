<template>
  <div
    v-if="visible"
    class="style-floating-toolbar"
    :style="toolbarStyle"
  >
    <!-- 颜色 -->
    <div class="toolbar-group">
      <el-popover placement="top" :width="200" trigger="click">
        <template #reference>
          <el-button size="small" class="toolbar-btn">
            <span class="color-dot" :style="{ background: currentColor }"></span>
            颜色
          </el-button>
        </template>
        <div class="color-picker-panel">
          <div
            v-for="c in presetColors"
            :key="c"
            class="color-option"
            :class="{ active: currentColor === c }"
            :style="{ background: c }"
            @click="applyStyle('color', c)"
          />
          <el-input v-model="customColor" placeholder="#548DD4" size="small" class="custom-color-input" @change="applyStyle('color', customColor)" />
        </div>
      </el-popover>
    </div>

    <!-- 字号 -->
    <div class="toolbar-group">
      <el-select v-model="currentFontSize" size="small" style="width: 80px" @change="v => applyStyle('fontSize', v)">
        <el-option v-for="s in fontSizes" :key="s" :label="s" :value="s" />
      </el-select>
    </div>

    <!-- 装饰 -->
    <div class="toolbar-group">
      <el-popover placement="top" :width="160" trigger="click">
        <template #reference>
          <el-button size="small" class="toolbar-btn">
            {{ currentDecoration || '装饰' }}
          </el-button>
        </template>
        <div class="decoration-panel">
          <el-button v-for="d in decorations" :key="d.value" size="small" :type="currentDecoration === d.label ? 'primary' : ''" @click="applyDecoration(d)">
            {{ d.label }}
          </el-button>
        </div>
      </el-popover>
    </div>

    <!-- 加粗 -->
    <div class="toolbar-group">
      <el-button
        size="small"
        class="toolbar-btn"
        :class="{ 'is-active': currentBold }"
        @click="toggleBold"
      ><strong>B</strong></el-button>
    </div>

    <!-- 清样式 -->
    <div class="toolbar-group">
      <el-button size="small" class="toolbar-btn" @click="clearStyle">清样式</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StyleFloatingToolbar',
  props: {
    visible: { type: Boolean, default: false },
    position: { type: Object, default: () => ({ top: 0, left: 0 }) },
    currentStyles: { type: Object, default: () => ({}) },
    nodeType: { type: String, default: '' }
  },
  emits: ['apply-style', 'clear-style', 'toggle-bold'],
  data() {
    return {
      presetColors: [
        '#548DD4', '#FF6D00', '#F44336', '#E91E63', '#9C27B0',
        '#673AB7', '#3F51B5', '#2196F3', '#009688', '#4CAF50',
        '#FFEB3B', '#FF9800', '#795548', '#607D8B', '#333333'
      ],
      customColor: '',
      fontSizes: ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px'],
      decorations: [
        { label: '无', value: 'none' },
        { label: '左竖线', value: 'borderLeft' },
        { label: '底线', value: 'borderBottom' },
        { label: '色块', value: 'bgColor' }
      ]
    }
  },
  computed: {
    toolbarStyle() {
      return {
        top: `${this.position.top}px`,
        left: `${this.position.left}px`
      }
    },
    currentColor() {
      return this.currentStyles.color || '#548DD4'
    },
    currentFontSize() {
      return this.currentStyles.fontSize || '16px'
    },
    currentDecoration() {
      if (this.currentStyles.borderLeft && this.currentStyles.borderLeft !== 'none') return '左竖线'
      if (this.currentStyles.borderBottom && this.currentStyles.borderBottom !== 'none') return '底线'
      if (this.currentStyles.bgColor) return '色块'
      return '无'
    },
    currentBold() {
      return this.currentStyles.fontWeight === 'bold'
    }
  },
  methods: {
    applyStyle(key, value) {
      if (!value) return
      this.$emit('apply-style', { key, value })
    },
    applyDecoration(dec) {
      const styles = {}
      if (dec.value === 'none') {
        styles.borderLeft = 'none'
        styles.borderBottom = 'none'
        styles.bgColor = 'none'
      } else if (dec.value === 'borderLeft') {
        styles.borderLeft = `3px solid ${this.currentColor}`
        styles.borderBottom = 'none'
        styles.bgColor = 'none'
      } else if (dec.value === 'borderBottom') {
        styles.borderBottom = `2px solid ${this.currentColor}`
        styles.borderLeft = 'none'
        styles.bgColor = 'none'
      } else if (dec.value === 'bgColor') {
        styles.bgColor = `${this.currentColor}15`
        styles.borderLeft = 'none'
        styles.borderBottom = 'none'
      }
      Object.entries(styles).forEach(([key, value]) => {
        if (value) this.$emit('apply-style', { key, value })
      })
    },
    toggleBold() {
      this.$emit('toggle-bold')
    },
    clearStyle() {
      this.$emit('clear-style')
    }
  }
}
</script>

<style scoped>
.style-floating-toolbar {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transform: translateY(-100%);
  margin-top: -8px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-btn {
  font-size: 12px;
  padding: 4px 8px;
}

.toolbar-btn.is-active {
  background: #ecf5ff;
  color: #409eff;
}

.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  vertical-align: middle;
  margin-right: 2px;
}

.color-picker-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
}

.color-option.active {
  border-color: #409eff;
}

.custom-color-input {
  margin-top: 8px;
}

.decoration-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
}
</style>
