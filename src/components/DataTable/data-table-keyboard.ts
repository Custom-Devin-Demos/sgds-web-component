import type { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Roving-tabindex keyboard navigation for the data-mode grid (WAI-ARIA APG "Data Grid").
 *
 * Contract with the template:
 * - Every navigable cell is a `th`/`td` carrying `data-row` and `data-col` (0-based grid coordinates).
 * - Exactly one cell (or the `[data-cell-focus]` control inside it) has `tabindex="0"`; all others `-1`.
 * - The template calls `tabIndexFor(row, col)` while rendering and binds `handleKeydown` on the grid element.
 * - Enter/Space dispatch a synthetic `click` (carrying `shiftKey`) on `cell.querySelector("[data-activate]") ?? cell`.
 */
export class DataTableKeyboardController implements ReactiveController {
  active: GridCellPosition = { row: 0, col: 0 };

  private _hadFocus = false;
  private _listenerRoot: EventTarget | null = null;

  constructor(
    private readonly host: DataTableKeyboardHost,
    private readonly getGrid: () => HTMLElement | null,
    private readonly options: DataTableKeyboardOptions = {}
  ) {
    host.addController(this);
  }

  hostConnected() {
    this._listenerRoot = this.host.renderRoot ?? this.host.shadowRoot ?? this.host;
    this._listenerRoot.addEventListener("focusin", this._onFocusIn);
  }

  hostDisconnected() {
    this._listenerRoot?.removeEventListener("focusin", this._onFocusIn);
    this._listenerRoot = null;
  }

  hostUpdate() {
    this._hadFocus = this._gridContainsFocus();
  }

  hostUpdated() {
    const grid = this.getGrid();
    if (!grid) return;
    const layout = readLayout(grid);
    const clamped = clampPosition(layout, this.active);
    if (!clamped) return;
    const moved = clamped.row !== this.active.row || clamped.col !== this.active.col;
    this.active = clamped;
    if (moved) this.host.requestUpdate();
    if (!this._hadFocus) return;
    const cell = cellAt(grid, clamped);
    const focused = this._focusedElement();
    if (cell && !(focused && cell.contains(focused))) focusTarget(cell).focus();
  }

  /** `0` for the active cell, `-1` for every other cell. */
  tabIndexFor(row: number, col: number): 0 | -1 {
    return row === this.active.row && col === this.active.col ? 0 : -1;
  }

  /** Arrow keys, Home/End, Ctrl+Home/End, PageUp/PageDown, and Enter/Space activation. */
  handleKeydown = (event: KeyboardEvent) => {
    if (event.altKey || event.metaKey) return;
    const grid = this.getGrid();
    if (!grid) return;
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      this.options.onPageStep?.(event.key === "PageUp" ? -1 : 1);
      return;
    }
    const layout = readLayout(grid);
    if (layout.rows.length === 0) return;

    const path = event.composedPath();
    const inInput = path.some(node => node instanceof Element && node.hasAttribute("data-cell-focus"));
    const current = clampPosition(layout, positionFromPath(path, grid) ?? this.active);
    if (!current) return;

    const { key, ctrlKey } = event;
    let target: GridCellPosition | null = null;

    switch (key) {
      case "ArrowUp":
      case "ArrowDown": {
        const rowIndex = layout.rows.indexOf(current.row) + (key === "ArrowUp" ? -1 : 1);
        const row = layout.rows[Math.min(Math.max(rowIndex, 0), layout.rows.length - 1)];
        target = { row, col: current.col };
        break;
      }
      case "ArrowLeft":
      case "ArrowRight": {
        if (inInput) return;
        const cols = layout.cols.get(current.row) ?? [];
        const colIndex = cols.indexOf(current.col) + (key === "ArrowLeft" ? -1 : 1);
        target = { row: current.row, col: cols[Math.min(Math.max(colIndex, 0), cols.length - 1)] };
        break;
      }
      case "Home":
      case "End": {
        if (inInput) return;
        const row = ctrlKey ? (key === "Home" ? layout.rows[0] : layout.rows[layout.rows.length - 1]) : current.row;
        const cols = layout.cols.get(row) ?? [];
        target = { row, col: key === "Home" ? cols[0] : cols[cols.length - 1] };
        break;
      }
      case "Enter":
      case " ":
      case "Spacebar": {
        if (inInput) return;
        event.preventDefault();
        const cell = cellAt(grid, current);
        if (!cell) return;
        const activator = cell.querySelector<HTMLElement>("[data-activate]") ?? cell;
        activator.dispatchEvent(
          new MouseEvent("click", { bubbles: true, composed: true, cancelable: true, shiftKey: event.shiftKey })
        );
        return;
      }
      default:
        return;
    }

    event.preventDefault();
    this.focusCell(target);
  };

  /** Moves the roving tabindex to `position` (clamped to the grid) and focuses it. */
  focusCell(position: GridCellPosition) {
    const grid = this.getGrid();
    const clamped = grid ? clampPosition(readLayout(grid), position) : null;
    this.active = clamped ?? position;
    this.host.requestUpdate();
    const cell = grid && clamped ? cellAt(grid, clamped) : null;
    if (cell) focusTarget(cell).focus();
  }

  private _onFocusIn = (event: Event) => {
    const grid = this.getGrid();
    if (!grid) return;
    const position = positionFromPath(event.composedPath(), grid);
    if (!position || (position.row === this.active.row && position.col === this.active.col)) return;
    this.active = position;
    this.host.requestUpdate();
  };

  private _focusedElement(): Element | null {
    return this.host.shadowRoot?.activeElement ?? document.activeElement;
  }

  private _gridContainsFocus(): boolean {
    const grid = this.getGrid();
    if (!grid) return false;
    return [this.host.shadowRoot?.activeElement, document.activeElement].some(
      element => !!element && grid.contains(element)
    );
  }
}

