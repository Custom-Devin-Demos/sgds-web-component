# DataTable data mode (columns + rows) alongside slotted mode

## Status

Accepted

## Context

`sgds-data-table` shipped with a slotted API: consumers compose `sgds-data-table-row`, `sgds-data-table-head`
and `sgds-data-table-cell` children. Each row renders its own `<tr>` inside its own shadow root, so the rows of a
table do not share one accessibility tree, and ARIA grid semantics plus cell-to-cell keyboard navigation cannot be
built across those shadow boundaries. Product teams also asked for property-driven data, client-side filtering,
multi-column sorting, density, a sticky header and full keyboard support.

Replacing the slotted API would break a published 3.x component.

## Decision

Add a **data mode** to the existing `sgds-data-table`. The slotted mode stays as it is.

- Data mode is on when `columns` is non-empty or at least one `sgds-data-table-column` child exists
  (`isDataMode`). The `columns` property wins over the children.
- In data mode, `sgds-data-table` renders one native `<table role="grid">` inside its own shadow root. Rows come
  from the `rows` property, and `rowKey` (default `"id"`) gives each row its identity.
- Data pipeline (`data-table-engine.ts`, pure functions): `filterRows` → `sortRows` → `paginateRows`, composed by
  `computeView` in `willUpdate`. `mode="server"` turns off local pagination, `serverSort` turns off local sorting
  and `serverFilter` turns off local filtering. Events still fire in all three cases.
- Keyboard (`data-table-keyboard.ts`): a roving-tabindex `DataTableKeyboardController`, following the WAI-ARIA APG
  Data Grid pattern.

### Public API (data mode)

| Property | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `SgdsDataTableColumnDefinition[]` | `[]` | `key`, `header`, `sortable`, `filterable`, `align`, `width`, `accessor`, `render`, `sortFn`, `filterFn` |
| `rows` | `Record<string, unknown>[]` | `[]` | |
| `rowKey` | `string` | `"id"` | |
| `sort` | `SgdsDataTableSortSpec[]` | `[]` | `[{ key, direction }]`; index 0 is primary |
| `multiSort` | `boolean` | `false` | Shift + activate adds/cycles a column |
| `globalFilter` | `string` | `""` | case-insensitive substring across all columns |
| `columnFilters` | `Record<string, string>` | `{}` | AND-ed with each other and with `globalFilter` |
| `showGlobalFilter` | `boolean` | `false` | renders an `sgds-input` search box in the toolbar |
| `serverFilter` | `boolean` | `false` | |
| `multiSelect` | `boolean` | `false` | existing prop, reused; adds checkbox column |
| `selectedKeys` | `(string \| number)[]` | `[]` | |
| `density` | `"comfortable" \| "dense"` | `"comfortable"` | reflected |
| `stickyHeader` | `boolean` | `false` | reflected; pair with `--sgds-data-table-max-height` |
| `label` | `string` | `""` | `aria-label` of the grid |
| `loading`, `currentPage`, `itemsPerPage`, `dataLength`, `mode`, `serverSort`, `paginationVariant`, `paginationSummary`, `layout` | | | existing, same meaning |

The `sgds-data-table-column` element exposes `key`, `header`, `sortable`, `filterable`, `align` and `width`.
Public members: `isDataMode`, `selectedRows` (getter) and `clearSelection()`.

### Events

| Event | Detail | When |
| --- | --- | --- |
| `sgds-sort` | `{ key, direction: "ascending" \| "descending" \| "none", sort: SgdsDataTableSortSpec[] }` | Data mode: every sort change. Slotted mode: unchanged (only with `serverSort`, no `sort` field). |
| `sgds-filter` | `{ globalFilter, columnFilters, filteredCount }` | global or column filter input changes; `currentPage` resets to 1 |
| `sgds-page-change` | `{ currentPage, itemsPerPage }` | both modes; the inner `sgds-pagination` event is stopped so consumers get exactly one event |
| `sgds-selection-change` | `{ selectedKeys, selectedRows }` | both modes (slotted mode: keys are row indices) |
| `sgds-row-select` | `{ selected }` | **deprecated**, slotted mode only, still emitted |

### Sorting

- Each column cycles none → ascending → descending → none.
- Without Shift, or with `multiSort=false`, activating a column replaces the whole sort state.
- With Shift and `multiSort`, the column is added at the end of the sort state, or cycled where it already sits.
  When a column cycles back to none it is removed.
- Sorting is stable. Ties fall through to the next sort key, then to the original order.
- The default comparator sorts numbers numerically and everything else with `localeCompare(…, { numeric: true, sensitivity: "base" })`.
  `null`, `undefined` and `""` always go last, whatever the direction.
