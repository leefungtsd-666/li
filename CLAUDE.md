# li — Markdown Editor

先读取 `agent.md` 获取完整的项目上下文信息。

## 快速参考

- **启动**: `npm run tauri:dev`
- **构建**: `npm run build`（前端）→ `npx tauri build`（完整发布）
- **发布产物**: 复制 `src-tauri/target/release/li.exe` 到 `release/`
- **lint**: `npx eslint src/`（不要对整个项目运行，src-tauri/target/ 有误报）
- **编辑器**: Milkdown Crepe WYSIWYG，支持 LaTeX + 代码块
- **Crepe CSS**: 必须在自定义 CSS 之前导入（`main.tsx` 中顺序重要）
- **窗口**: 无边框，自定义标题栏，Tauri v2 权限在 `capabilities/default.json`
- **IME**: 中文输入受 `isComposingRef` 保护
- **两个** 文件都位于项目根目录
