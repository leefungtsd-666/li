# li

一款极简、沉浸式的 Markdown 写作工具，提供类似 Typora 的编辑体验。

基于 **Tauri v2**、**React**、**TypeScript**、**Vite** 和 **Milkdown/Crepe** 构建。

## 特性

- WYSIWYG Markdown 编辑（Milkdown/Crepe）
- 源码模式 / 渲染模式切换
- 标题（H1-H4）、列表、引用、代码块
- 加粗、斜体、链接、表格、图片
- LaTeX 数学公式（行内和块级，基于 KaTeX）
- 右侧大纲面板，支持标题导航
- 亮色/暗色主题
- 打开、保存、另存为 .md/.markdown 文件
- 新建文档
- 未保存更改检测
- Ctrl/Cmd 键盘快捷键
- 无边框窗口 — 自定义标题栏
- Windows exe 打包（Tauri）

## 计划扩展

- 小说写作工具（章节、角色、世界观笔记）
- 字数统计
- 写作项目管理

## 技术栈

| 层 | 技术 |
|-------|-----------|
| 桌面壳 | Tauri v2 (Rust) |
| 前端 | React 19 + TypeScript |
| 构建 | Vite 8 |
| 编辑器 | Milkdown / Crepe（基于 ProseMirror） |
| 数学公式 | KaTeX |
| 文件 I/O | Tauri dialog + fs 插件（桌面端） |
| 样式 | 纯 CSS + CSS 自定义属性 |

## 环境要求

- **Node.js** >= 18
- **Rust** / **Cargo**（最新稳定版）
- **Microsoft C++ Build Tools**（仅 Windows，Tauri 所需）
- **WebView2**（Windows 10+ 已内置）

## 快速开始

### 安装依赖

```bash
npm install
```

### 浏览器开发模式

```bash
npm run dev
```

应用运行在 `http://localhost:5173`。注意：文件操作（打开/保存）需要在 Tauri 桌面模式下使用。

### Tauri 桌面模式

```bash
npm run tauri:dev
```

这将启动 Vite 开发服务器并打开 Tauri 窗口。

### 构建生产版本

```bash
npm run build
```

### 构建 Tauri 安装包（exe）

```bash
npm run tauri:build
```

生成的 Windows 安装包位于 `src-tauri/target/release/bundle/`。

## 项目结构

```
src/
  main.tsx              入口文件
  App.tsx               根组件
  app/                  App 外壳与布局
  components/           UI 组件（标题栏、大纲、设置、状态栏）
  editor/               编辑器核心（MarkdownEditor、SourceEditor）
  document/             文件操作与文档状态
  outline/              大纲/目录逻辑
  keyboard/             键盘快捷键处理
  theme/                亮色/暗色主题
  writing/              小说写作存根（未来功能）
  utils/                工具函数（防抖、slug、平台检测）
  styles/               CSS 文件
docs/                   文档
src-tauri/              Tauri Rust 后端
```

## 键盘快捷键

| 快捷键 | 操作 |
|----------|--------|
| Ctrl/Cmd + N | 新建文档 |
| Ctrl/Cmd + O | 打开文件 |
| Ctrl/Cmd + S | 保存 |
| Ctrl/Cmd + Shift + S | 另存为 |
| Ctrl/Cmd + Shift + O | 切换大纲 |
| Ctrl/Cmd + A | 全选 |
| Escape | 关闭设置菜单 |

## 文档

- [架构](docs/ARCHITECTURE.md)
- [编辑器稳定性](docs/EDITOR_STABILITY.md)
- [回归检查清单](docs/REGRESSION_CHECKLIST.md)
- [编码规范](docs/CODEX_RULES.md)
- [路线图](docs/ROADMAP.md)

## 许可证

MIT
