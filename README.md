# 🖱️ Batch File Selector · 批量文件选择器

> **📖 Bilingual README** — English first, followed by 中文。This document is written in two languages: English for the global community, then Chinese for the domestic audience. Scroll down for 中文！

---

Batch file selection for Obsidian has never felt this smooth. **Long-press right-click** to enter batch mode — checkboxes appear, a floating toolbar slides up, and you can move, delete, tag, or copy paths for multiple files at once. Shift-range-select, Ctrl+A select-all, Esc to exit. It feels like a file manager should.

<p align="center">
  <b>🚀 Long Press → Batch Mode → Mass Operations → Done</b>
</p>

---

## 📸 What It Looks Like

Once you long-press right-click anywhere in the file explorer, every file and folder sprouts a checkbox. A sleek toolbar floats up from the bottom with your actions: **Move**, **Copy Path**, **Tag**, **Delete**. Select a few files, hit the action, confirm, and you're done. No dragging, no awkward multi-select hacks, no repetitive right-click menus.

```
┌─────────────────────────────────────────────────┐
│  📁 Vault                                       │
│  ┌──────────────────────────────────────────┐   │
│  │ ☑ notes/                                 │   │
│  │ ☑  draft-01.md                           │   │
│  │ ☐  draft-02.md                           │   │
│  │ ☑  idea-board.md                         │   │
│  │ ☐  journal/                              │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ 📋 3 个已选   [移动] [复制] [标签] [删除] │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Long-press activation** | Hold right-click anywhere in the file explorer for ~500ms to enter batch mode. No extra clicks, no mode-switching menu. |
| **Checkbox UI** | Every file and folder gets a clean, animated checkbox. Click to toggle, see the checkmark snap in. |
| **Floating toolbar** | A polished toolbar slides up from the bottom with all your actions — Move, Copy Path, Tag, Delete, Exit. |
| **Batch move** | Select multiple files and move them all to a target folder in one shot. |
| **Batch delete** | Trash multiple files at once with a safety confirmation dialog. |
| **Batch tagging** | Append tags to multiple files simultaneously. Type once, tag all. |
| **Copy all paths** | Copy every selected file path to clipboard in one click. |
| **Shift range-select** | Click one file, Shift+click another — everything in between gets selected. |
| **Ctrl/Cmd+A select-all** | Select every file in the current folder instantly. |
| **Esc to exit** | Hit Escape and batch mode vanishes, clean as it came. |
| **Status bar indicator** | See how many items you've selected right in the status bar. |
| **Right-click context menu** | Full context menu with batch actions available in batch mode. |
| **Configurable hold duration** | Tweak how long you need to hold right-click before batch mode kicks in (200ms–1500ms). |

---

## 🎯 Why This Exists

Obsidian's native file explorer is great for one-at-a-time operations, but cleaning up a vault, reorganizing 20 loose notes, or tagging a batch of research files becomes a tedious right-click marathon. **Batch File Selector** gives you the muscle memory of a desktop file manager — select a bunch, act on them all at once.

---

## 📦 Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open **Settings → Community plugins**
2. Search **"Batch File Selector"**
3. Install & Enable

### Manual Installation

1. Download the latest release from [Releases](https://github.com/Xiaopeng212321414321413231/obsidian-batch-file-selector/releases)
2. Extract into your vault's `.obsidian/plugins/batch-file-selector/`
3. Enable the plugin in **Settings → Community plugins**

### Building from Source

```bash
git clone https://github.com/Xiaopeng212321414321413231/obsidian-batch-file-selector.git
cd obsidian-batch-file-selector
npm install
npm run build
# Copy main.js, manifest.json, styles.css to .obsidian/plugins/batch-file-selector/
```

---

## 🕹️ Usage

| Action | How |
|---|---|
| **Enter batch mode** | Long-press right-click in the file explorer (default 500ms) |
| **Enter via command** | `Ctrl/Cmd+P` → "切换批量选择模式" |
| **Select a file** | Click it (toggle on/off) |
| **Range select** | Click file A, then **Shift+click** file B |
| **Select all** | `Ctrl/Cmd+A` |
| **Batch move** | Select files → click **移动** in toolbar → pick destination |
| **Batch delete** | Select files → click **删除** → confirm |
| **Batch tag** | Select files → click **标签** → type tag → Enter |
| **Copy paths** | Select files → click **复制路径** |
| **Exit batch mode** | Press **Esc** or click **退出** in toolbar |

---

## ⚙️ Settings

| Setting | Default | Description |
|---|---|---|
| Hold Duration | 500ms | How long to hold right-click to activate batch mode |
| Shift Range Select | On | Enable Shift+click range selection |
| Status Bar Display | On | Show selection count in status bar |
| Sound | Off | Play a sound when toggling batch mode |

---

## 🤝 Contributing

Found a bug? Have a feature idea? PRs and issues are welcome at the [GitHub repo](https://github.com/Xiaopeng212321414321413231/obsidian-batch-file-selector).

---

## 📄 License

MIT © 彭采士

---

---

# 🖱️ 中文介绍

> 向上滑动查看完整英文介绍 ↑

## 让 Obsidian 的文件操作，终于有了「多选」的自由

你有没有过这样的时刻——想整理一下 Obsidian 仓库，把 20 篇散落的笔记移到同一个文件夹，或者给一堆研究材料打上统一的标签——然后发现 Obsidian 的文件浏览器**没有多选功能**。你只能一个一个右键，一个一个操作，像个在流水线上拧螺丝的工人。

**Batch File Selector** 终结了这种痛苦。

**长按右键**，整个文件浏览器瞬间变身——每个文件前面浮现出干净的复选框，底部滑出一条精致的工具栏。点选、Shift 范围选、Ctrl+A 全选，然后一键移动、删除、打标签，结束。没有多余的菜单层级，没有啰嗦的模态框，顺手得像原生功能。

---

## ✨ 核心功能

| 功能 | 说明 |
|---|---|
| **长按右键激活** | 在文件浏览器任意位置长按右键约半秒，进入批量选择模式。零学习成本，肌肉记忆驱动。 |
| **复选框 UI** | 每个文件和文件夹左侧出现精美复选框，点击切换选中，对勾动画轻盈反馈。 |
| **浮动工具栏** | 从底部滑出的操作栏：移动、复制路径、标签、删除、退出。一目了然。 |
| **批量移动** | 选中多个文件，一键搬到目标文件夹。 |
| **批量删除** | 选中后点删除，弹出确认对话框，确认后移入回收站，安全可恢复。 |
| **批量打标签** | 输入一个标签名，所有选中文件同步添加。写一次，标记全部。 |
| **复制路径** | 一键复制所有选中文件的路径到剪贴板。 |
| **Shift 范围选择** | 点第一个文件，Shift+点最后一个，中间全部选中。 |
| **Ctrl/Cmd+A 全选** | 一键全选当前文件夹内所有文件。 |
| **Esc 退出** | 按 Esc 立即退出批量模式，不留痕迹。 |
| **状态栏提示** | 状态栏实时显示已选数量，心中有数。 |
| **右键上下文菜单** | 批量模式下右键弹出完整操作菜单，鼠标党友好。 |
| **可调长按时长** | 200ms 到 1500ms 自由调节，快慢由你。 |

---

## 🎯 设计哲学

Obsidian 是知识管理工具，但文件多了就需要文件管理能力。这个插件不做花哨的界面，不做复杂的状态机——它只做一件事：**让你像操作桌面文件管理器一样操作 Obsidian 文件**。选一批，一起处理，完事。

---

## 📦 安装

### 从 Obsidian 社区插件安装（即将上线）

1. 打开 **设置 → 第三方插件**
2. 搜索 **"Batch File Selector"**
3. 安装并启用

### 手动安装

1. 从 [Releases](https://github.com/Xiaopeng212321414321413231/obsidian-batch-file-selector/releases) 下载最新版
2. 解压到你的仓库目录 `.obsidian/plugins/batch-file-selector/`
3. 在 **设置 → 第三方插件** 中启用

### 从源码构建

```bash
git clone https://github.com/Xiaopeng212321414321413231/obsidian-batch-file-selector.git
cd obsidian-batch-file-selector
npm install
npm run build
# 将 main.js、manifest.json、styles.css 复制到 .obsidian/plugins/batch-file-selector/
```

---

## 🕹️ 操作指南

| 操作 | 方法 |
|---|---|
| **进入批量模式** | 在文件浏览器中长按右键（默认 500ms） |
| **命令进入** | `Ctrl/Cmd+P` → "切换批量选择模式" |
| **选择文件** | 点击文件切换选中/取消 |
| **范围选择** | 先点文件 A，再 Shift+点文件 B |
| **全选** | `Ctrl/Cmd+A` |
| **批量移动** | 选中 → 点工具栏「移动」→ 选目标文件夹 |
| **批量删除** | 选中 → 点工具栏「删除」→ 确认 |
| **批量标签** | 选中 → 点工具栏「标签」→ 输入标签 → 回车 |
| **复制路径** | 选中 → 点工具栏「复制路径」 |
| **退出批量模式** | 按 Esc 或点工具栏「退出」 |

---

## ⚙️ 设置项

| 设置 | 默认值 | 说明 |
|---|---|---|
| 长按触发时长 | 500ms | 长按右键多久进入批量模式 |
| Shift 范围选择 | 开 | 是否启用 Shift 范围选择 |
| 状态栏显示 | 开 | 状态栏显示选中数量 |
| 声音提示 | 关 | 模式切换时播放提示音 |

---

<p align="center">
  <b>Built with ❤️ for Obsidian users who have better things to do than right-click twenty times.</b>
  <br/>
  <b>为那些不想右键二十次的 Obsidian 用户而生。</b>
</p>
