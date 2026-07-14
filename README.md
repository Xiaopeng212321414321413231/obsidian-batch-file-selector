# 🔘 Batch File Selector for Obsidian

> *Long-press right-click to select files in bulk. Because dragging one by one belongs in the stone age.*
> 
> *长按右键，批量选择文件。一个一个拖拽的操作，该进博物馆了。*

---

## English

### 🎯 What It Does

You know that pain. You have 47 stray notes scattered across your vault. You want to move them into a folder. Tag them all. Or just nuke them from orbit. But Obsidian makes you right-click each one. Individually. Like a caveman.

**Not anymore.**

**Batch File Selector** brings ergonomic bulk selection to Obsidian's file explorer — triggered by the most natural gesture imaginable: **holding down your right mouse button**.

It's the missing "select mode" Obsidian should have shipped with.

### 🚀 Quick Start

| Action | How |
|--------|-----|
| **Enter batch mode** | Long-press right-click (hold ~0.5s) anywhere in the file explorer |
| **Select files** | Click any file to toggle selection |
| **Range select** | Shift + click between two files |
| **Select all** | `Ctrl/Cmd + A` |
| **Exit** | `Esc` or click the ✕ button |

### ✨ Features

- **🔘 Intuitive activation** — Just hold right-click. No obscure hotkey to memorize. Your fingers already know how.
- **✅ Visual feedback** — Animated checkboxes slide into each file item with a staggered entrance. Selected files glow with your theme's accent color.
- **📦 Bottom toolbar** — Once you've picked your files, a slick toolbar rises from the bottom with all your options:
  - **Move** — Relocate selected files to any folder in your vault
  - **Copy Path** — Dump all selected paths to clipboard
  - **Tag** — Batch-add tags to markdown files
  - **Delete** — Send to trash (with confirmation), recoverable anytime
- **🎯 Range select** — Shift-click to grab everything between two files. No more click-click-click-click-click.
- **📂 Folder-aware** — Folders still expand and collapse normally. Only files get intercepted for selection. No confusion, no friction.
- **🎨 Theme compatible** — Light and dark themes both look great. Uses your theme's accent color for highlights.
- **📱 Mobile ready** — Adapted toolbar layout for phones and tablets.
- **⌨️ Command palette** — All actions accessible via `Ctrl/Cmd + P` (search "批量选择" or "Batch")

### 🖱️ Usage Walkthrough

1. Open Obsidian. Look at your file explorer on the left.
2. **Hold right-click** on any file or empty space for about half a second.
3. Tiny animated checkboxes appear beside every item. You're now in **batch mode**.
4. Click files to check them. Shift-click for ranges. `Ctrl+A` for everything.
5. A toolbar slides up from the bottom showing your selection count and action buttons.
6. Pick an action. Done. `Esc` to leave.

That's it. No configuration needed (but you can tweak the hold duration in settings if 500ms feels off).

### ⚙️ Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Hold duration | 500ms | How long to hold right-click before batch mode activates |
| Shift range select | On | Enable Shift+click range selection |
| Status bar display | On | Show selection count in status bar |
| Sound cue | Off | Play a sound when entering/exiting batch mode |

### 🔧 Installation

#### From Obsidian Community Plugins (Coming Soon)
1. Settings → Community Plugins → Browse
2. Search "Batch File Selector"
3. Install & Enable

