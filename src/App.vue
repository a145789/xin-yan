<script setup lang="ts">
import { StyleProvider, Themes } from '@varlet/ui'

watch(isDark, (dark) => {
  if (dark) {
    StyleProvider(Themes.md3Dark)
  } else {
    StyleProvider(Themes.md3Light)
  }
}, {
  immediate: true,
})
</script>

<template>
  <main>
    <RouterView />
  </main>
</template>
