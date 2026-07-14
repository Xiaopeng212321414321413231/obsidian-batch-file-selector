import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
  Notice,
  Menu,
  normalizePath,
  Modal,
} from "obsidian";

// ─── 插件设置接口 ───────────────────────────────────────
interface BatchFileSelectorSettings {
  holdDuration: number; // 长按触发时长 (ms)
  enableShiftSelect: boolean; // Shift 范围选择
  enableSound: boolean; // 模式切换音效
  showItemCount: boolean; // 显示选中数量
}

const DEFAULT_SETTINGS: BatchFileSelectorSettings = {
  holdDuration: 500,
  enableShiftSelect: true,
  enableSound: false,
  showItemCount: true,
};

// ─── 批量操作类型 ────────────────────────────────────────
type BatchAction = "move" | "delete" | "tag" | "copy-path" | "rename-sequence";

// ─── 选中项信息 ──────────────────────────────────────────
interface SelectedItem {
  el: HTMLElement;
  path: string;
  isFolder: boolean;
  file: TFile | null;
  folder: TFolder | null;
}

// ─── 主插件类 ───────────────────────────────────────────
export default class BatchFileSelectorPlugin extends Plugin {
  settings: BatchFileSelectorSettings;

  // 状态
  private isBatchMode = false;
  private selectedItems: Map<string, SelectedItem> = new Map();
  private lastSelectedPath: string | null = null;

  // 长按检测
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  private isRightButtonDown = false;
  private holdTriggered = false;

  // DOM 引用
  private batchToolbar: HTMLElement | null = null;
  private fileExplorer: HTMLElement | null = null;
  private statusBarItem: HTMLElement | null = null;

  // 事件清理
  private cleanupFns: (() => void)[] = [];

  async onload() {
    await this.loadSettings();

    // 等待文件浏览器加载
    this.app.workspace.onLayoutReady(() => {
      this.registerFileExplorerListeners();
    });

    // 设置面板
    this.addSettingTab(new BatchFileSelectorSettingTab(this.app, this));

    // 命令：手动切换批量选择模式
    this.addCommand({
      id: "toggle-batch-mode",
      name: "切换批量选择模式",
      callback: () => this.toggleBatchMode(),
    });

    // 命令：全选当前文件夹
    this.addCommand({
      id: "select-all-in-folder",
      name: "全选当前文件夹内所有文件",
      callback: () => this.selectAllInFolder(),
    });

    // 命令：取消全部选择
    this.addCommand({
      id: "deselect-all",
      name: "取消全部选择",
      callback: () => this.deselectAll(),
    });

    // 状态栏
    this.statusBarItem = this.addStatusBarItem();
    this.updateStatusBar();

    console.log("[BatchFileSelector] 插件已加载 - 在文件浏览器中长按右键启动批量选择");
  }

  onunload() {
    this.exitBatchMode();
    this.cleanupAll();
    console.log("[BatchFileSelector] 插件已卸载");
  }

