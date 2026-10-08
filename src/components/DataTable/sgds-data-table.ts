import { css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { live } from "lit/directives/live.js";
import { styleMap } from "lit/directives/style-map.js";
import SgdsElement from "../../base/sgds-element";
import tableStyle from "./data-table.css";
import gridStyle from "./data-grid.css";
import SgdsPagination from "../Pagination/sgds-pagination";
import type { ISgdsPaginationPageChangeEventDetail } from "../Pagination/sgds-pagination";
import SgdsDataTableRow from "./sgds-data-table-row";
import SgdsDataTableCell from "./sgds-data-table-cell";
import SgdsDataTableHead from "./sgds-data-table-head";
import SgdsSkeleton from "../Skeleton/sgds-skeleton";
import SgdsDataTableColumn from "./sgds-data-table-column";
import { SgdsCheckbox } from "../Checkbox/sgds-checkbox";
import { SgdsInput } from "../Input/sgds-input";
import { SgdsIcon } from "../Icon/sgds-icon";
import { computeView, getCellValue } from "./data-table-engine";
import { DataTableKeyboardController } from "./data-table-keyboard";
import type {
  ISgdsDataTableFilterEventDetail,
  ISgdsDataTablePageChangeEventDetail,
  ISgdsDataTableRowSelectEventDetail,
  ISgdsDataTableSelectionChangeEventDetail,
  ISgdsDataTableSortEventDetail,
  SgdsDataTableColumnDefinition,
  SgdsDataTableDensity,
  SgdsDataTableRowData,
  SgdsDataTableRowKey,
  SgdsDataTableSortDirection,
  SgdsDataTableSortSpec,
  SgdsDataTableView
} from "./types";
export type {
  ISgdsDataTableFilterEventDetail,
  ISgdsDataTablePageChangeEventDetail,
  ISgdsDataTableRowSelectEventDetail,
  ISgdsDataTableSelectionChangeEventDetail,
  ISgdsDataTableSortEventDetail,
  SgdsDataTableColumnDefinition,
  SgdsDataTableDensity,
  SgdsDataTableRowData,
  SgdsDataTableRowKey,
  SgdsDataTableSortDirection,
  SgdsDataTableSortSpec,
  SgdsDataTableView
};

/**
 * @summary A data table with sorting, filtering, pagination, row selection, loading and empty states.
 *
 * Two authoring modes are supported:
 * - **Data mode** — set `columns` (or add `sgds-data-table-column` children) and `rows`. The table renders an
 *   ARIA grid with keyboard navigation, multi-column sorting, global and per-column filtering, density and sticky header.
 * - **Slotted mode** — compose `sgds-data-table-row` / `sgds-data-table-head` / `sgds-data-table-cell` children.
 *
 * @slot default - Slotted mode: one or more `sgds-data-table-row` elements. Data mode: optional `sgds-data-table-column` elements.
 * @slot no-data - Custom content rendered when no body rows are available and `loading` is false. Used in both slotted and data mode. Defaults to "No data".
 *
 * @csspart base - Data mode: the outer container of the table, toolbar and footer.
 * @csspart toolbar - Data mode: the toolbar above the table that holds the global filter. Rendered when `showGlobalFilter` is true.
 * @csspart global-filter - Data mode: the `sgds-input` search box bound to `globalFilter`.
 * @csspart table-container - Data mode: the scroll container around the table.
 * @csspart table - Data mode: the `<table role="grid">` element.
 * @csspart header-row - Data mode: the column header `<tr>`.
 * @csspart header-cell - Data mode: each `<th>` in the header and filter rows.
 * @csspart sort-indicator - Data mode: the sort icon inside a sortable header.
 * @csspart filter-row - Data mode: the second header `<tr>` that holds the per-column filter inputs.
 * @csspart filter-input - Data mode: each per-column filter `sgds-input`.
 * @csspart row - Data mode: each body `<tr>`.
 * @csspart cell - Data mode: each body `<td>`.
 * @csspart checkbox-cell - Data mode: the header and body cells of the selection checkbox column.
 * @csspart empty - Data mode: the full-width row shown when there are no rows.
 * @csspart loading - Data mode: each skeleton row shown while `loading` is true.
 * @csspart footer - Data mode: the footer that holds the pagination summary and pagination.
 * @csspart pagination-summary - Data mode: the summary text in the footer.
 * @csspart pagination - Data mode: the `sgds-pagination` element in the footer.
 *
 * @cssproperty --sgds-data-table-max-height - Data mode: maximum height of the scroll container. Pair with `stickyHeader`. Defaults to `none`.
 * @cssproperty --sgds-data-table-header-bg - Data mode: background of header cells. Defaults to `var(--sgds-surface-default)`.
 * @cssproperty --sgds-data-table-border-color - Data mode: colour of the table and cell borders. Defaults to `var(--sgds-border-color-muted)`.
 * @cssproperty --sgds-data-table-row-hover-bg - Data mode: background of a hovered body row. Defaults to `var(--sgds-bg-translucent-subtle)`.
 * @cssproperty --sgds-data-table-row-selected-bg - Data mode: background of a selected body row. Defaults to `var(--sgds-primary-surface-translucent)`.
 * @cssproperty --sgds-data-table-cell-padding-block - Data mode: vertical cell padding. Defaults to `var(--sgds-padding-sm)`, or `var(--sgds-padding-2-xs)` when `density="dense"`.
 * @cssproperty --sgds-data-table-cell-padding-inline - Data mode: horizontal cell padding. Defaults to `var(--sgds-padding-md)`, or `var(--sgds-padding-sm)` when `density="dense"`.
 * @cssproperty --sgds-data-table-cell-min-height - Data mode: minimum cell height. Defaults to `var(--sgds-dimension-56)`, or `var(--sgds-dimension-40)` when `density="dense"`.
 *
 * @event sgds-sort - Data mode: emitted whenever the sort state changes. Slotted mode: emitted when `serverSort` is true and a sorting column header is clicked.
 * @eventDetail {ISgdsDataTableSortEventDetail} sgds-sort
 * @event sgds-filter - Data mode: emitted when the global or a per-column filter changes.
 * @eventDetail {ISgdsDataTableFilterEventDetail} sgds-filter
 * @event sgds-page-change - Emitted when pagination changes page.
 * @eventDetail {ISgdsDataTablePageChangeEventDetail} sgds-page-change
 * @event sgds-selection-change - Emitted when row selection changes.
 * @eventDetail {ISgdsDataTableSelectionChangeEventDetail} sgds-selection-change
 * @event sgds-row-select - Deprecated, use `sgds-selection-change`. Slotted mode only. Detail: `{ selected: Record<string, string>[] }`.
 */
export class SgdsDataTable extends SgdsElement {
  static styles = [
    ...SgdsElement.styles,
    tableStyle,
    gridStyle,
    css`
      :host {
        display: block;
      }
    `
  ];

  /** @internal */
  static dependencies = {
    "sgds-pagination": SgdsPagination,
    "sgds-data-table-cell": SgdsDataTableCell,
    "sgds-data-table-head": SgdsDataTableHead,
    "sgds-skeleton": SgdsSkeleton,
    "sgds-data-table-column": SgdsDataTableColumn,
    "sgds-checkbox": SgdsCheckbox,
    "sgds-input": SgdsInput,
    "sgds-icon": SgdsIcon
  };

  /** If true, renders a checkbox column for row selection. */
  @property({ type: Boolean }) multiSelect = false;

  /** Total number of data items (for server-side pagination). */
  @property({ type: Number }) dataLength = 0;

  /** Current page (1-based). */
  @property({ type: Number }) currentPage = 1;

  /** Number of rows per page. */
  @property({ type: Number }) itemsPerPage = 5;

  /** Custom text shown on the footer's left side. */
  @property({ type: String }) paginationSummary = "";

  /** When true, shows a loading state and hides body rows. */
  @property({ type: Boolean }) loading = false;

  /** When true, emits sort events for external handling instead of local sorting. */
  @property({ type: Boolean }) serverSort = false;

  /** Variant forwarded to the internal pagination component. */
  @property({ type: String }) paginationVariant: "default" | "number" | "button" | "description" = "default";

  /**
   * Controls the CSS `table-layout` algorithm.
   * Use "auto" to let the browser size columns based on content, or "fixed" to distribute column widths evenly regardless of content.
   * @type {"auto" | "fixed"}
   * @default "auto"
   */
  @property({ type: String, reflect: true }) layout: "auto" | "fixed" = "auto";

  /**
   * Pagination mode. `client` (default) slices rows and renders pagination controls.
   * `server` renders all slotted rows as-is — the caller is responsible for passing
   * the correct page of data and handling `sgds-page-change` externally.
   */
  @property({ type: String }) mode: "client" | "server" = "client";

  /**
   * Data mode: column definitions. Takes precedence over `sgds-data-table-column` children.
   * @type {SgdsDataTableColumnDefinition[]}
   */
  @property({ attribute: false }) columns: SgdsDataTableColumnDefinition[] = [];

  /**
   * Data mode: row objects. In `mode="server"` pass only the current page and set `dataLength`.
   * @type {SgdsDataTableRowData[]}
   */
  @property({ attribute: false }) rows: SgdsDataTableRowData[] = [];

  /** Data mode: field on each row used as its stable identity for selection. */
  @property({ type: String }) rowKey = "id";

  /**
   * Data mode: current sort state. Index 0 is the primary sort. Updated on header activation.
   * @type {SgdsDataTableSortSpec[]}
   */
  @property({ attribute: false }) sort: SgdsDataTableSortSpec[] = [];

  /** Data mode: allows sorting by more than one column (Shift + click, or Shift + Enter/Space on a header). */
  @property({ type: Boolean, reflect: true }) multiSort = false;

  /** Data mode: text matched against every column. */
  @property({ type: String }) globalFilter = "";

  /**
   * Data mode: per-column filter text keyed by column `key`.
   * @type {Record<string, string>}
   */
  @property({ attribute: false }) columnFilters: Record<string, string> = {};

  /** Data mode: renders a search input above the table bound to `globalFilter`. */
  @property({ type: Boolean, reflect: true }) showGlobalFilter = false;

  /** Data mode: when true, filters are not applied locally; listen to `sgds-filter` and update `rows`. */
  @property({ type: Boolean }) serverFilter = false;

  /**
   * Data mode: keys (`row[rowKey]`) of the selected rows. Requires `multiSelect`.
   * @type {SgdsDataTableRowKey[]}
   */
  @property({ attribute: false }) selectedKeys: SgdsDataTableRowKey[] = [];

  /** Row height and cell padding. */
  @property({ type: String, reflect: true }) density: SgdsDataTableDensity = "comfortable";

  /** Keeps the header row visible while the table body scrolls. Set `--sgds-data-table-max-height` to make the body scroll. */
  @property({ type: Boolean, reflect: true }) stickyHeader = false;

  /** Accessible name of the grid. Required in data mode when there is no visible heading labelling the table. */
  @property({ type: String }) label = "";

  @state() private _columnElements: SgdsDataTableColumn[] = [];

  /** @internal Derived data-mode view model, recomputed in `willUpdate`. */
  protected _view: SgdsDataTableView = { processedRows: [], pageRows: [], totalCount: 0 };

  /** @internal */
  protected _keyboard = new DataTableKeyboardController(
    this,
    () => this.shadowRoot?.querySelector<HTMLElement>("[role='grid']") ?? null
  );

  @state() private tableRows: SgdsDataTableRow[] = [];
  @state() private headerRows: SgdsDataTableRow[] = [];

  private _headerCells: SgdsDataTableHead[] = [];
  private _initialRowPositions = new WeakMap<SgdsDataTableRow, number>();
  private _hasCapturedInitialRowPositions = false;

  private _rowHandlers = new WeakMap<SgdsDataTableRow, EventListener>();

  private _isRowChecked(row: SgdsDataTableRow) {
    return row.checked || row.checkbox?.checked === true;
  }

  private _updateHeaderCheckbox() {
    const checkedCount = this.tableRows.filter(r => this._isRowChecked(r)).length;

    const allChecked = checkedCount === this.tableRows.length && checkedCount > 0;

    this.headerRows.forEach(r => {
      r.checked = allChecked;
      if (r.checkbox) {
        r.checkbox.checked = allChecked;
        r.checkbox.indeterminate = checkedCount > 0 && !allChecked;
      }
    });
  }

  private async _syncHeaderCheckboxAfterRender() {
    if (!this.multiSelect || this.headerRows.length === 0) return;

    const rows = [...this.headerRows, ...this.tableRows];
    await Promise.all(rows.map(row => row.updateComplete));
    this._updateHeaderCheckbox();
  }

  private _emitRowSelect() {
    const selected = this.tableRows.filter(r => this._isRowChecked(r)).map(r => this._getRowData(r));
    this.emit("sgds-row-select", { detail: { selected } });
    this.emit<ISgdsDataTableSelectionChangeEventDetail>("sgds-selection-change", {
      detail: {
        selectedKeys: this.tableRows.reduce<number[]>((keys, r, index) => {
          if (this._isRowChecked(r)) keys.push(index);
          return keys;
        }, []),
        selectedRows: selected
      }
    });
  }

  private _attachRowListener(row: SgdsDataTableRow) {
    const old = this._rowHandlers.get(row);
    if (old) row.removeEventListener("i-sgds-change", old);

    const handler: EventListener = (e: Event) => {
      const { checked } = (e as CustomEvent<{ checked: boolean }>).detail;

      if (this.headerRows.includes(row)) {
        this.tableRows.forEach(r => {
          r.checked = checked;
          if (r.checkbox) r.checkbox.checked = checked;
        });
      } else {
        row.checked = checked;
        this._updateHeaderCheckbox();
      }
      this._emitRowSelect();
    };

    this._rowHandlers.set(row, handler);
    row.addEventListener("i-sgds-change", handler);
  }

  private _configureRows() {
    const hasExpand = this.tableRows.some(r => r.expand);
    const hasDataRows = this.tableRows.length > 0;

    this.headerRows.forEach(row => {
      row.showCheckbox = this.multiSelect;
      row.showExpandPlaceholder = hasExpand;
      row.hasDataRows = hasDataRows;
      if (this.multiSelect) this._attachRowListener(row);
    });

    this.tableRows.forEach(row => {
      row.showCheckbox = this.multiSelect;
      row.showExpandPlaceholder = !row.expand && hasExpand;
      if (this.multiSelect) this._attachRowListener(row);
    });

    if (this.multiSelect) {
      this._syncHeaderCheckboxAfterRender();
    }

    this._applyColumnAlignment();
  }

  private _applyColumnAlignment() {
    const headerAlignments = this._headerCells.reduce<Array<"left" | "right">>((acc, header) => {
      const span = Number(header.colSpan) > 0 ? Number(header.colSpan) : 1;
      const alignment = header.textAlign ?? "left";
      for (let i = 0; i < span; i++) {
        acc.push(alignment);
      }
      return acc;
    }, []);

    this.headerRows.forEach(row => {
      row.columnAlignments = [...headerAlignments];
    });

    this.tableRows.forEach(row => {
      row.columnAlignments = [...headerAlignments];
    });
  }

  private _extractCellText(row: SgdsDataTableRow, columnIndex: number) {
    const rowCellText = row.getCellText(columnIndex);
    if (rowCellText) return rowCellText;

    const cells = Array.from(row.children).filter(child => child.tagName.toLowerCase() === "sgds-data-table-cell");
    const cell = cells[columnIndex];
    return (cell?.textContent || "").trim();
  }

  private _getRowData(row: SgdsDataTableRow): Record<string, string> {
    const data: Record<string, string> = {};
    this._headerCells.forEach((header, index) => {
      const key = header.sortKey || (header.textContent ?? "").trim() || `col-${index}`;
      data[key] = this._extractCellText(row, index);
    });
    return data;
  }

  private _toComparableValue(row: SgdsDataTableRow, _key: string, columnIndex: number) {
    return this._extractCellText(row, columnIndex);
  }

  private _compareValues(left: unknown, right: unknown, direction: "ascending" | "descending") {
    if (left === right) return 0;

    const leftNumber = Number(left);
    const rightNumber = Number(right);
    const bothNumeric = Number.isFinite(leftNumber) && Number.isFinite(rightNumber);

    if (bothNumeric) {
      return direction === "ascending" ? leftNumber - rightNumber : rightNumber - leftNumber;
    }

    const cmp = String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
    return direction === "ascending" ? cmp : -cmp;
  }

  private _resetOtherHeaderSortStates(activeHeader: SgdsDataTableHead | null) {
    this._headerCells.forEach(header => {
      if (header !== activeHeader && header.sorting) {
        header.sortDirection = "none";
      }
    });
  }

  private _getRowsInInitialPositionOrder(rows: SgdsDataTableRow[]) {
    return [...rows].sort((left, right) => {
      const leftPosition = this._initialRowPositions.get(left);
      const rightPosition = this._initialRowPositions.get(right);

      if (leftPosition === undefined && rightPosition === undefined) return 0;
      if (leftPosition === undefined) return 1;
      if (rightPosition === undefined) return -1;
      return leftPosition - rightPosition;
    });
  }

  private _captureInitialRowPositions(rows: SgdsDataTableRow[]) {
    if (this._hasCapturedInitialRowPositions) return;

    rows.forEach((row, index) => {
      this._initialRowPositions.set(row, index);
    });

    this._hasCapturedInitialRowPositions = true;
  }

  private _handleSort(e: Event) {
    const activeHeader = e.composedPath().find(node => node instanceof SgdsDataTableHead) as
      | SgdsDataTableHead
      | undefined;

    if (!activeHeader || !activeHeader.sorting) return;

    const { key, direction } = (e as CustomEvent<ISgdsDataTableSortEventDetail>).detail;
    const columnIndex = activeHeader ? this._headerCells.indexOf(activeHeader) : -1;

    this._resetOtherHeaderSortStates(activeHeader);

    if (this.serverSort) {
      e.stopPropagation();
      this.emit("sgds-sort", { detail: { key, direction } });
      return;
    }

    if (columnIndex < 0) return;

    if (direction === "none") {
      this.tableRows = this._getRowsInInitialPositionOrder(this.tableRows);
      this._syncDomRowOrder();
      this._updateVisibleRows();
      return;
    }

    if (this.mode === "client") {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      const nextRows = [...this.tableRows];

      const sortedVisibleRows = nextRows.slice(start, end).sort((left, right) => {
        const leftValue = this._toComparableValue(left, key, columnIndex);
        const rightValue = this._toComparableValue(right, key, columnIndex);
        return this._compareValues(leftValue, rightValue, direction);
      });
      nextRows.splice(start, sortedVisibleRows.length, ...sortedVisibleRows);

      this.tableRows = nextRows;
      this._syncDomRowOrder();
      this._updateVisibleRows();
      return;
    }

    this.tableRows = [...this.tableRows].sort((left, right) => {
      const leftValue = this._toComparableValue(left, key, columnIndex);
      const rightValue = this._toComparableValue(right, key, columnIndex);
      return this._compareValues(leftValue, rightValue, direction);
    });

    this._syncDomRowOrder();
    this._updateVisibleRows();
  }

  private _syncDomRowOrder() {
    const parent = this.tableRows[0]?.parentElement;
    if (!parent) return;
    this.tableRows.forEach(row => parent.appendChild(row));
  }

  private _handleSlotChange(e: Event) {
    const assigned = (e.target as HTMLSlotElement).assignedElements({ flatten: true });
    this._columnElements = assigned.filter(el => el instanceof SgdsDataTableColumn) as SgdsDataTableColumn[];

    const slotted = assigned.filter(el => el instanceof SgdsDataTableRow) as SgdsDataTableRow[];

    const rowTableChildren = (row: SgdsDataTableRow) =>
      Array.from(row.children).filter(child => {
        const tagName = child.tagName.toLowerCase();
        const isTableCell = tagName === "sgds-data-table-cell" || tagName === "sgds-data-table-head";
        if (!isTableCell) return false;
        return child.getAttribute("slot") !== "content";
      });

    this.headerRows = slotted.filter(row =>
      rowTableChildren(row).some(child => child.tagName.toLowerCase() === "sgds-data-table-head")
    );

    this.tableRows = slotted.filter(row => {
      const children = rowTableChildren(row);
      return children.length > 0 && children.every(child => child.tagName.toLowerCase() === "sgds-data-table-cell");
    });

    this._headerCells = this.headerRows.reduce<SgdsDataTableHead[]>((acc, row) => {
      const headers = Array.from(row.children).filter(
        child => child instanceof SgdsDataTableHead
      ) as SgdsDataTableHead[];
      acc.push(...headers);
      return acc;
    }, []);

    this._captureInitialRowPositions(this.tableRows);

    this._headerCells.forEach(header => {
      if (header.sorting && !header.sortDirection) {
        header.sortDirection = "none";
      }
    });

    this._configureRows();
    this._updateVisibleRows();
  }

  private _updateVisibleRows() {
    if (this.isDataMode) return;
    if (this.loading) {
      this.tableRows.forEach(row => (row.style.display = "none"));
      return;
    }

    if (this.mode === "server") {
      this.tableRows.forEach(row => (row.style.display = ""));
      return;
    }

    const total = this.dataLength || this.tableRows.length;
    const lastPage = Math.max(1, Math.ceil(total / this.itemsPerPage));
    if (this.currentPage > lastPage) {
      this.currentPage = lastPage;
      return;
    }
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const visible = new Set(this.tableRows.slice(start, start + this.itemsPerPage));
    this.tableRows.forEach(row => (row.style.display = visible.has(row) ? "" : "none"));
  }

  private _getSkeletonColumnCount(): { dataColumns: number; hasExpand: boolean; hasCheckbox: boolean } {
    const headerColumnCount = this._headerCells.reduce((count, header) => {
      const span = Number(header.colSpan) > 0 ? Number(header.colSpan) : 1;
      return count + span;
    }, 0);

    const firstBodyRow = this.tableRows[0];
    const fallbackBodyColumnCount = firstBodyRow
      ? Array.from(firstBodyRow.children).filter(child => child instanceof SgdsDataTableCell).length
      : 0;

    const hasExpand = this.tableRows.some(row => row.expand);
    const dataColumns = headerColumnCount || fallbackBodyColumnCount || 1;

    return { dataColumns, hasExpand, hasCheckbox: this.multiSelect };
  }

  private _renderLoadingSkeleton() {
    const { dataColumns, hasExpand, hasCheckbox } = this._getSkeletonColumnCount();
    const skeletonRows = Math.max(1, this.itemsPerPage || 1);

    return Array.from(
      { length: skeletonRows },
      () =>
        html`<div class="skeleton-row" role="presentation">
          ${hasExpand
            ? html`<div class="skeleton-cell control-cell">
                <sgds-skeleton .height=${"20px"} .width=${"20px"} .borderRadius=${"4px"}></sgds-skeleton>
              </div>`
            : nothing}
          ${hasCheckbox
            ? html`<div class="skeleton-cell control-cell">
                <sgds-skeleton .height=${"24px"} .width=${"24px"} .borderRadius=${"4px"}></sgds-skeleton>
              </div>`
            : nothing}
          ${Array.from(
            { length: dataColumns },
            () =>
              html`<div class="skeleton-cell">
                <sgds-skeleton .height=${"100%"} .borderRadius=${"4px"}></sgds-skeleton>
              </div>`
          )}
        </div>`
    );
  }

  /* ── Data mode: shared ─────────────────────────────────────────── */

  /** True when columns come from the `columns` property or `sgds-data-table-column` children. */
  get isDataMode(): boolean {
    return this.columns.length > 0 || this._columnElements.length > 0;
  }

  /** @internal Effective column definitions for data mode. */
  protected get _effectiveColumns(): SgdsDataTableColumnDefinition[] {
    return this.columns.length > 0 ? this.columns : this._columnElements.map(column => column.toColumn());
  }

  /** @internal Key of a row object. */
  protected _rowKeyOf(row: SgdsDataTableRowData): SgdsDataTableRowKey {
    return row[this.rowKey] as SgdsDataTableRowKey;
  }

  /** Data mode: row objects whose keys are in `selectedKeys`. */
  get selectedRows(): SgdsDataTableRowData[] {
    const keys = new Set(this.selectedKeys);
    return this.rows.filter(row => keys.has(this._rowKeyOf(row)));
  }

  private _onColumnChange = () => this.requestUpdate();

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("i-sgds-column-change", this._onColumnChange);
  }

  disconnectedCallback() {
    this.removeEventListener("i-sgds-column-change", this._onColumnChange);
    super.disconnectedCallback();
  }

  private _viewOptions() {
    return {
      rows: this.rows,
      columns: this._effectiveColumns,
      sort: this.sort,
      globalFilter: this.globalFilter,
      columnFilters: this.columnFilters,
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      serverPaginate: this.mode === "server",
      serverSort: this.serverSort,
      serverFilter: this.serverFilter,
      dataLength: this.dataLength
    };
  }

  protected willUpdate(changed: Map<PropertyKey, unknown>) {
    super.willUpdate(changed);
    if (!this.isDataMode) return;
    this._view = computeView(this._viewOptions());
    if (this.mode !== "server" && this.itemsPerPage > 0) {
      const lastPage = Math.max(1, Math.ceil(this._view.totalCount / this.itemsPerPage));
      if (this.currentPage > lastPage) {
        this.currentPage = lastPage;
        this._view = computeView({ ...this._viewOptions(), currentPage: lastPage });
      }
    }
  }

  /* ── Data mode: state transitions (owned by logic/keyboard work) ── */

  /** @internal Header activated by click, Enter or Space. `additive` is true when Shift is held. */
  protected _onHeaderActivate(key: string, additive: boolean) {
    // TODO(logic): nextSortState + emit sgds-sort — see ADR data-table-data-mode.md
    void key;
    void additive;
  }

  /** @internal */
  protected _onGlobalFilterInput(value: string) {
    // TODO(logic): update globalFilter, reset currentPage to 1, emit sgds-filter
    void value;
  }

  /** @internal */
  protected _onColumnFilterInput(key: string, value: string) {
    // TODO(logic): update columnFilters immutably, reset currentPage to 1, emit sgds-filter
    void key;
    void value;
  }

  /** @internal */
  protected _toggleRowSelection(key: SgdsDataTableRowKey) {
    // TODO(logic): toggle key in selectedKeys immutably, emit sgds-selection-change
    void key;
  }

  /** @internal Header checkbox: selects all rows on the current page, or clears them when all are selected. */
  protected _toggleSelectAll() {
    // TODO(logic): see ADR data-table-data-mode.md
  }

  /** @internal Header checkbox state for the current page. */
  protected _selectAllState(): "all" | "some" | "none" {
    // TODO(logic)
    return "none";
  }

  /** @internal */
  protected _goToPage(page: number) {
    this.currentPage = page;
    this.emit<ISgdsDataTablePageChangeEventDetail>("sgds-page-change", {
      detail: { currentPage: page, itemsPerPage: this.itemsPerPage }
    });
  }

  /** Data mode: clears the selection and emits `sgds-selection-change`. */
  public clearSelection() {
    // TODO(logic)
  }

  /* ── Data mode: rendering (owned by render/styles work) ─────────── */

  /** @internal */
  protected _renderGrid() {
    const columns = this._effectiveColumns;
    const { pageRows, totalCount } = this._view;
    const hasFilterRow = columns.some(column => column.filterable);
    const headerRowCount = hasFilterRow ? 2 : 1;
    const colOffset = this.multiSelect ? 1 : 0;
    const colCount = columns.length + colOffset;
    const pageOffset = this.itemsPerPage > 0 ? (this.currentPage - 1) * this.itemsPerPage : 0;
    const showFooter = this.mode === "server" || totalCount > this.itemsPerPage;

    return html`
      <div class="data-table data-grid" part="base">
        <slot hidden @slotchange=${this._handleSlotChange}></slot>
        ${this.showGlobalFilter
          ? html`<div class="toolbar" part="toolbar">
              <sgds-input
                part="global-filter"
                type="search"
                label="Search"
                placeholder="Search"
                autocomplete="off"
                .value=${live(this.globalFilter)}
                @sgds-input=${(e: Event) => this._onGlobalFilterInput((e.target as SgdsInput).value)}
              ></sgds-input>
            </div>`
          : nothing}
        <div class="table-container" part="table-container">
          <table
            class="grid"
            role="grid"
            part="table"
            aria-label=${this.label || nothing}
            aria-rowcount=${totalCount + headerRowCount}
            aria-colcount=${colCount}
            aria-multiselectable=${this.multiSelect ? "true" : nothing}
            aria-busy=${this.loading ? "true" : nothing}
            @keydown=${this._keyboard.handleKeydown}
          >
            <thead>
              ${this._renderHeaderRow(columns, colOffset)}
              ${hasFilterRow ? this._renderFilterRow(columns, colOffset) : nothing}
            </thead>
            <tbody>
              ${this.loading
                ? this._renderGridLoading(colCount)
                : pageRows.length === 0
                ? this._renderGridEmpty(colCount)
                : pageRows.map((row, index) =>
                    this._renderBodyRow(
                      row,
                      index,
                      columns,
                      headerRowCount + index,
                      pageOffset + index + 1,
                      headerRowCount
                    )
                  )}
            </tbody>
          </table>
        </div>
        <div class="visually-hidden" role="status" aria-live="polite">
          ${this.loading ? "" : `${totalCount} results`}
        </div>
        ${showFooter ? this._renderGridFooter(totalCount, pageOffset, pageRows.length) : nothing}
      </div>
    `;
  }

  private _renderHeaderRow(columns: SgdsDataTableColumnDefinition[], colOffset: number) {
    const selectAll = this.multiSelect ? this._selectAllState() : "none";
    return html`<tr part="header-row" aria-rowindex="1">
      ${this.multiSelect
        ? html`<th
            scope="col"
            part="header-cell checkbox-cell"
            class="checkbox-cell"
            data-row="0"
            data-col="0"
            data-activate
            tabindex=${this._keyboard.tabIndexFor(0, 0)}
            @click=${() => this._toggleSelectAll()}
          >
            <sgds-checkbox
              tabindex="-1"
              .ariaLabel=${"Select all rows"}
              .checked=${live(selectAll === "all")}
              .indeterminate=${live(selectAll === "some")}
            ></sgds-checkbox>
          </th>`
        : nothing}
      ${columns.map((column, index) => this._renderHeaderCell(column, index + colOffset))}
    </tr>`;
  }

  private _renderHeaderCell(column: SgdsDataTableColumnDefinition, col: number) {
    const sortIndex = this.sort.findIndex(spec => spec.key === column.key);
    const direction = sortIndex >= 0 ? this.sort[sortIndex].direction : undefined;
    const ariaSort = sortIndex === 0 && direction ? direction : nothing;
    const icon =
      direction === "ascending" ? "arrow-up" : direction === "descending" ? "arrow-down" : "chevron-selector-vertical";

    return html`<th
      scope="col"
      part="header-cell"
      class=${classMap({ "align-right": column.align === "right" })}
      style=${styleMap({ width: column.width })}
      data-row="0"
      data-col=${col}
      aria-sort=${column.sortable ? ariaSort : nothing}
      tabindex=${this._keyboard.tabIndexFor(0, col)}
    >
      ${column.sortable
        ? html`<button
            type="button"
            class="header-activator"
            tabindex="-1"
            data-activate
            @click=${(e: MouseEvent) => this._onHeaderActivate(column.key, e.shiftKey)}
          >
            <span>${column.header}</span>
            ${sortIndex > 0 && direction
              ? html`<span class="visually-hidden">sorted ${direction}, priority ${sortIndex + 1}</span>`
              : nothing}
            <sgds-icon
              part="sort-indicator"
              class=${classMap({ "sort-indicator": true, sorted: !!direction })}
              name=${icon}
              size="sm"
              aria-hidden="true"
            ></sgds-icon>
          </button>`
        : column.header}
    </th>`;
  }

  private _renderFilterRow(columns: SgdsDataTableColumnDefinition[], colOffset: number) {
    return html`<tr part="filter-row" class="filter-row" aria-rowindex="2">
      ${this.multiSelect
        ? html`<th part="header-cell" data-row="1" data-col="0" tabindex=${this._keyboard.tabIndexFor(1, 0)}>
            <span class="visually-hidden">No filter</span>
          </th>`
        : nothing}
      ${columns.map((column, index) => {
        const col = index + colOffset;
        if (!column.filterable) {
          return html`<th
            part="header-cell"
            data-row="1"
            data-col=${col}
            tabindex=${this._keyboard.tabIndexFor(1, col)}
          >
            <span class="visually-hidden">No filter</span>
          </th>`;
        }
        const label = `Filter ${column.header}`;
        return html`<th part="header-cell" data-row="1" data-col=${col} tabindex="-1">
          <sgds-input
            part="filter-input"
            data-cell-focus
            type="text"
            aria-label=${label}
            placeholder=${label}
            autocomplete="off"
            tabindex=${this._keyboard.tabIndexFor(1, col) === 0 ? nothing : "-1"}
            .value=${live(this.columnFilters[column.key] ?? "")}
            @sgds-input=${(e: Event) => this._onColumnFilterInput(column.key, (e.target as SgdsInput).value)}
          ></sgds-input>
        </th>`;
      })}
    </tr>`;
  }

  private _renderBodyRow(
    row: SgdsDataTableRowData,
    index: number,
    columns: SgdsDataTableColumnDefinition[],
    gridRow: number,
    rowNumber: number,
    headerRowCount: number
  ) {
    const key = this._rowKeyOf(row);
    const selected = this.multiSelect && this.selectedKeys.includes(key);
    const colOffset = this.multiSelect ? 1 : 0;
    return html`<tr
      part="row"
      aria-rowindex=${headerRowCount + rowNumber}
      aria-selected=${this.multiSelect ? (selected ? "true" : "false") : nothing}
    >
      ${this.multiSelect
        ? html`<td
            role="gridcell"
            part="cell checkbox-cell"
            class="checkbox-cell"
            data-row=${gridRow}
            data-col="0"
            data-activate
            tabindex=${this._keyboard.tabIndexFor(gridRow, 0)}
            @click=${() => this._toggleRowSelection(key)}
          >
            <sgds-checkbox
              tabindex="-1"
              .ariaLabel=${`Select row ${rowNumber}`}
              .checked=${live(selected)}
            ></sgds-checkbox>
          </td>`
        : nothing}
      ${columns.map((column, colIndex) => {
        const value = getCellValue(row, column);
        return html`<td
          role="gridcell"
          part="cell"
          class=${classMap({ "align-right": column.align === "right" })}
          style=${styleMap({ width: column.width })}
          data-row=${gridRow}
          data-col=${colIndex + colOffset}
          tabindex=${this._keyboard.tabIndexFor(gridRow, colIndex + colOffset)}
        >
          ${column.render ? column.render(value, row, index) : String(value ?? "")}
        </td>`;
      })}
    </tr>`;
  }

  private _renderGridEmpty(colCount: number) {
    return html`<tr part="empty">
      <td role="gridcell" class="empty-cell" colspan=${colCount}>
        <slot name="no-data">No data</slot>
      </td>
    </tr>`;
  }

  private _renderGridLoading(colCount: number) {
    const skeletonRows = Math.max(1, this.itemsPerPage || 1);
    return Array.from(
      { length: skeletonRows },
      () => html`<tr part="loading" aria-hidden="true">
        ${Array.from(
          { length: colCount },
          (_, col) => html`<td class=${classMap({ "checkbox-cell": this.multiSelect && col === 0 })}>
            ${this.multiSelect && col === 0
              ? html`<sgds-skeleton .height=${"24px"} .width=${"24px"} .borderRadius=${"4px"}></sgds-skeleton>`
              : html`<sgds-skeleton .height=${"20px"} .borderRadius=${"4px"}></sgds-skeleton>`}
          </td>`
        )}
      </tr>`
    );
  }

  private _renderGridFooter(totalCount: number, pageOffset: number, pageRowCount: number) {
    const start = this.mode === "server" ? pageOffset : Math.min(pageOffset, totalCount);
    const end = Math.min(start + pageRowCount, totalCount);
    const displayStart = totalCount === 0 || pageRowCount === 0 ? 0 : start + 1;
    return html`<div class="footer" part="footer">
      <span part="pagination-summary">
        ${this.loading
          ? nothing
          : this.paginationSummary || `Showing ${displayStart} to ${end} of ${totalCount} results`}
      </span>
      <sgds-pagination
        part="pagination"
        .dataLength=${totalCount}
        .currentPage=${this.currentPage}
        .itemsPerPage=${this.itemsPerPage}
        .variant=${this.paginationVariant}
        size="sm"
        @sgds-page-change=${(e: CustomEvent<ISgdsPaginationPageChangeEventDetail>) => {
          e.stopPropagation();
          this._goToPage(e.detail.currentPage);
        }}
      ></sgds-pagination>
    </div>`;
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has("currentPage") || changed.has("itemsPerPage") || changed.has("mode") || changed.has("loading")) {
      this._updateVisibleRows();
    }
    if (changed.has("multiSelect")) {
      this._configureRows();
    }

    if (this.multiSelect && (changed.has("tableRows") || changed.has("headerRows"))) {
      this._syncHeaderCheckboxAfterRender();
    }
  }

  render() {
    if (this.isDataMode) return this._renderGrid();

    const total = this.dataLength || this.tableRows.length;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = Math.min(start + this.itemsPerPage, total);
    const displayStart = total === 0 ? 0 : start + 1;
    const showNoData = !this.loading && this.tableRows.length === 0;
    const showFooter = total !== 0;

    return html`
      <div class="data-table">
        <div class="table-container">
          <div class="table" role="table">
            <slot @slotchange=${this._handleSlotChange} @i-sgds-sort=${this._handleSort}></slot>
            ${this.loading ? this._renderLoadingSkeleton() : nothing}
          </div>
          ${!this.loading && showNoData
            ? html`<slot name="no-data" class="no-data" role="status" aria-live="polite">No data</slot>`
            : nothing}
        </div>

        ${showFooter
          ? html`<div class="footer">
              ${this.loading
                ? html`<span></span>`
                : this.paginationSummary || html`<span>Showing ${displayStart} to ${end} of ${total} results</span>`}
              <sgds-pagination
                .dataLength=${total}
                .currentPage=${this.currentPage}
                .itemsPerPage=${this.itemsPerPage}
                .variant=${this.paginationVariant}
                size="sm"
                @sgds-page-change=${(e: CustomEvent<ISgdsPaginationPageChangeEventDetail>) => {
                  e.stopPropagation();
                  this._goToPage(e.detail.currentPage);
                }}
              ></sgds-pagination>
            </div>`
          : nothing}
      </div>
    `;
  }
}

export default SgdsDataTable;
