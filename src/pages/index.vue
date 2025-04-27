<script setup lang="ts" generic="T extends any, O extends any">
import { computed, ref } from 'vue'
import Postcard from '~/components/Postcard.vue'
import Setting from '~/components/Setting.vue'
import MainLayout from '~/layouts/MainLayout.vue'

export interface PostcardConfig {
  /** 背景模糊程度 0-10 */
  blurAmount: number
  /** 内边距 px */
  padding: number
  /** 阴影大小 px */
  shadowSize: number
  /** 外边框圆角 px */
  borderRadius: number
  /** 图片圆角 px */
  imageBorderRadius: number
}

defineOptions({
  name: 'IndexPage',
})

const postcardConfig = ref<PostcardConfig>({
  blurAmount: 5,
  padding: 30,
  shadowSize: 12,
  borderRadius: 12,
  imageBorderRadius: 8,
})

const imageUrl = ref('')
const imageFile = ref<File | null>(null)
const currentColor = ref('')

const postcardRef = useTemplateRef<InstanceType<typeof Postcard>>('postcardRef')

const previewImage = computed(() => {
  if (imageFile.value) {
    return URL.createObjectURL(imageFile.value)
  }
  return imageUrl.value
})

const { imageData, imageLoading } = useImageData(previewImage)

const { ocColors } = useOctreeColorExtractor(imageData)
const { quickColors } = useQuickColorExtractor(imageData)
watchEffect(() => {
  if (quickColors.value.length) {
    currentColor.value = quickColors.value[0]
  }
})

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    imageFile.value = target.files[0]
  }
}

function resetImage() {
  imageUrl.value = ''
  imageFile.value = null
}
</script>

<template>
  <MainLayout>
    <div class="min-h-screen">
      <div class="mx-auto px-4 py-8 container">
        <!-- Header -->
        <div class="mb-5 flex items-center justify-between">
          <h1 class="from-purple-600 to-pink-600 bg-gradient-to-r bg-clip-text text-3xl text-transparent font-bold">
            Postcard Creator
          </h1>

          <var-button
            v-if="previewImage && imageData"
            type="danger"
            @click="resetImage"
          >
            重新上传
          </var-button>
        </div>

        <var-loading
          description="正在解析图片"
          :loading="imageLoading"
          type="cube"
        >
          <!-- Postcard Preview -->
          <div v-if="previewImage && imageData" class="flex flex-col gap-4 md:flex-row">
            <div
              class="grid cols-1 mb-4 w-full gap-4 md:cols-3 md:flex-1"
            >
              <Postcard
                ref="postcardRef"
                :background="previewImage"
                :image="previewImage"
                is-background-image
                v-bind="postcardConfig"
              />

              <Postcard
                v-for="color of ocColors"
                :key="color"
                ref="postcardRef"
                :background="color"
                :image="previewImage"
                v-bind="postcardConfig"
              />

              <Postcard
                v-for="color of quickColors"
                :key="color"
                ref="postcardRef"
                :background="color"
                :image="previewImage"
                v-bind="postcardConfig"
              />
            </div>

            <div class="w-100% md:w-30%">
              <Setting v-model="postcardConfig" />
            </div>
          </div>

          <!-- Input Section -->
          <div v-if="!imageData || !previewImage" class="grid gap-8px md:grid-cols-2">
            <div class="border-2 rounded-xl border-dashed transition-colors dark:border-gray-700 hover:border-purple-500">
              <input
                id="file-upload"
                accept="image/*"
                class="hidden"
                type="file"
                @change="handleFileUpload"
              >
              <label
                class="flex cursor-pointer items-center justify-center gap-4px py-6 text-24px"
                for="file-upload"
              >
                <div
                  className="i-ph-camera-plus-fill dark:color-#e4e4e7"
                />
                <span class="block text-sm text-gray-500 font-medium dark:text-gray-300">
                  上传图片
                </span>
              </label>
            </div>

            <div class="space-y-2">
              <var-input
                placeholder="或输入图像URL"
                v-model="imageUrl"
              />
            </div>
          </div>
        </var-loading>
      </div>
    </div>
  </MainLayout>
</template>
