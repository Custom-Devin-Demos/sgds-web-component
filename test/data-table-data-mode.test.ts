import { html } from "lit";
import { elementUpdated, expect, fixture, oneEvent } from "@open-wc/testing";
import { SgdsDataTable } from "../src/components";
import "./sgds-web-component";

const columns = [
  { key: "name", header: "Name" },
  { key: "age", header: "Age", align: "right" as const }
];
const rows = [
  { id: 1, name: "Amy", age: 28 },
  { id: 2, name: "Ben", age: 35 },
  { id: 3, name: "Cara", age: 31 }
];

describe("<sgds-data-table> data mode contract", () => {
  it("enters data mode from the columns property and renders a grid", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${columns} .rows=${rows}></sgds-data-table>`
    );
    expect(el.isDataMode).to.be.true;
    const grid = el.shadowRoot?.querySelector("[role='grid']");
    expect(grid).to.exist;
    expect(grid?.getAttribute("aria-label")).to.equal("People");
    expect(el.shadowRoot?.querySelectorAll("thead th").length).to.equal(2);
    expect(el.shadowRoot?.querySelectorAll("tbody tr").length).to.equal(3);
  });

  it("enters data mode from sgds-data-table-column children", async () => {
    const el = await fixture<SgdsDataTable>(html`
      <sgds-data-table label="People" .rows=${rows}>
        <sgds-data-table-column key="name" header="Name"></sgds-data-table-column>
      </sgds-data-table>
    `);
    await elementUpdated(el);
    expect(el.isDataMode).to.be.true;
    const headers = el.shadowRoot?.querySelectorAll("thead th") ?? [];
    expect(headers.length).to.equal(1);
    expect(headers[0].textContent?.trim()).to.equal("Name");
  });

  it("re-renders when a column child changes", async () => {
    const el = await fixture<SgdsDataTable>(html`
      <sgds-data-table label="People" .rows=${rows}>
        <sgds-data-table-column key="name" header="Name"></sgds-data-table-column>
      </sgds-data-table>
    `);
    await elementUpdated(el);
    const column = el.querySelector("sgds-data-table-column");
    column?.setAttribute("header", "Full name");
    await elementUpdated(column as HTMLElement);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector("thead th")?.textContent?.trim()).to.equal("Full name");
  });

  it("prefers the columns property over column children", async () => {
    const el = await fixture<SgdsDataTable>(html`
      <sgds-data-table label="People" .columns=${columns} .rows=${rows}>
        <sgds-data-table-column key="id" header="ID"></sgds-data-table-column>
      </sgds-data-table>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll("thead th").length).to.equal(2);
  });

  it("paginates rows on the client", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${columns} .rows=${rows} itemsPerPage="2"></sgds-data-table>`
    );
    expect(el.shadowRoot?.querySelectorAll("tbody tr").length).to.equal(2);
    el.currentPage = 2;
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll("tbody tr").length).to.equal(1);
  });

  it("exposes selectedRows from selectedKeys", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${columns} .rows=${rows} .selectedKeys=${[2]}></sgds-data-table>`
    );
    expect(el.selectedRows).to.deep.equal([rows[1]]);
  });

  it("stays in slotted mode without columns", async () => {
    const el = await fixture<SgdsDataTable>(html`
      <sgds-data-table>
        <sgds-data-table-row><sgds-data-table-head>Name</sgds-data-table-head></sgds-data-table-row>
        <sgds-data-table-row><sgds-data-table-cell>Amy</sgds-data-table-cell></sgds-data-table-row>
      </sgds-data-table>
    `);
    await elementUpdated(el);
    expect(el.isDataMode).to.be.false;
    expect(el.shadowRoot?.querySelector("[role='table']")).to.exist;
  });

  it("slotted mode emits a single sgds-page-change with detail", async () => {
    const el = await fixture<SgdsDataTable>(html`
      <sgds-data-table itemsPerPage="1">
        <sgds-data-table-row><sgds-data-table-head>Name</sgds-data-table-head></sgds-data-table-row>
        <sgds-data-table-row><sgds-data-table-cell>Amy</sgds-data-table-cell></sgds-data-table-row>
        <sgds-data-table-row><sgds-data-table-cell>Ben</sgds-data-table-cell></sgds-data-table-row>
      </sgds-data-table>
    `);
    await elementUpdated(el);
    let count = 0;
    el.addEventListener("sgds-page-change", () => count++);
    const pagination = el.shadowRoot?.querySelector("sgds-pagination") as HTMLElement & {
      currentPage: number;
    };
    const listener = oneEvent(el, "sgds-page-change");
    pagination.dispatchEvent(
      new CustomEvent("sgds-page-change", { detail: { currentPage: 2 }, bubbles: true, composed: true })
    );
    const event = await listener;
    expect(event.detail).to.deep.equal({ currentPage: 2, itemsPerPage: 1 });
    expect(count).to.equal(1);
  });
});

