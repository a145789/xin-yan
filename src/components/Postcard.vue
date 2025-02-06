<script setup lang="ts">
import { getTextColor } from '~/utils'

interface PostcardProps {
  image: string
  message?: string
  color: string
}

withDefaults(defineProps<PostcardProps>(), {
  message: 'Your message will appear here...',
})
</script>

<template>
  <div class="rounded-xl bg-#0000">
    <div
      class="group relative mx-auto max-w-sm w-full overflow-hidden rounded-xl p-4 pb-5 shadow-2xl"
      :style="{
        backgroundColor: color,
      }"
    >
      <!-- Image -->
      <div
        class="aspect-[4/3] w-full rounded-xl bg-cover bg-center"
        :style="{ backgroundImage: `url(${image})` }"
      />

      <!-- Message -->
      <div v-if="message" class="pt-4">
        <!-- 英文数字折行显示 -->
        <p
          class="font-smiley-sans line-clamp-2 break-words text-sm tracking-1px md:text-base"
          :class="getTextColor(color, 'text-gray-800', 'text-white')"
        >
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>
