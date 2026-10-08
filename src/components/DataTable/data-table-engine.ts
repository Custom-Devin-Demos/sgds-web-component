/**
 * Pure, DOM-free data pipeline for `sgds-data-table` data mode:
 * filter -> sort -> paginate. Every function returns new arrays and never mutates its inputs.
 */
import type {
  SgdsDataTableColumnDefinition,
  SgdsDataTableRowData,
  SgdsDataTableSortDirection,
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

/** `null`, `undefined`, `""`, `NaN` and invalid dates have no sortable value and always sort last. */
function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (typeof value === "number") return Number.isNaN(value);
  if (value instanceof Date) return Number.isNaN(value.getTime());
  return false;
}

function sign(value: number): number {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

/**
 * Default ascending comparator: numbers numerically, Dates by time, booleans false before true,
 * everything else with numeric-aware, case-insensitive `localeCompare`. Empty values sort last.
 */
export function compareValues(left: unknown, right: unknown): number {
  const leftEmpty = isEmptyValue(left);
  const rightEmpty = isEmptyValue(right);
  if (leftEmpty || rightEmpty) return leftEmpty === rightEmpty ? 0 : leftEmpty ? 1 : -1;
  if (typeof left === "number" && typeof right === "number") return sign(left - right);
  if (left instanceof Date && right instanceof Date) return sign(left.getTime() - right.getTime());
  if (typeof left === "boolean" && typeof right === "boolean") return Number(left) - Number(right);
  return sign(String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" }));
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

function matchesQuery<T extends SgdsDataTableRowData>(
  row: T,
  column: SgdsDataTableColumnDefinition<T>,
  query: string
): boolean {
  const value = getCellValue(row, column);
  if (column.filterFn) return column.filterFn(value, query, row);
  return String(value ?? "")
    .toLowerCase()
    .includes(query.toLowerCase());
}

/**
 * Applies the global filter (matches when ANY column matches) and per-column filters (ALL must match).
 * Queries are trimmed; the default match is a case-insensitive substring of `String(value)`.
 * `column.filterFn(value, trimmedQuery, row)` replaces the default match. Unknown column keys are ignored.
 */
export function filterRows<T extends SgdsDataTableRowData>(
  rows: T[],
  columns: SgdsDataTableColumnDefinition<T>[],
  globalFilter: string,
  columnFilters: Record<string, string>
): T[] {
  const globalQuery = (globalFilter ?? "").trim();
  const columnQueries = Object.entries(columnFilters ?? {}).reduce<
    { column: SgdsDataTableColumnDefinition<T>; query: string }[]
  >((acc, [key, value]) => {
    const query = String(value ?? "").trim();
    const column = columns.find(c => c.key === key);
    if (query && column) acc.push({ column, query });
    return acc;
  }, []);
  if (!globalQuery && columnQueries.length === 0) return [...rows];

  return rows.filter(row => {
    if (globalQuery && !columns.some(column => matchesQuery(row, column, globalQuery))) return false;
    return columnQueries.every(({ column, query }) => matchesQuery(row, column, query));
  });
}

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
  const index = sort.findIndex(spec => spec.key === key);
  const current = index >= 0 ? sort[index].direction : "none";
  const next: SgdsDataTableSortDirection | "none" =
    current === "none" ? "ascending" : current === "ascending" ? "descending" : "none";

  if (!multiSort || !additive) return next === "none" ? [] : [{ key, direction: next }];
  if (index < 0) return [...sort.map(spec => ({ ...spec })), { key, direction: next as SgdsDataTableSortDirection }];
  if (next === "none") return sort.filter((_, i) => i !== index).map(spec => ({ ...spec }));
  return sort.map((spec, i) => (i === index ? { key, direction: next } : { ...spec }));
}

/** Returns the slice for a 1-based `currentPage`. A non-positive or non-finite `itemsPerPage` returns every row. */
export function paginateRows<T>(rows: T[], currentPage: number, itemsPerPage: number): T[] {
  if (!Number.isFinite(itemsPerPage) || itemsPerPage <= 0) return [...rows];
  const size = Math.floor(itemsPerPage) || 1;
  const page = Number.isFinite(currentPage) ? Math.max(1, Math.floor(currentPage)) : 1;
  const start = (page - 1) * size;
  return rows.slice(start, start + size);
}

/**
 * Stable multi-column sort. `sort[0]` is the primary key; ties fall through to later entries, then original order.
 * Uses `column.sortFn` (negated for descending) when provided. Rows whose cell value is empty (`null`, `undefined`,
 * `""`) sort after rows with a value in both directions; `sortFn` still orders rows that are both empty.
 * Sort entries for unknown columns are ignored.
 */
export function sortRows<T extends SgdsDataTableRowData>(
  rows: T[],
  columns: SgdsDataTableColumnDefinition<T>[],
  sort: SgdsDataTableSortSpec[]
): T[] {
  const comparators = (sort ?? []).reduce<((a: T, b: T) => number)[]>((acc, spec) => {
    const column = columns.find(c => c.key === spec.key);
    if (!column) return acc;
    const factor = spec.direction === "descending" ? -1 : 1;
    const sortFn = column.sortFn;
    acc.push((a, b) => {
      const left = getCellValue(a, column);
      const right = getCellValue(b, column);
      const leftEmpty = isEmptyValue(left);
      const rightEmpty = isEmptyValue(right);
      if (leftEmpty !== rightEmpty) return leftEmpty ? 1 : -1;
      if (sortFn) return factor * sign(sortFn(a, b));
      return leftEmpty ? 0 : factor * compareValues(left, right);
    });
    return acc;
  }, []);
  if (comparators.length === 0) return [...rows];

  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      for (const compare of comparators) {
        const result = compare(a.row, b.row);
        if (result !== 0) return result;
      }
      return a.index - b.index;
    })
    .map(entry => entry.row);
}
