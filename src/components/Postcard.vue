<script setup lang="ts">
import type { StyleValue } from 'vue'
import type { PostcardConfig } from '../pages/index.vue'
import { useElementToImage } from '~/composables/useElementToImage'

interface PostcardProps extends PostcardConfig {
  image: string
  background: string // 支持URL/base64或hex颜色
  isBackgroundImage?: boolean // 是否使用图片作为背景
}

const props = withDefaults(defineProps<PostcardProps>(), {
  isBackgroundImage: false,
})

// 图片尺寸相关状态
const imageWidth = ref(0)
const imageHeight = ref(0)
const imageLoaded = ref(false)
const imageError = ref(false)
const postcardContainer = ref<HTMLElement | null>(null)
const aspectRatioValue = ref('auto')

// 检测背景是否为base64或URL格式
const isBackgroundImageUrl = computed(() => {
  if (!props.isBackgroundImage) {
    return false
  }
  return props.background && (
    props.background.startsWith('http')
    || props.background.startsWith('blob:')
  )
})

// 加载图片并获取尺寸
function loadImage() {
  if (!props.image) {
    imageLoaded.value = false
    imageError.value = true
    return
  }

  imageError.value = false

  const img = new Image()
  img.onload = () => {
    imageWidth.value = img.naturalWidth
    imageHeight.value = img.naturalHeight

    // 计算宽高比
    if (imageWidth.value && imageHeight.value) {
      aspectRatioValue.value = `${(imageHeight.value / imageWidth.value * 100).toFixed(2)}%`
    }

    imageLoaded.value = true
  }
  img.onerror = () => {
    imageLoaded.value = false
    imageError.value = true
    console.error('图片加载失败:', props.image)
  }
  img.src = props.image
}

// 计算图片容器样式
const imageContainerStyle = computed(() => ({
  borderRadius: `${props.imageBorderRadius}px`,
  display: 'block',
  width: '100%',
  aspectRatio: imageLoaded.value ? `${imageWidth.value} / ${imageHeight.value}` : 'auto',
} as StyleValue))

const containerStyle = computed(() => ({
  '--padding': `${props.padding}px`,
  'borderRadius': `${props.borderRadius}px`,
  'overflow': 'hidden',
  'display': 'inline-block',
  'transition': 'all 0.3s ease',
  'background': 'transparent',
}))

// 计算背景样式
const backgroundStyle = computed(() => {
  const baseStyle: Record<string, string> = {
    filter: `blur(${props.blurAmount}px)`,
    WebkitFilter: `blur(${props.blurAmount}px)`, // Safari 支持
  }

  if (props.isBackgroundImage && isBackgroundImageUrl.value) {
    return {
      ...baseStyle,
      backgroundImage: `url(${props.background})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  } else {
    return {
      ...baseStyle,
      backgroundColor: props.isBackgroundImage ? 'rgba(255,255,255,0.8)' : props.background,
    }
  }
})

// 监听图片变化
watch(() => props.image, () => {
  imageLoaded.value = false
  loadImage()
}, { immediate: true })

// 监听背景变化
watch(() => props.background, () => {
  // 如果背景是图片，可能需要预加载
  if (props.isBackgroundImage && isBackgroundImageUrl.value) {
    const bgImg = new Image()
    bgImg.src = props.background
  }
}, { immediate: true })

onMounted(() => {
  // 确保组件挂载后加载图片
  if (!imageLoaded.value && !imageError.value) {
    loadImage()
  }
})

const { downloadElementAsImage } = useElementToImage(postcardContainer)

function handleSelect() {
  downloadElementAsImage()
}

const isLargeScreen = useMediaQuery('(min-width: 768px)')
</script>

<template>
  <var-menu-select :trigger="isLargeScreen ? 'hover' : 'click'" @select="handleSelect">
    <div
      ref="postcardContainer"
      class="postcard-container"
      :style="containerStyle"
    >
      <div
        class="postcard-background"
        :style="backgroundStyle"
      />
      <div class="postcard-content">
        <div
          v-if="imageLoaded"
          class="postcard-image-container"
          :style="imageContainerStyle"
        >
          <div
            class="postcard-image"
            :style="{
              backgroundImage: `url(${props.image})`,
              borderRadius: `${props.imageBorderRadius}px`,
              boxShadow: `0 ${props.shadowSize / 2}px ${props.shadowSize}px rgba(0, 0, 0, 0.3)`,
              zIndex: 1,
            }"
          />
        </div>
        <div
          v-else-if="imageError"
          class="postcard-error flex items-center justify-center p-4 text-center"
        >
          <span class="text-sm text-red-500">图片加载失败</span>
        </div>
        <div
          v-else
          class="postcard-loading animate-pulse rounded"
          :style="{
            borderRadius: `${props.imageBorderRadius}px`,
            minHeight: '120px',
            minWidth: '160px',
          }"
        />
      </div>
    </div>

    <template #options>
      <var-menu-option label="下载" />
    </template>
  </var-menu-select>
</template>

<style scoped>
.postcard-container {
  display: inline-block;
  position: relative;
  width: 100%;
}

.postcard-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  transition:
    filter 0.3s ease,
    -webkit-filter 0.3s ease;
}

.postcard-content {
  position: relative;
  z-index: 1;
  padding: var(--padding);
}

.postcard-image-container {
  position: relative;
}

.postcard-image {
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-size: cover;
  background-position: center;
}

.postcard-loading {
  background-color: rgba(200, 200, 200, 0.3);
}

.postcard-error {
  min-height: 120px;
  min-width: 160px;
  background-color: rgba(255, 240, 240, 0.5);
  border: 1px dashed rgba(255, 0, 0, 0.2);
}

/* 添加过渡效果 */
.postcard-image,
.postcard-image-container,
.postcard-background,
.postcard-container {
  transition: all 0.3s ease;
}
</style>
