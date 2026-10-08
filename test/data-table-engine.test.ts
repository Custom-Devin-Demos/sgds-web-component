import { expect } from "@open-wc/testing";
import {
  compareValues,
  computeView,
  filterRows,
  getCellValue,
  nextSortState,
  paginateRows,
  sortRows
} from "../src/components/DataTable/data-table-engine";
import type { SgdsDataTableColumnDefinition, SgdsDataTableRowData } from "../src/components/DataTable/types";

type Person = SgdsDataTableRowData & {
  id: number;
  name: string | null | undefined;
  age: number | null | undefined;
  team?: string;
  joined?: Date;
  active?: boolean;
};

const people: Person[] = [
  { id: 1, name: "Cara", age: 31, team: "Blue" },
  { id: 2, name: "amy", age: 28, team: "Red" },
  { id: 3, name: "Ben", age: 35, team: "Blue" },
  { id: 4, name: "Dan", age: 28, team: "Red" }
];

const cols: SgdsDataTableColumnDefinition<Person>[] = [
  { key: "name", header: "Name" },
  { key: "age", header: "Age" },
  { key: "team", header: "Team" }
];

const ids = (rows: Person[]) => rows.map(r => r.id);

describe("data-table-engine", () => {
  describe("compareValues", () => {
    it("compares numbers numerically", () => {
      expect(compareValues(2, 10)).to.be.lessThan(0);
      expect(compareValues(10, 2)).to.be.greaterThan(0);
      expect(compareValues(-1, -1)).to.equal(0);
    });

    it("compares Dates by time", () => {
      expect(compareValues(new Date(2020, 0, 1), new Date(2021, 0, 1))).to.be.lessThan(0);
      expect(compareValues(new Date(2022, 0, 1), new Date(2021, 0, 1))).to.be.greaterThan(0);
      expect(compareValues(new Date(2021, 0, 1), new Date(2021, 0, 1))).to.equal(0);
    });

    it("orders booleans false before true", () => {
      expect(compareValues(false, true)).to.be.lessThan(0);
      expect(compareValues(true, false)).to.be.greaterThan(0);
      expect(compareValues(true, true)).to.equal(0);
    });

    it("compares strings numeric-aware and case-insensitively", () => {
      expect(compareValues("item 2", "item 10")).to.be.lessThan(0);
      expect(compareValues("apple", "Apple")).to.equal(0);
      expect(compareValues("b", "A")).to.be.greaterThan(0);
    });

    it("compares mixed types as strings", () => {
      expect(compareValues(2, "10")).to.be.lessThan(0);
      expect(compareValues("x", 1)).to.be.greaterThan(0);
    });

    it("puts null, undefined and empty string last", () => {
      for (const empty of [null, undefined, ""]) {
        expect(compareValues(empty, 1)).to.equal(1);
        expect(compareValues("a", empty)).to.equal(-1);
      }
      expect(compareValues(null, undefined)).to.equal(0);
      expect(compareValues("", null)).to.equal(0);
    });
  });

  describe("getCellValue", () => {
    it("reads row[key] by default", () => {
      expect(getCellValue(people[0], cols[0])).to.equal("Cara");
    });

    it("uses the accessor when provided", () => {
      const column: SgdsDataTableColumnDefinition<Person> = {
        key: "label",
        header: "Label",
        accessor: row => `${row.name}-${row.age}`
      };
      expect(getCellValue(people[0], column)).to.equal("Cara-31");
    });
  });

  describe("sortRows", () => {
    it("returns a copy in original order when sort is empty", () => {
      const result = sortRows(people, cols, []);
      expect(result).to.not.equal(people);
      expect(ids(result)).to.deep.equal([1, 2, 3, 4]);
    });

    it("sorts ascending and descending by a single key", () => {
      expect(ids(sortRows(people, cols, [{ key: "name", direction: "ascending" }]))).to.deep.equal([2, 3, 1, 4]);
      expect(ids(sortRows(people, cols, [{ key: "name", direction: "descending" }]))).to.deep.equal([4, 1, 3, 2]);
    });

    it("sorts numbers numerically", () => {
      const rows: Person[] = [
        { id: 1, name: "a", age: 100 },
        { id: 2, name: "b", age: 9 },
        { id: 3, name: "c", age: 20 }
      ];
      expect(ids(sortRows(rows, cols, [{ key: "age", direction: "ascending" }]))).to.deep.equal([2, 3, 1]);
    });

    it("sorts Dates and booleans", () => {
      const rows: Person[] = [
        { id: 1, name: "a", age: 1, joined: new Date(2022, 0, 1), active: true },
        { id: 2, name: "b", age: 1, joined: new Date(2020, 0, 1), active: false },
        { id: 3, name: "c", age: 1, joined: new Date(2021, 0, 1), active: true }
      ];
      const columns: SgdsDataTableColumnDefinition<Person>[] = [
        { key: "joined", header: "Joined" },
        { key: "active", header: "Active" }
      ];
      expect(ids(sortRows(rows, columns, [{ key: "joined", direction: "ascending" }]))).to.deep.equal([2, 3, 1]);
      expect(ids(sortRows(rows, columns, [{ key: "active", direction: "ascending" }]))).to.deep.equal([2, 1, 3]);
      expect(ids(sortRows(rows, columns, [{ key: "active", direction: "descending" }]))).to.deep.equal([1, 3, 2]);
    });

    it("is stable for equal keys in both directions", () => {
      const rows: Person[] = Array.from({ length: 20 }, (_, i) => ({ id: i, name: "same", age: i % 2 }));
      const asc = sortRows(rows, cols, [{ key: "age", direction: "ascending" }]);
      expect(ids(asc)).to.deep.equal([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
      const desc = sortRows(rows, cols, [{ key: "age", direction: "descending" }]);
      expect(ids(desc)).to.deep.equal([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
    });

    it("breaks ties with later sort keys in order", () => {
      const byAgeThenName = sortRows(people, cols, [
        { key: "age", direction: "ascending" },
        { key: "name", direction: "descending" }
      ]);
      expect(ids(byAgeThenName)).to.deep.equal([4, 2, 1, 3]);
      const byTeamThenAge = sortRows(people, cols, [
        { key: "team", direction: "ascending" },
        { key: "age", direction: "descending" }
      ]);
      expect(ids(byTeamThenAge)).to.deep.equal([3, 1, 2, 4]);
    });

    it("falls back to original order when every key ties", () => {
      const result = sortRows(people, cols, [
        { key: "team", direction: "ascending" },
        { key: "team", direction: "descending" }
      ]);
      expect(ids(result)).to.deep.equal([1, 3, 2, 4]);
    });

    it("puts null, undefined and empty strings last in both directions", () => {
      const rows: Person[] = [
        { id: 1, name: null, age: null },
        { id: 2, name: "b", age: 2 },
        { id: 3, name: "", age: undefined },
        { id: 4, name: "a", age: 1 },
        { id: 5, name: undefined, age: 3 }
      ];
      expect(ids(sortRows(rows, cols, [{ key: "name", direction: "ascending" }]))).to.deep.equal([4, 2, 1, 3, 5]);
      expect(ids(sortRows(rows, cols, [{ key: "name", direction: "descending" }]))).to.deep.equal([2, 4, 1, 3, 5]);
      expect(ids(sortRows(rows, cols, [{ key: "age", direction: "ascending" }]))).to.deep.equal([4, 2, 5, 1, 3]);
      expect(ids(sortRows(rows, cols, [{ key: "age", direction: "descending" }]))).to.deep.equal([5, 2, 4, 1, 3]);
    });

    it("uses the accessor for sorting", () => {
      const columns: SgdsDataTableColumnDefinition<Person>[] = [
        { key: "nameLength", header: "Len", accessor: row => (row.name ?? "").length }
      ];
      expect(ids(sortRows(people, columns, [{ key: "nameLength", direction: "ascending" }]))).to.deep.equal([
        2, 3, 4, 1
      ]);
    });

    it("uses sortFn and negates it for descending", () => {
      const byLastLetter = (a: Person, b: Person) => String(a.name).slice(-1).localeCompare(String(b.name).slice(-1));
      const columns: SgdsDataTableColumnDefinition<Person>[] = [{ key: "name", header: "Name", sortFn: byLastLetter }];
      // last letters: Cara=a, amy=y, Ben=n, Dan=n
      expect(ids(sortRows(people, columns, [{ key: "name", direction: "ascending" }]))).to.deep.equal([1, 3, 4, 2]);
      expect(ids(sortRows(people, columns, [{ key: "name", direction: "descending" }]))).to.deep.equal([2, 3, 4, 1]);
    });

    it("uses sortFn even when the column key is not a field on the row", () => {
      const columns: SgdsDataTableColumnDefinition<Person>[] = [
        { key: "virtual", header: "Virtual", sortFn: (a, b) => b.id - a.id }
      ];
      expect(ids(sortRows(people, columns, [{ key: "virtual", direction: "ascending" }]))).to.deep.equal([4, 3, 2, 1]);
    });

    it("ignores unknown sort keys", () => {
      const result = sortRows(people, cols, [
        { key: "missing", direction: "descending" },
        { key: "age", direction: "ascending" }
      ]);
      expect(ids(result)).to.deep.equal([2, 4, 1, 3]);
      expect(ids(sortRows(people, cols, [{ key: "missing", direction: "ascending" }]))).to.deep.equal([1, 2, 3, 4]);
    });

    it("does not mutate its inputs", () => {
      const copy = [...people];
      sortRows(people, cols, [{ key: "name", direction: "ascending" }]);
      expect(people).to.deep.equal(copy);
    });
  });

  describe("filterRows", () => {
    it("returns a copy of all rows when there are no filters", () => {
      const result = filterRows(people, cols, "", {});
      expect(result).to.not.equal(people);
      expect(ids(result)).to.deep.equal([1, 2, 3, 4]);
      expect(ids(filterRows(people, cols, "   ", { name: "  " }))).to.deep.equal([1, 2, 3, 4]);
    });

    it("matches the global filter against any column, case-insensitively and trimmed", () => {
      expect(ids(filterRows(people, cols, "  AM ", {}))).to.deep.equal([2]);
      expect(ids(filterRows(people, cols, "blue", {}))).to.deep.equal([1, 3]);
      expect(ids(filterRows(people, cols, "28", {}))).to.deep.equal([2, 4]);
      expect(ids(filterRows(people, cols, "zzz", {}))).to.deep.equal([]);
    });

    it("only searches defined columns", () => {
      expect(ids(filterRows(people, [cols[0]], "blue", {}))).to.deep.equal([]);
    });

    it("requires every column filter to match", () => {
      expect(ids(filterRows(people, cols, "", { team: "red" }))).to.deep.equal([2, 4]);
      expect(ids(filterRows(people, cols, "", { team: "red", age: "28", name: "D" }))).to.deep.equal([4]);
      expect(ids(filterRows(people, cols, "", { team: "red", name: "ben" }))).to.deep.equal([]);
    });

    it("ANDs the global filter with column filters", () => {
      expect(ids(filterRows(people, cols, "a", { team: "blue" }))).to.deep.equal([1]);
    });

    it("ignores column filters for unknown keys", () => {
      expect(ids(filterRows(people, cols, "", { missing: "x" }))).to.deep.equal([1, 2, 3, 4]);
    });

    it("treats null and undefined values as empty strings", () => {
      const rows: Person[] = [
        { id: 1, name: null, age: undefined },
        { id: 2, name: "null", age: 1 }
      ];
      expect(ids(filterRows(rows, cols, "null", {}))).to.deep.equal([2]);
      expect(ids(filterRows(rows, cols, "undefined", {}))).to.deep.equal([]);
    });

    it("uses the accessor value", () => {
      const columns: SgdsDataTableColumnDefinition<Person>[] = [
        { key: "label", header: "Label", accessor: row => `${row.name} (${row.team})` }
      ];
      expect(ids(filterRows(people, columns, "(red)", {}))).to.deep.equal([2, 4]);
      expect(ids(filterRows(people, columns, "", { label: "ben (" }))).to.deep.equal([3]);
    });

    it("uses filterFn with (value, trimmed query, row)", () => {
      const calls: unknown[][] = [];
      const columns: SgdsDataTableColumnDefinition<Person>[] = [
        {
          key: "age",
          header: "Age",
          filterFn: (value, query, row) => {
            calls.push([value, query, row]);
            return Number(value) >= Number(query);
          }
        }
      ];
      expect(ids(filterRows(people, columns, "", { age: " 31 " }))).to.deep.equal([1, 3]);
      expect(calls[0]).to.deep.equal([31, "31", people[0]]);
      expect(ids(filterRows(people, columns, "30", {}))).to.deep.equal([1, 3]);
    });

    it("does not mutate its inputs", () => {
      const filters = { team: "red" };
      filterRows(people, cols, "a", filters);
      expect(filters).to.deep.equal({ team: "red" });
      expect(people.length).to.equal(4);
    });
  });

  describe("nextSortState", () => {
    it("cycles a single column none -> ascending -> descending -> none", () => {
      let sort = nextSortState([], "name", false, false);
      expect(sort).to.deep.equal([{ key: "name", direction: "ascending" }]);
      sort = nextSortState(sort, "name", false, false);
      expect(sort).to.deep.equal([{ key: "name", direction: "descending" }]);
      sort = nextSortState(sort, "name", false, false);
      expect(sort).to.deep.equal([]);
    });

    it("replaces the whole state when not additive", () => {
      const sort = [
        { key: "name", direction: "ascending" as const },
        { key: "age", direction: "descending" as const }
      ];
      expect(nextSortState(sort, "team", true, false)).to.deep.equal([{ key: "team", direction: "ascending" }]);
      expect(nextSortState(sort, "name", true, false)).to.deep.equal([{ key: "name", direction: "descending" }]);
      expect(nextSortState(sort, "age", true, false)).to.deep.equal([]);
    });

    it("replaces the whole state when multiSort is off even if additive", () => {
      const sort = [{ key: "name", direction: "ascending" as const }];
      expect(nextSortState(sort, "age", false, true)).to.deep.equal([{ key: "age", direction: "ascending" }]);
    });

    it("appends, cycles in place and removes columns when additive with multiSort", () => {
      let sort = nextSortState([], "name", true, true);
      sort = nextSortState(sort, "age", true, true);
      sort = nextSortState(sort, "team", true, true);
      expect(sort).to.deep.equal([
        { key: "name", direction: "ascending" },
        { key: "age", direction: "ascending" },
        { key: "team", direction: "ascending" }
      ]);
      sort = nextSortState(sort, "age", true, true);
      expect(sort).to.deep.equal([
        { key: "name", direction: "ascending" },
        { key: "age", direction: "descending" },
        { key: "team", direction: "ascending" }
      ]);
      sort = nextSortState(sort, "age", true, true);
      expect(sort).to.deep.equal([
        { key: "name", direction: "ascending" },
        { key: "team", direction: "ascending" }
      ]);
      sort = nextSortState(sort, "age", true, true);
      expect(sort[2]).to.deep.equal({ key: "age", direction: "ascending" });
    });

    it("does not mutate the previous state", () => {
      const sort = [{ key: "name", direction: "ascending" as const }];
      const next = nextSortState(sort, "name", true, true);
      expect(sort).to.deep.equal([{ key: "name", direction: "ascending" }]);
      expect(next).to.not.equal(sort);
      expect(next[0]).to.not.equal(sort[0]);
    });
  });

  describe("paginateRows", () => {
    const items = [1, 2, 3, 4, 5, 6, 7];

    it("returns the slice for a 1-based page", () => {
      expect(paginateRows(items, 1, 3)).to.deep.equal([1, 2, 3]);
      expect(paginateRows(items, 2, 3)).to.deep.equal([4, 5, 6]);
      expect(paginateRows(items, 3, 3)).to.deep.equal([7]);
    });

    it("returns an empty slice past the last page", () => {
      expect(paginateRows(items, 4, 3)).to.deep.equal([]);
      expect(paginateRows([], 1, 3)).to.deep.equal([]);
    });

    it("treats pages below 1 or non-finite as page 1", () => {
      expect(paginateRows(items, 0, 3)).to.deep.equal([1, 2, 3]);
      expect(paginateRows(items, -2, 3)).to.deep.equal([1, 2, 3]);
      expect(paginateRows(items, NaN, 3)).to.deep.equal([1, 2, 3]);
    });

    it("returns every row when itemsPerPage is not positive or not finite", () => {
      expect(paginateRows(items, 2, 0)).to.deep.equal(items);
      expect(paginateRows(items, 2, -1)).to.deep.equal(items);
      expect(paginateRows(items, 2, NaN)).to.deep.equal(items);
      expect(paginateRows(items, 1, Infinity)).to.deep.equal(items);
    });

    it("floors fractional inputs", () => {
      expect(paginateRows(items, 2.7, 3.9)).to.deep.equal([4, 5, 6]);
    });

    it("returns a new array", () => {
      expect(paginateRows(items, 1, 0)).to.not.equal(items);
    });
  });

  describe("computeView", () => {
    const base = {
      rows: people,
      columns: cols,
      sort: [{ key: "age", direction: "descending" as const }],
      globalFilter: "",
      columnFilters: { team: "red" },
      currentPage: 1,
      itemsPerPage: 1,
      serverPaginate: false,
      serverSort: false,
      serverFilter: false,
      dataLength: 0
    };

    it("filters, sorts and paginates on the client", () => {
      const view = computeView(base);
      expect(ids(view.processedRows)).to.deep.equal([2, 4]);
      expect(ids(view.pageRows)).to.deep.equal([2]);
      expect(view.totalCount).to.equal(2);
      expect(ids(computeView({ ...base, currentPage: 2 }).pageRows)).to.deep.equal([4]);
    });

    it("skips local filtering, sorting and pagination when server-side", () => {
      const view = computeView({ ...base, serverFilter: true, serverSort: true, serverPaginate: true, dataLength: 40 });
      expect(ids(view.processedRows)).to.deep.equal([1, 2, 3, 4]);
      expect(ids(view.pageRows)).to.deep.equal([1, 2, 3, 4]);
      expect(view.totalCount).to.equal(40);
    });

    it("falls back to the row count when dataLength is not set in server pagination", () => {
      expect(computeView({ ...base, serverPaginate: true }).totalCount).to.equal(2);
    });
  });
});
