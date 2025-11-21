# Xin-Yan (明信片生成器)

一个优雅的在线明信片生成工具，能够自动提取图片主题色，生成多种风格的精美明信片。

> 🤖 **声明**：本项目代码及文档由 AI 辅助生成。

## ✨ 功能特性

- **图片上传**：支持本地上传或输入图片 URL。
- **智能取色**：自动提取图片中的 10 种主色调。
- **多样化生成**：
  - 基于提取色的纯色背景明信片。
  - 高斯模糊背景明信片。
- **实时预览**：所见即所得的编辑体验。
- **个性化设置**：
  - 可调节边距 (Padding)。
  - 可调节圆角 (Border Radius)。
  - 可调节模糊程度 (Blur Amount)。
- **深色模式**：内置明亮/深色主题切换，适配不同光照环境。
- **一键下载**：点击生成的明信片即可保存到本地。

## 🛠️ 技术栈

- [React](https://react.dev/) - 用于构建用户界面的 JavaScript 库
- [Vite](https://vitejs.dev/) - 以此为基础的极速前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - 提供类型安全的 JavaScript 超集
- [Lucide React](https://lucide.dev/) - 精美的图标库
- [ColorThief](https://lokeshdhakar.com/projects/color-thief/) - 图片颜色提取工具

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd xin-yan
```

### 2. 安装依赖

推荐使用 `pnpm`：

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

打开浏览器访问控制台输出的地址（通常是 `http://localhost:5173`）即可使用。

## 📄 许可证

MIT License
