# Repository Guidelines（仓库协作指南）

## 当前状态
- 本仓库是个人主站（React + TypeScript + Vite）重构项目。
- 现阶段以“逐步添加功能、逐步验证、逐步提交”为核心流程。

## 沟通与协作规则
- 与用户交流必须使用中文。
- 解释、计划、变更说明、问题反馈均使用中文。
- 每次回复优先给出可执行结论，再补充必要细节。

## 项目结构
- `src/`：前端源码。
  - `src/main.tsx`：应用入口。
  - `src/App.tsx`：页面结构与功能实现。
  - `src/styles.css`：全局样式与视觉效果。
- 根目录：`index.html`、`vite.config.ts`、`tsconfig*.json`、`package.json`。
- `dist/` 为构建产物，不作为手工源码维护目录。

## 常用命令
```bash
npm install      # 安装依赖
npm run dev      # 本地开发
npm run build    # 类型检查 + 生产构建
npm run preview  # 预览构建结果
```
- 提交前至少执行一次 `npm run build`。

## 提交规范（强制）
- 每添加完一个功能，必须立即执行一次 `git commit`。
- 提交格式：`type(scope): subject`，可选 body。
- 示例：
  - `feat(hero): 添加首屏静态方格背景`
  - `fix(grid): 修正移动端方格间距`

## 修复上一个改动的规则
- 若“上一个改动尚未提交”：先撤销该未提交改动（undo），修复后重新提交为一条正确提交。
- 若“上一个改动已经提交”：不要改写已提交历史，直接新增 `fix(scope): ...` 提交。

## 代码风格
- TypeScript + 函数组件，2 空格缩进。
- 变量/函数使用 `camelCase`，组件与文件使用 `PascalCase`。
- 样式类名建议语义化（如 `hero__grid`），避免无意义缩写。

## 文件规模限制（强制）
- 单个源码文件不应超过 1000 行。
- 当文件接近或超过 1000 行时，必须及时拆分文件，避免继续堆叠逻辑。
- 拆分优先级建议：
  - React 页面按模块拆分为子组件（如 `HeroSection.tsx`、`WorksSection.tsx`）。
  - 样式按功能拆分（如 `hero.css`、`about.css`）并在入口统一引入。
  - 工具函数与配置常量拆到独立文件（如 `utils/`、`constants/`）。