export type DataTableKeyboardHost = ReactiveControllerHost &
  HTMLElement & { readonly renderRoot?: HTMLElement | DocumentFragment };

export interface DataTableKeyboardOptions {
  /** Called on PageUp (`-1`) and PageDown (`1`). */
  onPageStep?(delta: 1 | -1): void;
}

/** Position of the roving-tabindex cell. Row 0 is the first header row; rows are counted across thead and tbody. */
export interface GridCellPosition {
  row: number;
  col: number;
}

interface GridLayout {
  /** Sorted row indices that contain at least one cell. */
  rows: number[];
  /** Sorted column indices present in each row. */
  cols: Map<number, number[]>;
}

function readLayout(grid: HTMLElement): GridLayout {
  const cols = new Map<number, number[]>();
  grid.querySelectorAll<HTMLElement>("[data-row][data-col]").forEach(cell => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    if (!Number.isInteger(row) || !Number.isInteger(col)) return;
    const rowCols = cols.get(row) ?? [];
    if (!rowCols.includes(col)) rowCols.push(col);
    cols.set(row, rowCols);
  });
  cols.forEach(rowCols => rowCols.sort((a, b) => a - b));
  return { rows: [...cols.keys()].sort((a, b) => a - b), cols };
}

/** Nearest existing cell: the closest existing row, then `col` itself or the last existing col before it. */
function clampPosition(layout: GridLayout, position: GridCellPosition): GridCellPosition | null {
  if (layout.rows.length === 0) return null;
  const row = layout.rows.reduce((best, candidate) =>
    Math.abs(candidate - position.row) < Math.abs(best - position.row) ? candidate : best
  );
  const rowCols = layout.cols.get(row) ?? [];
  const col = [...rowCols].reverse().find(candidate => candidate <= position.col) ?? rowCols[0];
  return { row, col };
}

function cellAt(grid: HTMLElement, position: GridCellPosition): HTMLElement | null {
  return grid.querySelector<HTMLElement>(`[data-row="${position.row}"][data-col="${position.col}"]`);
}

function focusTarget(cell: HTMLElement): HTMLElement {
  return cell.querySelector<HTMLElement>("[data-cell-focus]") ?? cell;
}

function positionFromPath(path: EventTarget[], grid: HTMLElement): GridCellPosition | null {
  for (const node of path) {
    if (node === grid) return null;
    if (node instanceof HTMLElement && node.dataset.row !== undefined && node.dataset.col !== undefined) {
      const row = Number(node.dataset.row);
      const col = Number(node.dataset.col);
      if (Number.isInteger(row) && Number.isInteger(col) && grid.contains(node)) return { row, col };
    }
  }
  return null;
}
