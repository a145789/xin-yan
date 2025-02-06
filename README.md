# Xin Yan - 基于Vue 3的明信片生成器

## 项目概述

Xin Yan 是一个基于Vue 3的明信片生成器，能够从图片中提取主色调并生成美观的明信片设计。项目采用现代前端技术栈，提供了高效的开发体验和优秀的性能表现。

## 技术栈

- Vue 3
- Vite
- TypeScript
- UnoCSS
- ESLint
- PNPM

## 项目结构

```
.
├── public/               # 静态资源
├── src/
│   ├── assets/           # 字体、图片等资源
│   ├── components/       # 通用组件
│   ├── composables/      # 组合式API
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面组件
│   ├── styles/           # 全局样式
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── .editorconfig         # 编辑器配置
├── .gitignore            # Git忽略配置
├── .npmrc                # NPM配置
├── eslint.config.js      # ESLint配置
├── index.html            # 主HTML文件
├── LICENSE               # 许可证
├── package.json          # 项目依赖
├── pnpm-lock.yaml        # PNPM锁文件
├── tsconfig.json         # TypeScript配置
├── uno.config.ts         # UnoCSS配置
└── vite.config.ts        # Vite配置
```

## 开发环境配置

1. 安装 [Node.js](https://nodejs.org/) (推荐使用 v18+)
2. 安装 [PNPM](https://pnpm.io/):
   ```bash
   npm install -g pnpm
   ```
3. 安装依赖：
   ```bash
   pnpm install
   ```

## 开发命令

- 启动开发服务器：
  ```bash
  pnpm dev
  ```
- 代码格式化：
  ```bash
  pnpm lint
  ```
- 类型检查：
  ```bash
  pnpm typecheck
  ```

## 构建命令

- 生产环境构建：
  ```bash
  pnpm build
  ```
- 预览生产构建：
  ```bash
  pnpm preview
  ```

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建新的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 [MIT License](LICENSE) 开源协议。
