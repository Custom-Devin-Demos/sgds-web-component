import type {
  SgdsDataTableColumnDefinition,
  SgdsDataTableRowData,
  SgdsDataTableSortSpec,
  SgdsDataTableView
} from "./types";

export interface ComputeViewOptions<T extends SgdsDataTableRowData> {
  rows: T[];
  columns: SgdsDataTableColumnDefinition<T>[];
  sort: SgdsDataTableSortSpec[];
  globalFilter: string;
  columnFilters: Record<string, string>;
  currentPage: number;
  itemsPerPage: number;
  /** `mode === "server"`: rows are already the current page; skip pagination. */
  serverPaginate: boolean;
  serverSort: boolean;
  serverFilter: boolean;
  /** Total rows for server pagination. */
  dataLength: number;
}

/** Default ascending comparator: numbers numerically, everything else with numeric-aware `localeCompare`. Nullish sorts last. */
export function compareValues(left: unknown, right: unknown): number {
  // TODO(engine): implement — see ADR data-table-data-mode.md
  void left;
  void right;
  return 0;
}

export function computeView<T extends SgdsDataTableRowData>(options: ComputeViewOptions<T>): SgdsDataTableView<T> {
  const filtered = options.serverFilter
    ? [...options.rows]
    : filterRows(options.rows, options.columns, options.globalFilter, options.columnFilters);
  const processedRows = options.serverSort ? filtered : sortRows(filtered, options.columns, options.sort);
  const pageRows = options.serverPaginate
    ? processedRows
    : paginateRows(processedRows, options.currentPage, options.itemsPerPage);
  const totalCount = options.serverPaginate ? options.dataLength || processedRows.length : processedRows.length;
  return { processedRows, pageRows, totalCount };
}

/** Applies the global filter (any column, case-insensitive substring) and per-column filters (AND). */
export function filterRows<T extends SgdsDataTableRowData>(
  rows: T[],
  columns: SgdsDataTableColumnDefinition<T>[],
  globalFilter: string,
  columnFilters: Record<string, string>
): T[] {
  // TODO(engine): implement — see ADR data-table-data-mode.md
  void columns;
  void globalFilter;
  void columnFilters;
  return [...rows];
}

/**
 * Pure, DOM-free data pipeline for `sgds-data-table` data mode:
 * filter -> sort -> paginate. Every function returns new arrays and never mutates its inputs.
 */
/** Raw value of `row` for `column`: `column.accessor(row)` when provided, else `row[column.key]`. */
export function getCellValue<T extends SgdsDataTableRowData>(
  row: T,
  column: SgdsDataTableColumnDefinition<T>
): unknown {
  return column.accessor ? column.accessor(row) : row[column.key];
}

/**
 * Next sort state after a header is activated.
 * Cycle per column: none -> ascending -> descending -> none.
 * When `additive` (Shift + activate) and `multiSort` are both true the column is added/cycled in place
 * while other entries are kept; otherwise the result contains at most this one column.
 */
export function nextSortState(
  sort: SgdsDataTableSortSpec[],
  key: string,
  multiSort: boolean,
  additive: boolean
): SgdsDataTableSortSpec[] {
  // TODO(engine): implement — see ADR data-table-data-mode.md
  void multiSort;
  void additive;
  const current = sort.find(s => s.key === key);
  if (!current) return [{ key, direction: "ascending" }];
  if (current.direction === "ascending") return [{ key, direction: "descending" }];
  return [];
}

/** Returns the slice for a 1-based `currentPage`. */
export function paginateRows<T>(rows: T[], currentPage: number, itemsPerPage: number): T[] {
  if (itemsPerPage <= 0) return [...rows];
  const start = (Math.max(1, currentPage) - 1) * itemsPerPage;
  return rows.slice(start, start + itemsPerPage);
}

/** Stable multi-column sort. `sort[0]` is the primary key; ties fall through to later entries, then original order. */
export function sortRows<T extends SgdsDataTableRowData>(
  rows: T[],
  columns: SgdsDataTableColumnDefinition<T>[],
  sort: SgdsDataTableSortSpec[]
): T[] {
  // TODO(engine): implement — see ADR data-table-data-mode.md
  void columns;
  void sort;
  return [...rows];
}