  // ─── 设置加载与保存 ──────────────────────────────────
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // ─── 文件浏览器监听 ──────────────────────────────────
  private registerFileExplorerListeners() {
    // 查找文件浏览器容器（兼容不同主题/版本）
    const tryRegister = () => {
      const explorer =
        document.querySelector(".nav-files-container") ||
        document.querySelector(".workspace-leaf-content[data-type='file-explorer'] .nav-files-container");

      if (!explorer) {
        // 重试
        setTimeout(tryRegister, 500);
        return;
      }

      this.fileExplorer = explorer as HTMLElement;

      // 右键按下的监听（用于长按检测）
      const onMouseDown = (e: MouseEvent) => {
        if (e.button === 2) {
          this.isRightButtonDown = true;
          this.holdTriggered = false;

          // 如果已经在批量模式，不再触发长按
          if (this.isBatchMode) return;

          this.holdTimer = setTimeout(() => {
            if (this.isRightButtonDown && !this.holdTriggered) {
              this.holdTriggered = true;
              this.enterBatchMode();
              // 阻止后续的 contextmenu
              this.preventNextContextMenu();
            }
          }, this.settings.holdDuration);
        }
      };

      const onMouseUp = (e: MouseEvent) => {
        if (e.button === 2) {
          this.isRightButtonDown = false;
          if (this.holdTimer) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
          }
        }
      };

      const onContextMenu = (e: MouseEvent) => {
        // 批量模式下阻止默认右键菜单
        if (this.isBatchMode) {
          e.preventDefault();
          e.stopPropagation();
          this.showBatchContextMenu(e);
          return;
        }
        // 如果长按触发了，阻止这次右键菜单
        if (this.holdTriggered) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // 点击处理（批量选择模式下的文件点击）
      const onClick = (e: MouseEvent) => {
        if (!this.isBatchMode) return;

        const target = e.target as HTMLElement;
        const fileItem = target.closest(".tree-item") as HTMLElement;
        if (!fileItem) return;

        // 阻止默认导航行为
        e.preventDefault();
        e.stopImmediatePropagation();

        // 处理选择
        this.handleFileClick(fileItem, e.shiftKey, e.ctrlKey || e.metaKey);

        // 如果点击的是 checkbox 区域，切换选中状态
        const checkbox = target.closest(".batch-checkbox-wrapper");
        if (checkbox) {
          // 已经处理过了
        }
      };

      // 键盘快捷键
      const onKeyDown = (e: KeyboardEvent) => {
        if (!this.isBatchMode) return;

        // Escape 退出
        if (e.key === "Escape") {
          e.preventDefault();
          this.exitBatchMode();
          return;
        }

        // Ctrl/Cmd+A 全选
        if ((e.ctrlKey || e.metaKey) && e.key === "a") {
          e.preventDefault();
          this.selectAllInFolder();
          return;
        }
      };

      // 使用 capture 阶段确保最先捕获
      this.fileExplorer.addEventListener("mousedown", onMouseDown, true);
      this.fileExplorer.addEventListener("mouseup", onMouseUp, true);
      this.fileExplorer.addEventListener("contextmenu", onContextMenu, true);
      this.fileExplorer.addEventListener("click", onClick, true);
      document.addEventListener("keydown", onKeyDown, true);

      this.cleanupFns.push(() => {
        this.fileExplorer?.removeEventListener("mousedown", onMouseDown, true);
        this.fileExplorer?.removeEventListener("mouseup", onMouseUp, true);
        this.fileExplorer?.removeEventListener("contextmenu", onContextMenu, true);
        this.fileExplorer?.removeEventListener("click", onClick, true);
        document.removeEventListener("keydown", onKeyDown, true);
      });

      console.log("[BatchFileSelector] 文件浏览器监听已注册");
    };

    tryRegister();
  }

