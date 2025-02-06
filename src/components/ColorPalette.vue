<script lang="ts" setup>
import { getTextColor } from '~/utils'

interface Props {
  colors: string[]
  columns?: number
  currentColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  columns: 5,
})

const emit = defineEmits<{
  (e: 'select', color: string): void
}>()

// 计算每个色块的尺寸
const gridStyles = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`,
}))

function handleColorClick(color: string) {
  emit('select', color)
}
</script>

<template>
  <div class="w-full rounded-xl bg-gray-50 p-4 shadow-lg">
    <div
      class="grid gap-3"
      :style="gridStyles"
    >
      <div
        v-for="(color, index) in colors"
        :key="index"
        class="group relative aspect-square cursor-pointer rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        :class="{
          'scale-105': color === currentColor,
        }"
        :style="{ backgroundColor: color }"
        @click="handleColorClick(color)"
      >
        <!-- 色值显示 -->
        <div
          class="absolute inset-0 hidden items-center justify-center rounded-lg opacity-0 backdrop-blur-sm transition-opacity duration-300 md:flex group-hover:opacity-100"
          :class="getTextColor(color, 'text-gray-800', 'text-white')"
        >
          <span class="text-sm font-mono">{{ color }}</span>
        </div>

        <!-- 选中动画效果 -->
        <div
          class="absolute inset-0 rounded-lg ring-2 ring-offset-2 ring-offset-gray-50 transition-all duration-300"
          :style="{
            '--un-ring-color': color !== currentColor ? 'transparent' : currentColor,
          }"
        />
      </div>
    </div>
  </div>
</template>
