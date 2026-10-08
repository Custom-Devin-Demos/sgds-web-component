import type { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Roving-tabindex keyboard navigation for the data-mode grid (WAI-ARIA APG "Data Grid").
 *
 * Contract with the template:
 * - Every navigable cell is a `th`/`td` carrying `data-row` and `data-col` (0-based grid coordinates).
 * - Exactly one cell (or the single interactive control inside it, see ADR) has `tabindex="0"`; all others `-1`.
 * - The template calls `tabIndexFor(row, col)` while rendering and binds `handleKeydown` on the grid element.
 */
export class DataTableKeyboardController implements ReactiveController {
  active: GridCellPosition = { row: 0, col: 0 };

  constructor(
    private readonly host: ReactiveControllerHost & HTMLElement,
    private readonly getGrid: () => HTMLElement | null
  ) {
    host.addController(this);
  }

  hostConnected() {
    // no-op
  }

  /** `0` for the active cell, `-1` for every other cell. */
  tabIndexFor(row: number, col: number): 0 | -1 {
    return row === this.active.row && col === this.active.col ? 0 : -1;
  }

  /** Arrow keys, Home/End, Ctrl+Home/End, PageUp/PageDown. Enter/Space are handled by the host's cell handlers. */
  handleKeydown = (event: KeyboardEvent) => {
    // TODO(keyboard): implement — see ADR data-table-data-mode.md
    void event;
    void this.getGrid;
  };

  /** Moves the roving tabindex to `position` (clamped to the grid) and focuses it. */
  focusCell(position: GridCellPosition) {
    // TODO(keyboard): implement — see ADR data-table-data-mode.md
    this.active = position;
    this.host.requestUpdate();
  }
}

/** Position of the roving-tabindex cell. Row 0 is the first header row; rows are counted across thead and tbody. */
export interface GridCellPosition {
  row: number;
  col: number;
}