#### Manual
1. Download `main.js`, `manifest.json`, `styles.css` from the [latest release](https://github.com/Xiaopeng212321414321413231/obsidian-batch-file-selector/releases)
2. Copy them into `{your-vault}/.obsidian/plugins/batch-file-selector/`
3. Settings → Community Plugins → enable "Batch File Selector"

#### From Source
```bash
git clone https://github.com/Xiaopeng212321414321413231/obsidian-batch-file-selector.git
cd obsidian-batch-file-selector
npm install
npm run build
```

### 🤝 Compatibility

Designed to play nice with other plugins. No aggressive event hijacking. Does NOT use `stopImmediatePropagation()` which would block other plugins. Folders, theming extensions, and other file-explorer plugins should all coexist happily.

---

## 中文

### 🎯 它能干嘛

你有没有经历过这种绝望：散落在仓库各处的 47 篇笔记，你想把它们全挪到一个文件夹里，或者统一打上标签，或者干脆一把梭全删了。但 Obsidian 只让你一个一个地右键操作。像原始人一样。

**现在不用了。**

**批量文件选择器** 给 Obsidian 的文件浏览器加上了符合直觉的批量选择能力——触发方式就是最自然的那个动作：**按住右键不放**。

这就是 Obsidian 出厂时就应该内置的「选择模式」。

### 🚀 快速上手

| 操作 | 方式 |
|------|------|
| **进入批量模式** | 在文件浏览器中长按右键（约 0.5 秒） |
| **选择文件** | 点击文件切换选中状态 |
| **范围选择** | 按住 Shift 点击两个文件之间的任意位置 |
| **全选** | `Ctrl/Cmd + A` |
| **退出** | 按 `Esc` 或点击 ✕ 按钮 |

### ✨ 功能亮点

- **🔘 直觉式触发** — 就是按住右键，不用记什么奇怪的快捷键。你的手指本来就会这个动作。
- **✅ 视觉反馈到位** — 每个文件项前会弹出带动画的复选框，错落入场不呆板。选中的文件会用主题色高亮，一眼就知道选了哪些。
- **📦 底部工具栏** — 选中文件后，底部会滑出一个精致的操作栏：
  - **移动** — 批量搬到仓库里任意文件夹
  - **复制路径** — 一键复制所有选中文件的路径到剪贴板
  - **打标签** — 批量给 Markdown 文件添加标签
  - **删除** — 移入回收站（有确认弹窗），随时可以恢复
- **🎯 范围选择** — Shift + 点击，中间的全部选中。告别「点一下、点一下、点一下」的重复劳动。
- **📂 文件夹友好** — 文件夹该展开还是展开，该折叠还是折叠。只有文件点击会被拦截用于选择，不会搞混。
- **🎨 主题无缝适配** — 浅色、深色主题都好看，选中高亮用你的主题色，不突兀。
- **📱 移动端可用** — 手机和平板上工具栏会自动调整布局。
- **⌨️ 命令面板** — 所有功能都可以通过 `Ctrl/Cmd + P` 搜「批量选择」来使用。

### 🖱️ 使用流程

1. 打开 Obsidian，看着左侧的文件浏览器。
2. **按住右键不放**，大约半秒。
3. 每个文件旁边会冒出带着错落动画的小复选框——你已进入批量模式。
4. 点击文件就能勾选。Shift + 点击可以做范围选择。`Ctrl+A` 全选。
5. 底部滑出工具栏，显示已选数量和操作按钮。
6. 选一个操作，搞定。按 `Esc` 退出。

完事。不需要任何配置就能用（如果觉得 500 毫秒的长按时间不合适，去设置里调一下就行）。

### ⚙️ 可配置项

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| 长按触发时长 | 500ms | 按住右键多久触发批量模式 |
| Shift 范围选择 | 开 | 是否启用 Shift+点击范围选择 |
| 状态栏显示 | 开 | 状态栏是否显示选中数量 |
| 声音提示 | 关 | 进入/退出批量模式时播放提示音 |

### 🔧 安装方式

#### 从 Obsidian 社区插件市场（即将上线）
1. 设置 → 第三方插件 → 浏览
2. 搜索 "Batch File Selector"
3. 安装并启用

#### 手动安装
1. 从 [发布页](https://github.com/Xiaopeng212321414321413231/obsidian-batch-file-selector/releases) 下载 `main.js`、`manifest.json`、`styles.css`
2. 拷贝到 `{你的仓库}/.obsidian/plugins/batch-file-selector/`
3. 设置 → 第三方插件 → 启用 "Batch File Selector"

#### 从源码构建
```bash
git clone https://github.com/Xiaopeng212321414321413231/obsidian-batch-file-selector.git
cd obsidian-batch-file-selector
npm install
npm run build
```

### 🤝 兼容性

专门做了兼容性优化，不会和其他插件打架。不用 `stopImmediatePropagation()` 这种暴力拦截，不影响同一元素上其他插件的监听器。文件夹、主题扩展、其他文件浏览器增强插件都能和平共处。

---

## 📄 License

MIT

---

*Built with ❤️ for the Obsidian community. If this plugin saves you 5 minutes a day, that's 30 hours a year you get back.*