describe("<sgds-data-table> data mode state transitions", () => {
  const sortableColumns = [
    { key: "name", header: "Name", sortable: true, filterable: true },
    { key: "age", header: "Age", sortable: true },
    { key: "id", header: "ID" }
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setup = async (template = html``): Promise<SgdsDataTable & Record<string, any>> => {
    const el = await fixture<SgdsDataTable>(template);
    await elementUpdated(el);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return el as SgdsDataTable & Record<string, any>;
  };

  const collect = (el: HTMLElement, name: string) => {
    const events: CustomEvent[] = [];
    el.addEventListener(name, e => events.push(e as CustomEvent));
    return events;
  };

  describe("sorting", () => {
    it("cycles a sortable column and emits sgds-sort", async () => {
      const el = await setup(
        html`<sgds-data-table label="People" .columns=${sortableColumns} .rows=${rows}></sgds-data-table>`
      );
      const events = collect(el, "sgds-sort");

      el._onHeaderActivate("age", false);
      expect(el.sort).to.deep.equal([{ key: "age", direction: "ascending" }]);
      el._onHeaderActivate("age", false);
      expect(el.sort).to.deep.equal([{ key: "age", direction: "descending" }]);
      el._onHeaderActivate("age", false);
      expect(el.sort).to.deep.equal([]);

      expect(events.map(e => e.detail)).to.deep.equal([
        { key: "age", direction: "ascending", sort: [{ key: "age", direction: "ascending" }] },
        { key: "age", direction: "descending", sort: [{ key: "age", direction: "descending" }] },
        { key: "age", direction: "none", sort: [] }
      ]);
    });

    it("re-sorts the rendered rows", async () => {
      const el = await setup(
        html`<sgds-data-table label="People" .columns=${sortableColumns} .rows=${rows}></sgds-data-table>`
      );
      el._onHeaderActivate("age", false);
      el._onHeaderActivate("age", false);
      await elementUpdated(el);
      const firstCells = Array.from(el.shadowRoot?.querySelectorAll("tbody tr") ?? []).map(tr =>
        tr.querySelector("td")?.textContent?.trim()
      );
      expect(firstCells).to.deep.equal(["Ben", "Cara", "Amy"]);
    });

    it("ignores non-sortable and unknown columns", async () => {
      const el = await setup(
        html`<sgds-data-table label="People" .columns=${sortableColumns} .rows=${rows}></sgds-data-table>`
      );
      const events = collect(el, "sgds-sort");
      el._onHeaderActivate("id", false);
      el._onHeaderActivate("missing", false);
      expect(el.sort).to.deep.equal([]);
      expect(events.length).to.equal(0);
    });

    it("adds columns with additive activation when multiSort is on", async () => {
      const el = await setup(
        html`<sgds-data-table label="People" multiSort .columns=${sortableColumns} .rows=${rows}></sgds-data-table>`
      );
      const events = collect(el, "sgds-sort");
      el._onHeaderActivate("name", false);
      el._onHeaderActivate("age", true);
      expect(el.sort).to.deep.equal([
        { key: "name", direction: "ascending" },
        { key: "age", direction: "ascending" }
      ]);
      el._onHeaderActivate("name", true);
      expect(events[2].detail).to.deep.equal({
        key: "name",
        direction: "descending",
        sort: [
          { key: "name", direction: "descending" },
          { key: "age", direction: "ascending" }
        ]
      });
      el._onHeaderActivate("age", false);
      expect(el.sort).to.deep.equal([{ key: "age", direction: "descending" }]);
    });

    it("replaces the sort on additive activation when multiSort is off", async () => {
      const el = await setup(
        html`<sgds-data-table label="People" .columns=${sortableColumns} .rows=${rows}></sgds-data-table>`
      );
      el._onHeaderActivate("name", false);
      el._onHeaderActivate("age", true);
      expect(el.sort).to.deep.equal([{ key: "age", direction: "ascending" }]);
    });
  });

  describe("filtering", () => {
    it("updates globalFilter, resets the page and emits sgds-filter", async () => {
      const el = await setup(
        html`<sgds-data-table
          label="People"
          .columns=${sortableColumns}
          .rows=${rows}
          itemsPerPage="2"
          currentPage="2"
        ></sgds-data-table>`
      );
      expect(el.currentPage).to.equal(2);
      const listener = oneEvent(el, "sgds-filter");
      el._onGlobalFilterInput("a");
      const event = await listener;
      expect(el.globalFilter).to.equal("a");
      expect(el.currentPage).to.equal(1);
      expect(event.detail).to.deep.equal({ globalFilter: "a", columnFilters: {}, filteredCount: 2 });
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelectorAll("tbody tr").length).to.equal(2);
    });

    it("updates columnFilters immutably and emits sgds-filter", async () => {
      const el = await setup(
        html`<sgds-data-table
          label="People"
          .columns=${sortableColumns}
          .rows=${rows}
          itemsPerPage="2"
          currentPage="2"
        ></sgds-data-table>`
      );
      const events = collect(el, "sgds-filter");
      const before = el.columnFilters;
      el._onColumnFilterInput("name", "BEN");
      expect(el.columnFilters).to.deep.equal({ name: "BEN" });
      expect(el.columnFilters).to.not.equal(before);
      expect(before).to.deep.equal({});
      expect(el.currentPage).to.equal(1);
      expect(events[0].detail).to.deep.equal({ globalFilter: "", columnFilters: { name: "BEN" }, filteredCount: 1 });
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelectorAll("tbody tr").length).to.equal(1);

      el._onColumnFilterInput("name", "");
      expect(el.columnFilters).to.deep.equal({});
      expect(events[1].detail.filteredCount).to.equal(3);
    });

    it("reports rows.length as filteredCount with serverFilter", async () => {
      const el = await setup(
        html`<sgds-data-table label="People" serverFilter .columns=${sortableColumns} .rows=${rows}></sgds-data-table>`
      );
      const listener = oneEvent(el, "sgds-filter");
      el._onGlobalFilterInput("zzz");
      const event = await listener;
      expect(event.detail.filteredCount).to.equal(3);
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelectorAll("tbody tr").length).to.equal(3);
    });
  });

  describe("selection", () => {
    const manyRows = [...rows, { id: 4, name: "Dan", age: 40 }, { id: 5, name: "Eve", age: 22 }];

    it("toggles a row key and emits sgds-selection-change", async () => {
      const el = await setup(
        html`<sgds-data-table label="People" multiSelect .columns=${sortableColumns} .rows=${rows}></sgds-data-table>`
      );
      const events = collect(el, "sgds-selection-change");
      const before = el.selectedKeys;
      el._toggleRowSelection(2);
      expect(el.selectedKeys).to.deep.equal([2]);
      expect(before).to.deep.equal([]);
      expect(events[0].detail).to.deep.equal({ selectedKeys: [2], selectedRows: [rows[1]] });
      el._toggleRowSelection(2);
      expect(el.selectedKeys).to.deep.equal([]);
      expect(events[1].detail).to.deep.equal({ selectedKeys: [], selectedRows: [] });
    });

    it("keeps selectedRows across pages and sorting", async () => {
      const el = await setup(
        html`<sgds-data-table
          label="People"
          multiSelect
          .columns=${sortableColumns}
          .rows=${manyRows}
          itemsPerPage="2"
        ></sgds-data-table>`
      );
      el._toggleRowSelection(5);
      el._toggleRowSelection(1);
      el._onHeaderActivate("age", false);
      await elementUpdated(el);
      expect(el.selectedRows).to.deep.equal([manyRows[0], manyRows[4]]);
    });

    it("reports select-all state for the current page only", async () => {
      const el = await setup(
        html`<sgds-data-table
          label="People"
          multiSelect
          .columns=${sortableColumns}
          .rows=${manyRows}
          itemsPerPage="2"
        ></sgds-data-table>`
      );
      expect(el._selectAllState()).to.equal("none");
      el.selectedKeys = [3, 4];
      await elementUpdated(el);
      expect(el._selectAllState()).to.equal("none");
      el.selectedKeys = [1, 3];
      await elementUpdated(el);
      expect(el._selectAllState()).to.equal("some");
      el.selectedKeys = [2, 1];
      await elementUpdated(el);
      expect(el._selectAllState()).to.equal("all");
    });

    it("returns 'none' for an empty page", async () => {
      const el = await setup(
        html`<sgds-data-table label="People" multiSelect .columns=${sortableColumns} .rows=${[]}></sgds-data-table>`
      );
      expect(el._selectAllState()).to.equal("none");
    });

    it("toggles every row on the current page and leaves other pages alone", async () => {
      const el = await setup(
        html`<sgds-data-table
          label="People"
          multiSelect
          .columns=${sortableColumns}
          .rows=${manyRows}
          itemsPerPage="2"
          .selectedKeys=${[5, 1]}
        ></sgds-data-table>`
      );
      const events = collect(el, "sgds-selection-change");
      expect(el._selectAllState()).to.equal("some");

      el._toggleSelectAll();
      await elementUpdated(el);
      expect(el.selectedKeys).to.deep.equal([5, 1, 2]);
      expect(el._selectAllState()).to.equal("all");
      expect(events[0].detail.selectedKeys).to.deep.equal([5, 1, 2]);
      expect(events[0].detail.selectedRows).to.deep.equal([manyRows[0], manyRows[1], manyRows[4]]);

      el._toggleSelectAll();
      await elementUpdated(el);
      expect(el.selectedKeys).to.deep.equal([5]);
      expect(el._selectAllState()).to.equal("none");
      expect(events[1].detail).to.deep.equal({ selectedKeys: [5], selectedRows: [manyRows[4]] });

      el.currentPage = 3;
      await elementUpdated(el);
      expect(el._selectAllState()).to.equal("all");
      el._toggleSelectAll();
      expect(el.selectedKeys).to.deep.equal([]);
      expect(events.length).to.equal(3);
    });

    it("clearSelection empties selectedKeys and emits", async () => {
      const el = await setup(
        html`<sgds-data-table
          label="People"
          multiSelect
          .columns=${sortableColumns}
          .rows=${rows}
          .selectedKeys=${[1, 3]}
        ></sgds-data-table>`
      );
      const listener = oneEvent(el, "sgds-selection-change");
      el.clearSelection();
      const event = await listener;
      expect(el.selectedKeys).to.deep.equal([]);
      expect(el.selectedRows).to.deep.equal([]);
      expect(event.detail).to.deep.equal({ selectedKeys: [], selectedRows: [] });
    });
  });

  describe("pagination", () => {
    it("_goToPage sets currentPage and emits sgds-page-change", async () => {
      const el = await setup(
        html`<sgds-data-table
          label="People"
          .columns=${sortableColumns}
          .rows=${rows}
          itemsPerPage="2"
        ></sgds-data-table>`
      );
      const listener = oneEvent(el, "sgds-page-change");
      el._goToPage(2);
      const event = await listener;
      expect(el.currentPage).to.equal(2);
      expect(event.detail).to.deep.equal({ currentPage: 2, itemsPerPage: 2 });
    });

    it("clamps the page into [1, lastPage] and skips no-op changes", async () => {
      const el = await setup(
        html`<sgds-data-table
          label="People"
          .columns=${sortableColumns}
          .rows=${rows}
          itemsPerPage="2"
        ></sgds-data-table>`
      );
      const events = collect(el, "sgds-page-change");
      el._goToPage(99);
      expect(el.currentPage).to.equal(2);
      el._goToPage(2);
      el._goToPage(-3);
      expect(el.currentPage).to.equal(1);
      expect(events.map(e => e.detail.currentPage)).to.deep.equal([2, 1]);
    });

    it("clamps to dataLength in server mode", async () => {
      const el = await setup(
        html`<sgds-data-table
          label="People"
          mode="server"
          dataLength="10"
          itemsPerPage="3"
          .columns=${sortableColumns}
          .rows=${rows}
        ></sgds-data-table>`
      );
      el._goToPage(50);
      expect(el.currentPage).to.equal(4);
    });

    it("steps pages with PageDown/PageUp on the grid", async () => {
      const el = await setup(
        html`<sgds-data-table
          label="People"
          .columns=${sortableColumns}
          .rows=${rows}
          itemsPerPage="2"
        ></sgds-data-table>`
      );
      const events = collect(el, "sgds-page-change");
      const grid = el.shadowRoot?.querySelector("[role='grid']") as HTMLElement;
      const press = (key: string) => {
        const event = new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true });
        el._keyboard.handleKeydown(event);
        return event;
      };
      expect(grid).to.exist;
      expect(press("PageDown").defaultPrevented).to.be.true;
      expect(el.currentPage).to.equal(2);
      press("PageDown");
      expect(el.currentPage).to.equal(2);
      press("PageUp");
      expect(el.currentPage).to.equal(1);
      expect(events.map(e => e.detail.currentPage)).to.deep.equal([2, 1]);
    });
  });
});