- Header ARIA:
  - The primary sorted column gets `aria-sort="ascending|descending"`. APG says only one header should carry `aria-sort`.
  - Other sorted columns get visually hidden text such as "sorted descending, priority 2".
  - Sortable columns that aren't sorted get no `aria-sort`.

### Selection

- Selection is keyed by `row[rowKey]`, so it survives sorting, filtering and paging.
- The header checkbox works on the **current page**:
  - checked when every page row is selected;
  - `indeterminate` when only some are selected;
  - activating it selects all page rows, or deselects them if they were all selected.
- Selected `<tr>` elements get `aria-selected="true"`. The grid gets `aria-multiselectable="true"` when `multiSelect` is on.

### Grid structure and ARIA

- Elements: `<table role="grid" aria-label aria-rowcount aria-colcount>` containing `<thead>` and `<tbody>`.
  - Header cells are `th scope="col"`. Body cells are `td role="gridcell"`.
  - Each `tr` gets `aria-rowindex`, 1-based and counting header rows. In client mode it also accounts for the page offset.
- When `filterable` columns exist, a second header row (`part="filter-row"`) holds one `sgds-input` per filterable
  column. Each input gets an `aria-label` of the form "Filter {header}".
- Empty state: one full-width row containing the `no-data` slot (default text "No data").
- Loading state: skeleton rows, with `aria-busy="true"` on the grid.
- A visually hidden `role="status"` live region announces "{n} results" after a filter, sort or page change.
- A checkbox cell contains one `sgds-checkbox`. Its `aria-label` is "Select all rows" in the header and
  "Select row {n}" in the body.

### Keyboard (roving tabindex, one tab stop for the grid)

- Navigable cells carry `data-row` and `data-col`, which are 0-based coordinates across thead and tbody.
- Focus model:
  - Exactly one target in the grid has `tabindex="0"`.
  - The target is the cell itself, except when the cell holds a filter input. Then the input is the target.
  - Every other cell, and the checkbox inside a checkbox cell, gets `tabindex="-1"`.
- Navigation keys:
  - Arrow keys move between cells.
  - Home and End go to the first and last cell of the current row. Ctrl+Home and Ctrl+End go to the first and last cell of the grid.
  - PageUp and PageDown go to the previous and next page in client pagination.
  - Inside a filter input, Left, Right, Home and End edit the text, while Up and Down leave the input and move between rows.
- Activation keys:
  - On a sortable header, Enter or Space sorts. Adding Shift makes it an additive multi-sort.
  - On a checkbox cell, Enter or Space toggles the selection. On the header checkbox cell it toggles select-all.
- Focus memory: the roving position is remembered. After a re-render (sort, page change), focus moves to the
  nearest valid cell.

### Styling

- Only SGDS semantic tokens are used, so day, night and brand themes work without changes.
- Component custom properties are declared on `:host`, documented with `@cssproperty`, and default to tokens:
  - `--sgds-data-table-max-height` (`none`)
  - `--sgds-data-table-header-bg` (`var(--sgds-surface-default)`)
  - `--sgds-data-table-border-color` (`var(--sgds-border-color-muted)`)
  - `--sgds-data-table-row-hover-bg` (`var(--sgds-bg-translucent-subtle)`)
  - `--sgds-data-table-row-selected-bg` (`var(--sgds-primary-surface-translucent)`)
  - `--sgds-data-table-cell-padding-block` and `--sgds-data-table-cell-padding-inline`, with different defaults per density
  - `--sgds-data-table-cell-min-height` (`--sgds-dimension-56` comfortable, `--sgds-dimension-40` dense)
- CSS parts, documented with `@csspart`:
  - layout: `base`, `toolbar`, `global-filter`, `table-container`, `table`
  - header: `header-row`, `header-cell`, `sort-indicator`, `filter-row`, `filter-input`
  - body: `row`, `cell`, `checkbox-cell`
  - states and footer: `empty`, `loading`, `footer`, `pagination-summary`, `pagination`
- Sticky header: `thead th { position: sticky; top: 0 }`, with the scroll container set to
  `max-height: var(--sgds-data-table-max-height)`.
- Responsive overflow: the table container scrolls horizontally.

## Consequences

- Existing slotted-mode consumers are unaffected. The new events add to the old ones, and `sgds-row-select` is still emitted.
- Behaviour that is new in this work lands in data mode: grid semantics, keyboard navigation, filtering,
  multi-sort, density and sticky header.
- The React wrapper is generated by `scripts/makeReact.mjs` from the JSDoc `@event` tags. It exposes
  `onSgdsSort`, `onSgdsFilter`, `onSgdsPageChange` and `onSgdsSelectionChange` without any hand-written code.

## Date of proposal

08/10/2026
