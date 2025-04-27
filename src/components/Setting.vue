<script setup lang="ts">
import type { PostcardConfig } from '../pages/index.vue'

const config = defineModel<PostcardConfig>({
  required: true,
})

// 配置项的限制范围
const configRanges = {
  blurAmount: { min: 0, max: 10, step: 0.1 },
  padding: { min: 0, max: 48, step: 1 },
  shadowSize: { min: 0, max: 48, step: 1 },
  borderRadius: { min: 0, max: 48, step: 1 },
  imageBorderRadius: { min: 0, max: 48, step: 1 },
}
</script>

<template>
  <div class="setting-container">
    <var-space direction="column" :size="16">
      <!-- 背景模糊度设置 -->
      <div class="setting-item">
        <div class="setting-label">
          背景模糊度 {{ config.blurAmount }}
        </div>
        <div class="setting-control">
          <var-slider
            label-visible="always"
            :max="configRanges.blurAmount.max"
            :min="configRanges.blurAmount.min"
            :step="configRanges.blurAmount.step"
            v-model="config.blurAmount"
          />
        </div>
      </div>

      <!-- 内边距设置 -->
      <div class="setting-item">
        <div class="setting-label">
          内边距 {{ config.padding }}
        </div>
        <div class="setting-control">
          <var-slider
            label-visible="always"
            :max="configRanges.padding.max"
            :min="configRanges.padding.min"
            :step="configRanges.padding.step"
            v-model="config.padding"
          />
        </div>
      </div>

      <!-- 阴影大小设置 -->
      <div class="setting-item">
        <div class="setting-label">
          阴影大小 {{ config.shadowSize }}
        </div>
        <div class="setting-control">
          <var-slider
            label-visible="always"
            :max="configRanges.shadowSize.max"
            :min="configRanges.shadowSize.min"
            :step="configRanges.shadowSize.step"
            v-model="config.shadowSize"
          />
        </div>
      </div>

      <!-- 外边框圆角设置 -->
      <div class="setting-item">
        <div class="setting-label">
          外边框圆角 {{ config.borderRadius }}
        </div>
        <div class="setting-control">
          <var-slider
            label-visible="always"
            :max="configRanges.borderRadius.max"
            :min="configRanges.borderRadius.min"
            :step="configRanges.borderRadius.step"
            v-model="config.borderRadius"
          />
        </div>
      </div>

      <!-- 图片圆角设置 -->
      <div class="setting-item">
        <div class="setting-label">
          图片圆角 {{ config.imageBorderRadius }}
        </div>
        <div class="setting-control">
          <var-slider
            label-visible="always"
            :max="configRanges.imageBorderRadius.max"
            :min="configRanges.imageBorderRadius.min"
            :step="configRanges.imageBorderRadius.step"
            v-model="config.imageBorderRadius"
          />
        </div>
      </div>
    </var-space>
  </div>
</template>

<style scoped>
.setting-container {
  padding: 16px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
}

.setting-control {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
}

:deep(.var-slider) {
  flex: 1;
}

:deep(.var-input) {
  width: 100px;
}
</style>
