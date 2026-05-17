# li — Markdown Editor (Tauri + React + Milkdown/Crepe)

## 项目概述

Typora 风格的 WYSIWYG Markdown 编辑器。基于 Tauri v2 构建，前端使用 React 19 + Milkdown Crepe 编辑器。

## 技术栈

- **框架**: Tauri v2 (Rust backend) + React 19 + TypeScript 6 + Vite 8
- **编辑器**: Milkdown Crepe v7.21.1 (ProseMirror-based WYSIWYG editor)
- **包管理**: npm
- **构建命令**:
  - `npm run dev` — 前端 dev server
  - `npm run build` — TypeScript 检查 + Vite 构建
  - `npm run lint` — ESLint 检查
  - `npm run tauri:dev` — Tauri 开发模式（自动启动前端 + 桌面窗口）
  - `npm run tauri:build` — Tauri 发布构建（产物在 src-tauri/target/release/）

## 项目结构

```
li/
├── src/                    # 前端源代码
│   ├── main.tsx            # 入口文件 (Crepe CSS 在此导入)
│   ├── App.tsx             # 根组件
│   ├── app/                # 应用壳
│   │   └── AppShell.tsx    # 主布局 (TitleBar + Editor + Outline + StatusBar)
│   ├── components/         # UI 组件
│   │   ├── titlebar/       # 标题栏 (TitleBar, WindowControls)
│   │   ├── outline/        # 目录面板 (OutlinePanel, OutlineItem)
│   │   ├── settings/       # 设置菜单
│   │   └── status/         # 状态栏
│   ├── editor/             # 编辑器
│   │   ├── MarkdownEditor.tsx  # Crepe WYSIWYG 编辑器组件
│   │   ├── SourceEditor.tsx    # 源码编辑器组件
│   │   ├── editorTypes.ts      # 编辑器类型定义
│   │   └── useEditorComposition.ts  # IME 组合输入处理
│   ├── outline/            # 目录/大纲
│   │   ├── useOutline.ts       # 目录状态、滚动到标题、IntersectionObserver
│   │   ├── outlineTypes.ts
│   │   └── outlineUtils.ts     # 从 Markdown 提取标题
│   ├── document/           # 文档状态 (新建/打开/保存)
│   │   └── useDocumentState.ts
│   ├── keyboard/           # 键盘快捷键
│   ├── theme/              # 主题切换
│   ├── styles/             # CSS 样式
│   │   ├── global.css      # 全局样式 (box-sizing, button reset, scrollbar)
│   │   ├── editor.css      # 编辑器样式 (Crepe 变量, ProseMirror 内容样式)
│   │   ├── theme.css       # CSS 变量 (亮色/暗色)
│   │   ├── titlebar.css    # 标题栏样式
│   │   └── outline.css     # 目录面板样式
│   ├── utils/              # 工具函数
│   │   ├── debugFlags.ts   # 调试开关
│   │   ├── platform.ts     # 平台检测 (isTauri)
│   │   └── slug.ts         # 标题 ID 生成
│   └── writing/            # 写作统计
├── src-tauri/              # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs         # Tauri 入口
│   │   └── lib.rs
│   ├── tauri.conf.json     # Tauri 配置 (窗口, 权限, 构建)
│   ├── capabilities/       # 权限配置
│   └── Cargo.toml
├── release/                # 发布构建产物
│   ├── li.exe              # 绿色免安装可执行文件
│   ├── li_0.1.0_x64-setup.exe  # NSIS 安装程序
│   └── li_0.1.0_x64_en-US.msi  # MSI 安装包
└── agent.md                # 本文件
```

## 关键架构决策

### Crepe 编辑器
- WYSIWYG 模式使用 Milkdown Crepe，源码模式使用 `<textarea>`
- 通过 React `key` prop 控制编辑器切换（条件渲染，每次切换卸载/重建）
- Crepe CSS 必须在自定义 CSS 之前导入（`main.tsx` 中顺序重要）
- 启用的 Crepe 功能: Latex, CodeMirror, Placeholder, Toolbar, ListItem, Cursor, Table
- 禁用的功能: BlockEdit, LinkTooltip, ImageBlock, TopBar, AI

### Crepe CSS 样式注意事项
- Crepe 浮层 UI（bubble menu, block handle, link tooltip）依赖其内置 CSS 实现定位
- 文件 `main.tsx` 必须在自定义 CSS 前导入 Crepe CSS:
  ```tsx
  import '@milkdown/crepe/theme/common/style.css';
  import '@milkdown/crepe/theme/frame.css';
  ```
- `global.css` 中 `.milkdown button { all: revert; }` 避免全局 button 样式覆盖 Crepe 按钮
- `editor.css` 中不能用 `.ProseMirror > *`，会影响 Crepe 浮层元素

### 编辑器模式切换
- 两种模式: `'render'` (WYSIWYG) 和 `'source'` (纯文本)
- 切换时通过 key `render-{fileToken}` / `source-{fileToken}` 卸载重建组件
- 内容通过 `initialContent` prop 传入，无需 ref 同步

### IME 输入保护
- 中文/日文等输入法组合输入期间，需阻止内容同步
- `isComposingRef` + `e.isComposing` + `e.key === 'Process'` 三重检查
- `handleCompositionEnd` 在组合完成后报告最终文本

### 目录/大纲 (Outline)
- `useOutline` hook 管理目录状态
- `extractHeadings(markdown)` 从 Markdown 解析标题
- `scrollToHeading(item)` 通过 DOM 查询 `.ProseMirror h1-4` 元素，计算相对于 `.editor-container` 的偏移并平滑滚动
- IntersectionObserver 追踪当前可见标题（需要 data-heading-id 属性支持）

### 窗口控制 (Tauri)
- 使用 `@tauri-apps/api/window` 的 `getCurrentWindow()`
- 无边框窗口 (`decorations: false`)，自定义标题栏
- 需要在 `src-tauri/capabilities/default.json` 中声明权限

### 文档管理
- `useDocumentState` 管理文档 CRUD
- 使用 Tauri 的 dialog + fs 插件进行文件操作
- 新建/打开未保存文档时有确认弹窗

## 常见问题

### lint 错误过滤
- `src-tauri/target/` 下的文件是 Rust 构建产物，`eslint .` 会误报。运行 `eslint src/` 只检查源码。

### 构建步骤
```
npm run build          # TypeScript + Vite 构建
npx tauri build        # 完整 Tauri 发布构建（含 Rust 编译）
```

## 发布流程
1. `npm run tauri:build`
2. 复制 `src-tauri/target/release/li.exe` 到 `release/` 目录
3. 如需更新 MSI/NSIS 安装包，同步复制

## 调试

`src/utils/debugFlags.ts` 中有 `DEBUG_INPUT`, `DEBUG_OUTLINE`, `DEBUG_EDITOR` 三个开关，设为 `true` 可在控制台查看对应模块的调试日志。
