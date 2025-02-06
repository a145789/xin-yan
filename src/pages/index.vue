<script setup lang="ts" generic="T extends any, O extends any">
import html2canvas from 'html2canvas'
import { computed, ref } from 'vue'
import Postcard from '~/components/Postcard.vue'
import MainLayout from '~/layouts/MainLayout.vue'

defineOptions({
  name: 'IndexPage',
})

const imageUrl = ref('')
const postcardText = ref('')
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

async function exportPostcard() {
  if (previewImage.value) {
    try {
      const canvas = await html2canvas(postcardRef.value!.$el)
      const link = document.createElement('a')
      link.download = 'postcard.png'
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Export failed', error)
    }
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
        </div>

        <var-loading
          description="正在解析图片"
          :loading="imageLoading"
          type="cube"
        >
          <!-- Postcard Preview -->
          <div
            v-if="previewImage && imageData"
            class="mb-4"
          >
            <div v-if="ocColors.length || quickColors.length" class="mx-auto mb-12px max-w-[88%] flex flex-col gap-12px">
              <ColorPalette
                v-if="ocColors.length"
                :colors="ocColors"
                :current-color
                @select="(color) => currentColor = color"
              />
              <ColorPalette
                v-if="quickColors.length"
                :colors="quickColors"
                :current-color
                @select="(color) => currentColor = color"
              />
            </div>

            <Postcard
              ref="postcardRef"
              :color="currentColor"
              :image="previewImage"
              :message="postcardText"
            />

            <div class="mt-4">
              <var-space justify="flex-end">
                <var-button
                  type="danger"
                  @click="resetImage"
                >
                  重新上传
                </var-button>
                <!-- Export var-button -->
                <var-button
                  @click="exportPostcard"
                >
                  下载
                </var-button>
              </var-space>
            </div>

            <div class="mt-4">
              <var-input
                placeholder="输入寄语"
                rows="3"
                size="small"
                textarea
                variant="outlined"
                v-model="postcardText"
              />
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