  // ─── 阻止下一次 contextmenu ──────────────────────────
  private preventNextContextMenu() {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      document.removeEventListener("contextmenu", handler, true);
    };
    document.addEventListener("contextmenu", handler, true);
  }

  // ─── 进入批量选择模式 ───────────────────────────────
  private enterBatchMode() {
    if (this.isBatchMode) return;
    this.isBatchMode = true;
    this.selectedItems.clear();
    this.lastSelectedPath = null;

    // 添加 CSS 类
    document.body.classList.add("batch-selector-active");
    this.fileExplorer?.classList.add("batch-mode");

    // 为所有文件项添加 checkbox
    this.addCheckboxes();

    // 添加顶部工具栏
    this.showBatchToolbar();

    // 更新状态栏
    this.updateStatusBar();

    new Notice("🔘 批量选择模式已激活 | 点击文件选择 | Esc 退出");
    console.log("[BatchFileSelector] 进入批量选择模式");
  }

  // ─── 退出批量选择模式 ───────────────────────────────
  private exitBatchMode() {
    if (!this.isBatchMode) return;
    this.isBatchMode = false;

    document.body.classList.remove("batch-selector-active");
    this.fileExplorer?.classList.remove("batch-mode");

    // 移除所有 checkbox
    this.removeCheckboxes();

    // 移除工具栏
    this.hideBatchToolbar();

    // 清空选中
    this.selectedItems.clear();
    this.lastSelectedPath = null;

    // 移除选中高亮
    this.clearAllHighlights();

    // 更新状态栏
    this.updateStatusBar();

    console.log("[BatchFileSelector] 退出批量选择模式");
  }

  // ─── 切换批量模式 ──────────────────────────────────
  private toggleBatchMode() {
    if (this.isBatchMode) {
      this.exitBatchMode();
    } else {
      this.enterBatchMode();
    }
  }

  // ─── 文件点击处理 ──────────────────────────────────
  private handleFileClick(itemEl: HTMLElement, shiftKey: boolean, ctrlKey: boolean) {
    const path = this.getFilePathFromElement(itemEl);
    if (!path) return;

    if (shiftKey && this.settings.enableShiftSelect && this.lastSelectedPath) {
      // Shift 范围选择
      this.selectRange(this.lastSelectedPath, path);
    } else {
      // 普通点击切换
      this.toggleItemSelection(itemEl, path);
    }
  }

  // ─── 切换单项目选中 ────────────────────────────────
  private toggleItemSelection(el: HTMLElement, path: string) {
    if (this.selectedItems.has(path)) {
      // 取消选中
      this.selectedItems.delete(path);
      el.classList.remove("batch-selected");
      const checkbox = el.querySelector(".batch-checkbox") as HTMLElement;
      if (checkbox) checkbox.classList.remove("checked");
    } else {
      // 选中
      const info = this.buildSelectedItem(el, path);
      if (info) {
        this.selectedItems.set(path, info);
        el.classList.add("batch-selected");
        const checkbox = el.querySelector(".batch-checkbox") as HTMLElement;
        if (checkbox) checkbox.classList.add("checked");
        this.lastSelectedPath = path;
      }
    }
    this.updateBatchUI();
  }

  // ─── Shift 范围选择 ────────────────────────────────
  private selectRange(fromPath: string, toPath: string) {
    const allItems = this.getAllFileItems();
    const fromIdx = allItems.findIndex((item) => this.getFilePathFromElement(item) === fromPath);
    const toIdx = allItems.findIndex((item) => this.getFilePathFromElement(item) === toPath);

    if (fromIdx === -1 || toIdx === -1) return;

    const start = Math.min(fromIdx, toIdx);
    const end = Math.max(fromIdx, toIdx);

    // 清空之前的选择
    this.selectedItems.clear();
    this.clearAllHighlights();

    // 范围选择
    for (let i = start; i <= end; i++) {
      const itemEl = allItems[i];
      const path = this.getFilePathFromElement(itemEl);
      if (path) {
        const info = this.buildSelectedItem(itemEl, path);
        if (info) {
          this.selectedItems.set(path, info);
          itemEl.classList.add("batch-selected");
          const checkbox = itemEl.querySelector(".batch-checkbox") as HTMLElement;
          if (checkbox) checkbox.classList.add("checked");
        }
      }
    }
    this.lastSelectedPath = toPath;
    this.updateBatchUI();
  }

  // ─── 全选当前文件夹 ────────────────────────────────
  private selectAllInFolder() {
    if (!this.isBatchMode) {
      this.enterBatchMode();
    }

    this.selectedItems.clear();
    this.clearAllHighlights();

    const allItems = this.getAllFileItems();
    for (const itemEl of allItems) {
      const path = this.getFilePathFromElement(itemEl);
      if (path) {
        const info = this.buildSelectedItem(itemEl, path);
        if (info) {
          this.selectedItems.set(path, info);
          itemEl.classList.add("batch-selected");
          const checkbox = itemEl.querySelector(".batch-checkbox") as HTMLElement;
          if (checkbox) checkbox.classList.add("checked");
        }
      }
    }
    if (allItems.length > 0) {
      this.lastSelectedPath = this.getFilePathFromElement(allItems[allItems.length - 1]);
    }
    this.updateBatchUI();
    new Notice(`已选中 ${this.selectedItems.size} 个项目`);
  }

  // ─── 取消全部选择 ────────────────────────────────
  private deselectAll() {
    this.selectedItems.clear();
    this.clearAllHighlights();
    this.lastSelectedPath = null;

    // 取消所有 checkbox
    const checkboxes = this.fileExplorer?.querySelectorAll(".batch-checkbox.checked");
    checkboxes?.forEach((cb) => cb.classList.remove("checked"));

    this.updateBatchUI();
  }

  // ─── 辅助方法 ─────────────────────────────────────
  private getFilePathFromElement(el: HTMLElement): string | null {
    // 从 data-path 属性获取路径
    const navFile = el.querySelector(".nav-file-title");
    const navFolder = el.querySelector(".nav-folder-title");

    if (navFile) {
      return navFile.getAttribute("data-path");
    }
    if (navFolder) {
      return navFolder.getAttribute("data-path");
    }
    // 兼容某些主题
    const innerContent = el.querySelector("[data-path]");
    if (innerContent) {
      return innerContent.getAttribute("data-path");
    }
    return null;
  }

  private buildSelectedItem(el: HTMLElement, path: string): SelectedItem | null {
    const isFolder = el.classList.contains("nav-folder") || !!el.querySelector(".nav-folder-title");
    let file: TFile | null = null;
    let folder: TFolder | null = null;

    if (isFolder) {
      const abstractFile = this.app.vault.getAbstractFileByPath(path);
      if (abstractFile instanceof TFolder) {
        folder = abstractFile;
      }
    } else {
      const abstractFile = this.app.vault.getAbstractFileByPath(path);
      if (abstractFile instanceof TFile) {
        file = abstractFile;
      }
    }

    return { el, path, isFolder, file, folder };
  }

  private getAllFileItems(): HTMLElement[] {
    if (!this.fileExplorer) return [];
    return Array.from(
      this.fileExplorer.querySelectorAll(".tree-item")
    ) as HTMLElement[];
  }

  // ─── Checkbox 管理 ────────────────────────────────
  private addCheckboxes() {
    const items = this.getAllFileItems();
    for (const item of items) {
      if (item.querySelector(".batch-checkbox-wrapper")) continue;

      const wrapper = document.createElement("span");
      wrapper.className = "batch-checkbox-wrapper";

      const checkbox = document.createElement("span");
      checkbox.className = "batch-checkbox";
      checkbox.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      wrapper.appendChild(checkbox);
      item.insertBefore(wrapper, item.firstChild);
    }
  }

  private removeCheckboxes() {
    const checkboxes = this.fileExplorer?.querySelectorAll(".batch-checkbox-wrapper");
    checkboxes?.forEach((cb) => cb.remove());
  }

  private clearAllHighlights() {
    const selected = this.fileExplorer?.querySelectorAll(".batch-selected");
    selected?.forEach((el) => el.classList.remove("batch-selected"));
  }

  // ─── 工具栏 ───────────────────────────────────────
  private showBatchToolbar() {
    if (this.batchToolbar) return;

    this.batchToolbar = document.createElement("div");
    this.batchToolbar.className = "batch-toolbar";
    this.batchToolbar.innerHTML = `
      <div class="batch-toolbar-inner">
        <div class="batch-toolbar-left">
          <span class="batch-toolbar-icon">📋</span>
          <span class="batch-toolbar-count"><span id="batch-count">0</span> 个已选</span>
        </div>
        <div class="batch-toolbar-actions">
          <button class="batch-btn batch-btn-move" title="移动到...">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="M21 9l-3 3 3 3"/><path d="M2 12h20"/><path d="M12 2v20"/></svg>
            <span>移动</span>
          </button>
          <button class="batch-btn batch-btn-copy-path" title="复制路径">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>复制路径</span>
          </button>
          <button class="batch-btn batch-btn-tag" title="批量添加标签">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            <span>标签</span>
          </button>
          <button class="batch-btn batch-btn-delete" title="批量删除">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>删除</span>
          </button>
          <div class="batch-toolbar-divider"></div>
          <button class="batch-btn batch-btn-cancel" title="退出 (Esc)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>退出</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.batchToolbar);

    // 绑定按钮事件
    const btnMove = this.batchToolbar.querySelector(".batch-btn-move");
    const btnCopyPath = this.batchToolbar.querySelector(".batch-btn-copy-path");
    const btnTag = this.batchToolbar.querySelector(".batch-btn-tag");
    const btnDelete = this.batchToolbar.querySelector(".batch-btn-delete");
    const btnCancel = this.batchToolbar.querySelector(".batch-btn-cancel");

    btnMove?.addEventListener("click", () => this.batchMove());
    btnCopyPath?.addEventListener("click", () => this.batchCopyPath());
    btnTag?.addEventListener("click", () => this.batchTag());
    btnDelete?.addEventListener("click", () => this.batchDelete());
    btnCancel?.addEventListener("click", () => this.exitBatchMode());

    // 动画入场
    requestAnimationFrame(() => {
      this.batchToolbar?.classList.add("visible");
    });
  }

  private hideBatchToolbar() {
    if (this.batchToolbar) {
      this.batchToolbar.classList.remove("visible");
      setTimeout(() => {
        this.batchToolbar?.remove();
        this.batchToolbar = null;
      }, 300);
    }
  }

  private updateBatchUI() {
    const count = this.selectedItems.size;
    const countEl = document.getElementById("batch-count");
    if (countEl) countEl.textContent = String(count);

    // 更新按钮状态
    const hasSelection = count > 0;
    const buttons = this.batchToolbar?.querySelectorAll(
      ".batch-btn-move, .batch-btn-copy-path, .batch-btn-tag, .batch-btn-delete"
    );
    buttons?.forEach((btn) => {
      if (hasSelection) {
        btn.removeAttribute("disabled");
      } else {
        btn.setAttribute("disabled", "true");
      }
    });

    this.updateStatusBar();
  }

  // ─── 状态栏 ───────────────────────────────────────
  private updateStatusBar() {
    if (!this.statusBarItem) return;
    if (this.isBatchMode && this.settings.showItemCount) {
      this.statusBarItem.setText(`🔘 批量选择: ${this.selectedItems.size} 项`);
      this.statusBarItem.addClass("batch-status-active");
    } else {
      this.statusBarItem.setText("");
      this.statusBarItem.removeClass("batch-status-active");
    }
  }

  // ─── 批量右键菜单（批量模式下）─────────────────────
  private showBatchContextMenu(e: MouseEvent) {
    const menu = new Menu();

    menu.addItem((item) =>
      item
        .setTitle("全选")
        .setIcon("check-check")
        .onClick(() => this.selectAllInFolder())
    );

    menu.addItem((item) =>
      item
        .setTitle("取消选择")
        .setIcon("x")
        .onClick(() => this.deselectAll())
    );

    menu.addSeparator();

    menu.addItem((item) =>
      item
        .setTitle("移动所选文件...")
        .setIcon("folder-input")
        .onClick(() => this.batchMove())
    );

    menu.addItem((item) =>
      item
        .setTitle("复制路径")
        .setIcon("link")
        .onClick(() => this.batchCopyPath())
    );

    menu.addItem((item) =>
      item
        .setTitle("批量添加标签...")
        .setIcon("tag")
        .onClick(() => this.batchTag())
    );

    menu.addSeparator();

    menu.addItem((item) =>
      item
        .setTitle("删除所选文件")
        .setIcon("trash")
        .onClick(() => this.batchDelete())
    );

    menu.addSeparator();

    menu.addItem((item) =>
      item
        .setTitle("退出批量选择模式")
        .setIcon("log-out")
        .onClick(() => this.exitBatchMode())
    );

    menu.showAtMouseEvent(e);
  }

  // ─── 批量操作实现 ────────────────────────────────

  /** 批量移动 */
  private async batchMove() {
    if (this.selectedItems.size === 0) {
      new Notice("请先选择文件");
      return;
    }

    // 弹出文件夹选择器
    const folders = this.getAllFolders();
    if (folders.length === 0) {
      new Notice("没有可用的目标文件夹");
      return;
    }

    const menu = new Menu();
    for (const folder of folders) {
      menu.addItem((item) =>
        item
          .setTitle(folder.path === "/" ? "📁 仓库根目录" : "📁 " + folder.path)
          .onClick(async () => {
            let movedCount = 0;
            for (const [, selected] of this.selectedItems) {
              try {
                const sourcePath = selected.path;
                const fileName = sourcePath.split("/").pop() || "";
                const targetPath = normalizePath(folder.path + "/" + fileName);

                if (sourcePath !== targetPath) {
                  await this.app.fileManager.renameFile(
                    this.app.vault.getAbstractFileByPath(sourcePath)!,
                    targetPath
                  );
                  movedCount++;
                }
              } catch (err) {
                console.error(`移动失败: ${selected.path}`, err);
              }
            }
            new Notice(`成功移动 ${movedCount} 个项目到 ${folder.path}`);
            this.exitBatchMode();
          })
      );
    }
    menu.showAtPosition({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 });
  }

  /** 批量复制路径 */
  private batchCopyPath() {
    if (this.selectedItems.size === 0) {
      new Notice("请先选择文件");
      return;
    }

    const paths = Array.from(this.selectedItems.values())
      .map((item) => item.path)
      .join("\n");

    navigator.clipboard.writeText(paths).then(() => {
      new Notice(`已复制 ${this.selectedItems.size} 个文件路径到剪贴板`);
    });
  }

  /** 批量标签 */
  private async batchTag() {
    if (this.selectedItems.size === 0) {
      new Notice("请先选择文件");
      return;
    }

    // 简单弹窗输入标签
    const modal = new TagInputModal(this.app, async (tag: string) => {
      if (!tag.trim()) return;

      const files: TFile[] = [];
      for (const [, selected] of this.selectedItems) {
        if (selected.file) files.push(selected.file);
      }

      if (files.length === 0) {
        new Notice("没有可标记的文件（文件夹不支持标签）");
        return;
      }

      let count = 0;
      for (const file of files) {
        try {
          const cache = this.app.metadataCache.getFileCache(file);
          const existingTags = cache?.tags?.map((t) => t.tag) || [];
          const frontmatter = cache?.frontmatter || {};

          // 如果标签已存在则跳过
          const tagWithHash = tag.startsWith("#") ? tag : "#" + tag;
          if (existingTags.includes(tagWithHash)) continue;

          // 追加到文件末尾
          await this.app.vault.append(file, `\n${tagWithHash}`);
          count++;
        } catch (err) {
          console.error(`添加标签失败: ${file.path}`, err);
        }
      }
      new Notice(`已为 ${count} 个文件添加标签 "${tag}"`);
      this.exitBatchMode();
    });

    modal.open();
  }

  /** 批量删除 */
  private async batchDelete() {
    if (this.selectedItems.size === 0) {
      new Notice("请先选择文件");
      return;
    }

    const files: string[] = [];
    for (const [, selected] of this.selectedItems) {
      files.push(selected.path);
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      const modal = new ConfirmModal(
        this.app,
        `确认删除 ${files.length} 个文件/文件夹？\n\n${files.slice(0, 5).join("\n")}${files.length > 5 ? `\n...及其他 ${files.length - 5} 个` : ""}\n\n此操作会将文件移入系统回收站。`,
        resolve
      );
      modal.open();
    });

    if (!confirmed) return;

    let deletedCount = 0;
    for (const [, selected] of this.selectedItems) {
      try {
        const file = this.app.vault.getAbstractFileByPath(selected.path);
        if (file) {
          await this.app.vault.trash(file, true);
          deletedCount++;
        }
      } catch (err) {
        console.error(`删除失败: ${selected.path}`, err);
      }
    }
    new Notice(`已将 ${deletedCount} 个项目移入回收站`);
    this.exitBatchMode();
  }

  // ─── 获取所有文件夹 ──────────────────────────────
  private getAllFolders(): TFolder[] {
    const folders: TFolder[] = [];
    this.app.vault.getAllLoadedFiles().forEach((file) => {
      if (file instanceof TFolder) {
        folders.push(file);
      }
    });
    return folders.sort((a, b) => a.path.localeCompare(b.path));
  }

  // ─── 清理 ────────────────────────────────────────
  private cleanupAll() {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }
}

// ─── 设置面板 ─────────────────────────────────────────
class BatchFileSelectorSettingTab extends PluginSettingTab {
  plugin: BatchFileSelectorPlugin;

  constructor(app: App, plugin: BatchFileSelectorPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "批量文件选择器 - 设置" });

    new Setting(containerEl)
      .setName("长按触发时长")
      .setDesc("在文件浏览器中长按右键多久触发批量选择模式（毫秒）")
      .addSlider((slider) =>
        slider
          .setLimits(200, 1500, 50)
          .setValue(this.plugin.settings.holdDuration)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.holdDuration = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Shift 范围选择")
      .setDesc("批量模式下，按住 Shift 点击可选中两个文件之间的所有文件")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableShiftSelect)
          .onChange(async (value) => {
            this.plugin.settings.enableShiftSelect = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("状态栏显示")
      .setDesc("在状态栏显示批量选择信息")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showItemCount)
          .onChange(async (value) => {
            this.plugin.settings.showItemCount = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("声音提示")
      .setDesc("模式切换时播放提示音")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableSound)
          .onChange(async (value) => {
            this.plugin.settings.enableSound = value;
            await this.plugin.saveSettings();
          })
      );

    // 使用说明
    containerEl.createEl("hr");
    const usageDiv = containerEl.createEl("div", { cls: "setting-item-description" });
    usageDiv.innerHTML = `
      <h3>📖 使用说明</h3>
      <ul>
        <li><strong>长按右键</strong>：在文件浏览器中长按右键进入批量选择模式</li>
        <li><strong>点击文件</strong>：批量模式下点击切换选中状态</li>
        <li><strong>Shift + 点击</strong>：范围选择两个文件之间的所有文件</li>
        <li><strong>Ctrl/Cmd + A</strong>：全选当前文件夹</li>
        <li><strong>Esc</strong>：退出批量选择模式</li>
        <li>也可通过命令面板搜索「批量选择」使用</li>
      </ul>
    `;
    usageDiv.style.marginTop = "16px";
  }
}

// ─── 标签输入弹窗 ─────────────────────────────────────
class TagInputModal extends Modal {
  private onSubmit: (tag: string) => void;

  constructor(app: App, onSubmit: (tag: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h3", { text: "批量添加标签" });

    const input = contentEl.createEl("input", {
      type: "text",
      placeholder: "输入标签名（如：todo/important）",
      cls: "batch-tag-input",
    });
    input.style.width = "100%";
    input.style.padding = "8px 12px";
    input.style.marginTop = "8px";
    input.style.marginBottom = "16px";
    input.style.borderRadius = "6px";
    input.style.border = "1px solid var(--background-modifier-border)";
    input.style.backgroundColor = "var(--background-primary)";
    input.style.color = "var(--text-normal)";
    input.style.fontSize = "14px";

    const btnContainer = contentEl.createEl("div");
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "flex-end";
    btnContainer.style.gap = "8px";

    const cancelBtn = btnContainer.createEl("button", { text: "取消" });
    cancelBtn.style.padding = "6px 16px";
    cancelBtn.style.borderRadius = "6px";
    cancelBtn.addEventListener("click", () => this.close());

    const confirmBtn = btnContainer.createEl("button", { text: "确认" });
    confirmBtn.style.padding = "6px 16px";
    confirmBtn.style.borderRadius = "6px";
    confirmBtn.style.backgroundColor = "var(--interactive-accent)";
    confirmBtn.style.color = "var(--text-on-accent)";
    confirmBtn.style.border = "none";
    confirmBtn.addEventListener("click", () => {
      this.onSubmit(input.value);
      this.close();
    });

    // Enter 提交
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onSubmit(input.value);
        this.close();
      }
      if (e.key === "Escape") {
        this.close();
      }
    });

    // 自动聚焦
    setTimeout(() => input.focus(), 50);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

// ─── 确认弹窗 ─────────────────────────────────────────
class ConfirmModal extends Modal {
  private message: string;
  private onConfirm: (result: boolean) => void;

  constructor(app: App, message: string, onConfirm: (result: boolean) => void) {
    super(app);
    this.message = message;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h3", { text: "⚠️ 确认操作" });

    const msgEl = contentEl.createEl("pre", { text: this.message });
    msgEl.style.whiteSpace = "pre-wrap";
    msgEl.style.padding = "12px";
    msgEl.style.backgroundColor = "var(--background-primary-alt)";
    msgEl.style.borderRadius = "6px";
    msgEl.style.marginBottom = "16px";
    msgEl.style.fontSize = "13px";
    msgEl.style.maxHeight = "300px";
    msgEl.style.overflowY = "auto";

    const btnContainer = contentEl.createEl("div");
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "flex-end";
    btnContainer.style.gap = "8px";

    const cancelBtn = btnContainer.createEl("button", { text: "取消" });
    cancelBtn.style.padding = "6px 16px";
    cancelBtn.style.borderRadius = "6px";
    cancelBtn.addEventListener("click", () => {
      this.onConfirm(false);
      this.close();
    });

    const confirmBtn = btnContainer.createEl("button", { text: "确认删除" });
    confirmBtn.style.padding = "6px 16px";
    confirmBtn.style.borderRadius = "6px";
    confirmBtn.style.backgroundColor = "var(--text-error)";
    confirmBtn.style.color = "#fff";
    confirmBtn.style.border = "none";
    confirmBtn.style.fontWeight = "600";
    confirmBtn.addEventListener("click", () => {
      this.onConfirm(true);
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
