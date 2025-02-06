<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex flex-col transition-all duration-300 dark:bg-#060606">
    <!-- 顶部导航 -->
    <nav class="sticky top-0 z-50 shadow-md">
      <div class="mx-auto h-14 max-w-screen-xl flex items-center justify-between bg-#fff px-4 dark:bg-#1b1b1f dark:text-zinc-200">
        <h1 class="text-xl font-bold">
          心颜
        </h1>

        <div class="text-22px">
          <a
            className="mx-6px"
            href="https://github.com/a145789/xin-yan"
            rel="noreferrer noopener"
            target="_blank"
          >
            <div className="i-uil-github-alt hover:i-mingcute-github-fill transition-all duration-200" />
          </a>

          <div
            className="i-ph-moon-stars-fill dark:i-ic-baseline-light-mode mx-6px cursor-pointer transition-all duration-200"
            @click="toggleDark()"
          />
        </div>
      </div>
    </nav>

    <!-- 内容区域 -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
