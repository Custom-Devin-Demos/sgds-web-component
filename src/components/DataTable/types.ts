import type { TemplateResult } from "lit";

export interface ISgdsDataTableFilterEventDetail {
  globalFilter: string;
  columnFilters: Record<string, string>;
  /** Number of rows that match the filters (client-side filtering only; equals `dataLength` when `serverFilter`). */
  filteredCount: number;
}

export interface ISgdsDataTablePageChangeEventDetail {
  currentPage: number;
  itemsPerPage: number;
}

export interface ISgdsDataTableRowSelectEventDetail {
  selected: Record<string, string>[];
}

export interface ISgdsDataTableSelectionChangeEventDetail<T extends SgdsDataTableRowData = SgdsDataTableRowData> {
  selectedKeys: SgdsDataTableRowKey[];
  selectedRows: T[];
}

export interface ISgdsDataTableSortEventDetail {
  /** Column whose header was activated. */
  key: string;
  /** New direction for `key`. "none" means the column was removed from the sort. */
  direction: SgdsDataTableSortDirection | "none";
  /** Full sort state after the change (data mode). Index 0 is the primary sort. */
  sort?: SgdsDataTableSortSpec[];
}

/**
 * Column definition used by data mode. Supplied via the `columns` property
 * or derived from `<sgds-data-table-column>` light-DOM children.
 */
export interface SgdsDataTableColumnDefinition<T extends SgdsDataTableRowData = SgdsDataTableRowData> {
  /** Field on each row object. Also used as the column identity in sort/filter state and events. */
  key: string;
  /** Visible header label. */
  header: string;
  /** Enables click / Enter / Space sorting on the column header. */
  sortable?: boolean;
  /** Renders a per-column text filter input for this column. */
  filterable?: boolean;
  /** Horizontal alignment for header and body cells. Defaults to "left". */
  align?: "left" | "right";
  /** CSS width applied to the column (e.g. "120px", "20%"). */
  width?: string;
  /** Returns the raw value used for display, sorting and filtering. Defaults to `row[key]`. */
  accessor?: (row: T) => unknown;
  /** Custom cell renderer. Defaults to `String(value ?? "")`. */
  render?: (value: unknown, row: T, rowIndex: number) => TemplateResult | string | number;
  /** Ascending comparator for this column. Defaults to numeric-aware locale compare. */
  sortFn?: (a: T, b: T) => number;
  /** Per-column predicate. Defaults to case-insensitive substring match on `String(value)`. */
  filterFn?: (value: unknown, query: string, row: T) => boolean;
}

export type SgdsDataTableDensity = "comfortable" | "dense";

/** A single row of data supplied through the `rows` property. */
export type SgdsDataTableRowData = Record<string, unknown>;

/** Identity of a row, read from `row[rowKey]`. */
export type SgdsDataTableRowKey = string | number;

export type SgdsDataTableSortDirection = "ascending" | "descending";

/** One entry of the (multi-column) sort state. Index 0 is the primary sort. */
export interface SgdsDataTableSortSpec {
  key: string;
  direction: SgdsDataTableSortDirection;
}

/** Derived view model computed from host properties on every update (data mode only). */
export interface SgdsDataTableView<T extends SgdsDataTableRowData = SgdsDataTableRowData> {
  /** Rows after filtering and sorting (all pages). */
  processedRows: T[];
  /** Rows rendered on the current page. */
  pageRows: T[];
  /** Total row count used for pagination (`dataLength` in server mode, else `processedRows.length`). */
  totalCount: number;
}
