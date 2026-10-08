import { html } from "lit";
import { aTimeout, elementUpdated, expect, fixture, nextFrame, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import sinon from "sinon";
import { SgdsDataTable } from "../src/components";
import type { SgdsDataTableColumnDefinition } from "../src/components/DataTable/types";
import "./sgds-web-component";

type Row = { id: number; name: string; department: string; age: number };

const people: Row[] = [
  { id: 1, name: "Cara", department: "Engineering", age: 31 },
  { id: 2, name: "Amy", department: "Finance", age: 28 },
  { id: 3, name: "Ben", department: "Engineering", age: 35 },
  { id: 4, name: "Dan", department: "Operations", age: 26 },
  { id: 5, name: "Eli", department: "Finance", age: 40 }
];

const columns: SgdsDataTableColumnDefinition[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "department", header: "Department", sortable: true },
  { key: "age", header: "Age", sortable: true, align: "right" }
];

const filterableColumns: SgdsDataTableColumnDefinition[] = [
  { key: "name", header: "Name", sortable: true, filterable: true },
  { key: "department", header: "Department", sortable: true, filterable: true },
  { key: "age", header: "Age" }
];

const settle = async (el: SgdsDataTable) => {
  await elementUpdated(el);
  await nextFrame();
  await el.updateComplete;
};

const getGrid = (el: SgdsDataTable) => el.shadowRoot?.querySelector("[role='grid']") as HTMLTableElement;

const getCell = (el: SgdsDataTable, row: number, col: number) =>
  getGrid(el).querySelector(`[data-row="${row}"][data-col="${col}"]`) as HTMLElement;

const focusTargetOf = (cell: HTMLElement) => (cell.querySelector("[data-cell-focus]") as HTMLElement) ?? cell;

const activationTargetOf = (cell: HTMLElement) => (cell.querySelector("[data-activate]") as HTMLElement) ?? cell;

const clickCell = (cell: HTMLElement, shiftKey = false) =>
  activationTargetOf(cell).dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, shiftKey }));

const bodyRows = (el: SgdsDataTable) =>
  Array.from(getGrid(el).querySelectorAll("tbody tr")).filter(tr => tr.querySelector("td[data-row]"));

const columnText = (el: SgdsDataTable, col: number) =>
  bodyRows(el).map(tr => (tr.querySelector(`[data-col="${col}"]`)?.textContent ?? "").trim());

const tabStops = (el: SgdsDataTable) => Array.from(getGrid(el).querySelectorAll('[tabindex="0"]'));

const activeCell = (el: SgdsDataTable) => {
  const active = el.shadowRoot?.activeElement as HTMLElement | null;
  return active?.closest("[data-row][data-col]") as HTMLElement | null;
};

const activeCoords = (el: SgdsDataTable) => {
  const cell = activeCell(el);
  return cell ? [Number(cell.dataset.row), Number(cell.dataset.col)] : null;
};

const focusCell = async (el: SgdsDataTable, row: number, col: number) => {
  focusTargetOf(getCell(el, row, col)).focus();
  await settle(el);
};

const press = async (el: SgdsDataTable, key: string) => {
  await sendKeys({ press: key });
  await settle(el);
};

const typeInto = async (el: SgdsDataTable, sgdsInput: HTMLElement, value: string) => {
  await (sgdsInput as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
  const input = sgdsInput.shadowRoot?.querySelector("input") as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  await settle(el);
};

const globalFilterInput = (el: SgdsDataTable) => {
  const part = el.shadowRoot?.querySelector("[part~='global-filter']") as HTMLElement;
  return part.tagName === "SGDS-INPUT" ? part : (part.querySelector("sgds-input") as HTMLElement);
};

const columnFilterInput = (el: SgdsDataTable, header: string) =>
  getGrid(el).querySelector(`[part~='filter-row'] sgds-input[aria-label="Filter ${header}"]`) as HTMLElement;

const paginationOf = (el: SgdsDataTable) => el.shadowRoot?.querySelector("sgds-pagination") as HTMLElement;

const clickNextPage = async (el: SgdsDataTable) => {
  const pagination = paginationOf(el);
  const next = pagination.shadowRoot?.querySelector("sgds-icon-button[ariaLabel='Next']") as HTMLElement;
  next.click();
  await settle(el);
};

const clickPageNumber = async (el: SgdsDataTable, page: number) => {
  const pagination = paginationOf(el);
  const link = pagination.shadowRoot?.querySelector(`[aria-label="Go to Page ${page}"]`) as HTMLElement;
  link.click();
  await settle(el);
};

const checkboxIn = (cell: HTMLElement) =>
  cell.querySelector("sgds-checkbox") as HTMLElement & { checked: boolean; indeterminate: boolean };

const renderTable = (template: ReturnType<typeof html>) => fixture<SgdsDataTable>(template);

describe("<sgds-data-table> data mode: sorting", () => {
  const render = (overrides: Partial<SgdsDataTable> = {}) =>
    renderTable(html`
      <sgds-data-table
        label="People"
        .columns=${columns}
        .rows=${people}
        .itemsPerPage=${10}
        .multiSort=${overrides.multiSort ?? false}
        .serverSort=${overrides.serverSort ?? false}
        .sort=${overrides.sort ?? []}
      ></sgds-data-table>
    `);

  it("clicking a sortable header sorts ascending, sets aria-sort and emits sgds-sort", async () => {
    const el = await render();
    await settle(el);
    const header = getCell(el, 0, 0);
    expect(header.hasAttribute("aria-sort")).to.be.false;

    setTimeout(() => clickCell(header));
    const event = (await oneEvent(el, "sgds-sort")) as CustomEvent;
    await settle(el);

    expect(event.detail).to.deep.equal({
      key: "name",
      direction: "ascending",
      sort: [{ key: "name", direction: "ascending" }]
    });
    expect(el.sort).to.deep.equal([{ key: "name", direction: "ascending" }]);
    expect(getCell(el, 0, 0).getAttribute("aria-sort")).to.equal("ascending");
    expect(columnText(el, 0)).to.deep.equal(["Amy", "Ben", "Cara", "Dan", "Eli"]);
  });

  it("cycles ascending, descending and none on repeated clicks", async () => {
    const el = await render();
    await settle(el);
    const spy = sinon.spy();
    el.addEventListener("sgds-sort", spy);

    clickCell(getCell(el, 0, 0));
    await settle(el);
    clickCell(getCell(el, 0, 0));
    await settle(el);
    expect(getCell(el, 0, 0).getAttribute("aria-sort")).to.equal("descending");
    expect(columnText(el, 0)).to.deep.equal(["Eli", "Dan", "Cara", "Ben", "Amy"]);
    expect(spy.secondCall.args[0].detail.direction).to.equal("descending");

    clickCell(getCell(el, 0, 0));
    await settle(el);
    expect(getCell(el, 0, 0).hasAttribute("aria-sort")).to.be.false;
    expect(columnText(el, 0)).to.deep.equal(people.map(p => p.name));
    expect(spy.thirdCall.args[0].detail).to.deep.equal({ key: "name", direction: "none", sort: [] });
    expect(spy.callCount).to.equal(3);
  });

  it("sorts numbers numerically", async () => {
    const el = await render();
    await settle(el);
    clickCell(getCell(el, 0, 2));
    await settle(el);
    expect(columnText(el, 2)).to.deep.equal(["26", "28", "31", "35", "40"]);
  });

  it("does not sort or emit when a non-sortable header is clicked", async () => {
    const el = await renderTable(html`
      <sgds-data-table
        .columns=${[{ key: "name", header: "Name" }, ...columns.slice(1)]}
        .rows=${people}
        .itemsPerPage=${10}
      ></sgds-data-table>
    `);
    await settle(el);
    const spy = sinon.spy();
    el.addEventListener("sgds-sort", spy);
    clickCell(getCell(el, 0, 0));
    await settle(el);
    expect(spy.called).to.be.false;
    expect(getCell(el, 0, 0).hasAttribute("aria-sort")).to.be.false;
    expect(columnText(el, 0)).to.deep.equal(people.map(p => p.name));
  });

  it("renders an initial sort from the sort property", async () => {
    const el = await render({ sort: [{ key: "age", direction: "descending" }] });
    await settle(el);
    expect(getCell(el, 0, 2).getAttribute("aria-sort")).to.equal("descending");
    expect(columnText(el, 2)).to.deep.equal(["40", "35", "31", "28", "26"]);
  });

  it("Enter on a focused sortable header sorts it", async () => {
    const el = await render();
    await settle(el);
    await focusCell(el, 0, 0);
    const spy = sinon.spy();
    el.addEventListener("sgds-sort", spy);

    await press(el, "Enter");
    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[0].detail.direction).to.equal("ascending");
    expect(getCell(el, 0, 0).getAttribute("aria-sort")).to.equal("ascending");
    expect(columnText(el, 0)).to.deep.equal(["Amy", "Ben", "Cara", "Dan", "Eli"]);
  });

  it("Space on a focused sortable header sorts it", async () => {
    const el = await render();
    await settle(el);
    await focusCell(el, 0, 1);
    const spy = sinon.spy();
    el.addEventListener("sgds-sort", spy);

    await press(el, "Space");
    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[0].detail.key).to.equal("department");
    expect(getCell(el, 0, 1).getAttribute("aria-sort")).to.equal("ascending");
  });

  it("keeps focus on the header cell after a keyboard sort", async () => {
    const el = await render();
    await settle(el);
    await focusCell(el, 0, 1);
    await press(el, "Enter");
    expect(activeCoords(el)).to.deep.equal([0, 1]);
    expect(tabStops(el)).to.have.length(1);
    expect(tabStops(el)[0]).to.equal(focusTargetOf(getCell(el, 0, 1)));
  });

  it("Shift+click adds a secondary sort when multiSort is set", async () => {
    const el = await render({ multiSort: true });
    await settle(el);
    const spy = sinon.spy();
    el.addEventListener("sgds-sort", spy);

    clickCell(getCell(el, 0, 1));
    await settle(el);
    clickCell(getCell(el, 0, 2), true);
    await settle(el);

    expect(spy.secondCall.args[0].detail).to.deep.equal({
      key: "age",
      direction: "ascending",
      sort: [
        { key: "department", direction: "ascending" },
        { key: "age", direction: "ascending" }
      ]
    });
    expect(getCell(el, 0, 1).getAttribute("aria-sort")).to.equal("ascending");
    expect(getCell(el, 0, 2).hasAttribute("aria-sort")).to.be.false;
    expect(getCell(el, 0, 2).textContent).to.contain("sorted ascending, priority 2");
    expect(columnText(el, 0)).to.deep.equal(["Cara", "Ben", "Amy", "Eli", "Dan"]);
  });

  it("Shift+Enter adds a secondary sort when multiSort is set", async () => {
    const el = await render({ multiSort: true });
    await settle(el);
    clickCell(getCell(el, 0, 1));
    await settle(el);
    await focusCell(el, 0, 2);
    await press(el, "Shift+Enter");
    expect(el.sort).to.deep.equal([
      { key: "department", direction: "ascending" },
      { key: "age", direction: "ascending" }
    ]);
  });

  it("Shift+click replaces the sort when multiSort is not set", async () => {
    const el = await render();
    await settle(el);
    clickCell(getCell(el, 0, 1));
    await settle(el);
    clickCell(getCell(el, 0, 2), true);
    await settle(el);
    expect(el.sort).to.deep.equal([{ key: "age", direction: "ascending" }]);
    expect(getCell(el, 0, 1).hasAttribute("aria-sort")).to.be.false;
  });

  it("emits sgds-sort but keeps row order with serverSort", async () => {
    const el = await render({ serverSort: true });
    await settle(el);
    const spy = sinon.spy();
    el.addEventListener("sgds-sort", spy);
    clickCell(getCell(el, 0, 0));
    await settle(el);
    expect(spy.calledOnce).to.be.true;
    expect(getCell(el, 0, 0).getAttribute("aria-sort")).to.equal("ascending");
    expect(columnText(el, 0)).to.deep.equal(people.map(p => p.name));
  });
});

describe("<sgds-data-table> data mode: filtering", () => {
  const render = (overrides: Partial<SgdsDataTable> = {}) =>
    renderTable(html`
      <sgds-data-table
        label="People"
        .columns=${filterableColumns}
        .rows=${people}
        .itemsPerPage=${2}
        .currentPage=${overrides.currentPage ?? 1}
        .serverFilter=${overrides.serverFilter ?? false}
        showGlobalFilter
      ></sgds-data-table>
    `);

  it("typing in the global filter filters rows and emits sgds-filter", async () => {
    const el = await render();
    await settle(el);
    const spy = sinon.spy();
    el.addEventListener("sgds-filter", spy);

    await typeInto(el, globalFilterInput(el), "ENGIN");
    expect(el.globalFilter).to.equal("ENGIN");
    expect(spy.lastCall.args[0].detail).to.deep.equal({
      globalFilter: "ENGIN",
      columnFilters: {},
      filteredCount: 2
    });
    expect(columnText(el, 0)).to.deep.equal(["Cara", "Ben"]);
  });

  it("matches the global filter across every column", async () => {
    const el = await render();
    await settle(el);
    await typeInto(el, globalFilterInput(el), "40");
    expect(columnText(el, 0)).to.deep.equal(["Eli"]);
  });

  it("resets currentPage to 1 when a filter changes", async () => {
    const el = await render({ currentPage: 2 });
    await settle(el);
    expect(columnText(el, 0)).to.deep.equal(["Ben", "Dan"]);
    await typeInto(el, globalFilterInput(el), "a");
    expect(el.currentPage).to.equal(1);
    expect(columnText(el, 0)).to.deep.equal(["Cara", "Amy"]);
  });

  it("renders labelled column filter inputs in the filter row", async () => {
    const el = await render();
    await settle(el);
    const filterRow = getGrid(el).querySelector("[part~='filter-row']") as HTMLElement;
    expect(filterRow).to.exist;
    expect(columnFilterInput(el, "Name")).to.exist;
    expect(columnFilterInput(el, "Department")).to.exist;
    expect(columnFilterInput(el, "Age")).to.not.exist;
    expect(getCell(el, 1, 0).contains(columnFilterInput(el, "Name"))).to.be.true;
  });

  it("typing in a column filter filters that column and emits sgds-filter", async () => {
    const el = await render();
    await settle(el);
    const spy = sinon.spy();
    el.addEventListener("sgds-filter", spy);

    await typeInto(el, columnFilterInput(el, "Department"), "fin");
    expect(el.columnFilters).to.deep.equal({ department: "fin" });
    expect(spy.lastCall.args[0].detail).to.deep.equal({
      globalFilter: "",
      columnFilters: { department: "fin" },
      filteredCount: 2
    });
    expect(columnText(el, 0)).to.deep.equal(["Amy", "Eli"]);
  });

  it("combines the global filter and column filters", async () => {
    const el = await render();
    await settle(el);
    await typeInto(el, columnFilterInput(el, "Department"), "engineering");
    await typeInto(el, globalFilterInput(el), "ben");
    expect(columnText(el, 0)).to.deep.equal(["Ben"]);
    expect(el.shadowRoot?.querySelector("[role='status']")?.textContent).to.contain("1 result");
  });

  it("shows the no-data row when nothing matches", async () => {
    const el = await render();
    await settle(el);
    await typeInto(el, globalFilterInput(el), "zzz");
    expect(bodyRows(el)).to.have.length(0);
    const empty = getGrid(el).querySelector("[part~='empty']") as HTMLElement;
    expect(empty).to.exist;
    expect(empty.querySelector("slot[name='no-data']")).to.exist;
  });

  it("emits sgds-filter but keeps rows with serverFilter", async () => {
    const el = await render({ serverFilter: true });
    await settle(el);
    const spy = sinon.spy();
    el.addEventListener("sgds-filter", spy);
    await typeInto(el, globalFilterInput(el), "zzz");
    expect(spy.called).to.be.true;
    expect(el.globalFilter).to.equal("zzz");
    expect(columnText(el, 0)).to.deep.equal(["Cara", "Amy"]);
  });
});

describe("<sgds-data-table> data mode: pagination", () => {
  const render = (overrides: Partial<SgdsDataTable> = {}) =>
    renderTable(html`
      <sgds-data-table
        label="People"
        .columns=${columns}
        .rows=${people}
        .itemsPerPage=${2}
        .mode=${overrides.mode ?? "client"}
        .dataLength=${overrides.dataLength ?? 0}
      ></sgds-data-table>
    `);

  it("clicking Next shows the next page and emits one sgds-page-change", async () => {
    const el = await render();
    await settle(el);
    expect(columnText(el, 0)).to.deep.equal(["Cara", "Amy"]);
    const spy = sinon.spy();
    el.addEventListener("sgds-page-change", spy);

    await clickNextPage(el);
    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[0].detail).to.deep.equal({ currentPage: 2, itemsPerPage: 2 });
    expect(el.currentPage).to.equal(2);
    expect(columnText(el, 0)).to.deep.equal(["Ben", "Dan"]);
  });

  it("clicking a page number goes to that page", async () => {
    const el = await render();
    await settle(el);
    await clickPageNumber(el, 3);
    expect(el.currentPage).to.equal(3);
    expect(columnText(el, 0)).to.deep.equal(["Eli"]);
  });

  it("offsets aria-rowindex by the page in client mode", async () => {
    const el = await render();
    await settle(el);
    await clickNextPage(el);
    const rows = bodyRows(el);
    expect(rows[0].getAttribute("aria-rowindex")).to.equal("4");
    expect(rows[1].getAttribute("aria-rowindex")).to.equal("5");
  });

  it("does not slice rows in server mode", async () => {
    const el = await render({ mode: "server", dataLength: 20 });
    await settle(el);
    expect(bodyRows(el)).to.have.length(5);
    const spy = sinon.spy();
    el.addEventListener("sgds-page-change", spy);
    await clickNextPage(el);
    expect(spy.firstCall.args[0].detail).to.deep.equal({ currentPage: 2, itemsPerPage: 2 });
    expect(columnText(el, 0)).to.deep.equal(people.map(p => p.name));
  });
});

describe("<sgds-data-table> data mode: selection", () => {
  const render = (overrides: Partial<SgdsDataTable> = {}) =>
    renderTable(html`
      <sgds-data-table
        label="People"
        .columns=${columns}
        .rows=${people}
        .itemsPerPage=${3}
        .selectedKeys=${overrides.selectedKeys ?? []}
        multiSelect
      ></sgds-data-table>
    `);

  it("marks the grid as multiselectable and labels the checkboxes", async () => {
    const el = await render();
    await settle(el);
    expect(getGrid(el).getAttribute("aria-multiselectable")).to.equal("true");
    expect(checkboxIn(getCell(el, 0, 0)).getAttribute("aria-label")).to.equal("Select all rows");
    expect(checkboxIn(getCell(el, 1, 0)).getAttribute("aria-label")).to.equal("Select row 1");
    expect(checkboxIn(getCell(el, 0, 0)).getAttribute("tabindex")).to.equal("-1");
    expect(checkboxIn(getCell(el, 1, 0)).getAttribute("tabindex")).to.equal("-1");
  });

  it("clicking a row checkbox selects the row once and makes select-all indeterminate", async () => {
    const el = await render();
    await settle(el);
    const spy = sinon.spy();
    el.addEventListener("sgds-selection-change", spy);

    checkboxIn(getCell(el, 2, 0)).click();
    await settle(el);

    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[0].detail).to.deep.equal({ selectedKeys: [2], selectedRows: [people[1]] });
    expect(el.selectedKeys).to.deep.equal([2]);
    expect(bodyRows(el)[1].getAttribute("aria-selected")).to.equal("true");
    expect(bodyRows(el)[0].getAttribute("aria-selected")).to.not.equal("true");
    expect(checkboxIn(getCell(el, 2, 0)).checked).to.be.true;
    const selectAll = checkboxIn(getCell(el, 0, 0));
    expect(selectAll.indeterminate).to.be.true;
    expect(selectAll.checked).to.be.false;
  });

  it("clicking a selected row checkbox deselects it", async () => {
    const el = await render({ selectedKeys: [1] });
    await settle(el);
    checkboxIn(getCell(el, 1, 0)).click();
    await settle(el);
    expect(el.selectedKeys).to.deep.equal([]);
    expect(checkboxIn(getCell(el, 0, 0)).indeterminate).to.be.false;
  });

  it("select-all selects every row on the current page, then clears them", async () => {
    const el = await render();
    await settle(el);
    const spy = sinon.spy();
    el.addEventListener("sgds-selection-change", spy);

    checkboxIn(getCell(el, 0, 0)).click();
    await settle(el);
    expect(spy.calledOnce).to.be.true;
    expect(el.selectedKeys).to.have.members([1, 2, 3]);
    expect(spy.firstCall.args[0].detail.selectedRows).to.have.deep.members(people.slice(0, 3));
    expect(checkboxIn(getCell(el, 0, 0)).checked).to.be.true;
    expect(checkboxIn(getCell(el, 0, 0)).indeterminate).to.be.false;
    expect(bodyRows(el).every(tr => tr.getAttribute("aria-selected") === "true")).to.be.true;

    checkboxIn(getCell(el, 0, 0)).click();
    await settle(el);
    expect(el.selectedKeys).to.deep.equal([]);
    expect(checkboxIn(getCell(el, 0, 0)).checked).to.be.false;
  });

  it("select-all from the indeterminate state selects the whole page", async () => {
    const el = await render({ selectedKeys: [1] });
    await settle(el);
    expect(checkboxIn(getCell(el, 0, 0)).indeterminate).to.be.true;
    clickCell(getCell(el, 0, 0));
    await settle(el);
    expect(el.selectedKeys).to.have.members([1, 2, 3]);
  });

  it("Enter and Space on checkbox cells toggle selection", async () => {
    const el = await render();
    await settle(el);
    await focusCell(el, 1, 0);
    await press(el, "Space");
    expect(el.selectedKeys).to.deep.equal([1]);
    await press(el, "Enter");
    expect(el.selectedKeys).to.deep.equal([]);

    await focusCell(el, 0, 0);
    await press(el, "Enter");
    expect(el.selectedKeys).to.have.members([1, 2, 3]);
  });

  it("keeps selection by row key across sorting and paging", async () => {
    const el = await render();
    await settle(el);
    checkboxIn(getCell(el, 1, 0)).click();
    await settle(el);
    clickCell(getCell(el, 0, 1));
    await settle(el);
    expect(el.selectedKeys).to.deep.equal([1]);
    const selected = bodyRows(el).filter(tr => tr.getAttribute("aria-selected") === "true");
    expect(selected).to.have.length(1);
    expect(selected[0].textContent).to.contain("Cara");
  });

  it("clearSelection clears and emits sgds-selection-change", async () => {
    const el = await render({ selectedKeys: [1, 2] });
    await settle(el);
    setTimeout(() => el.clearSelection());
    const event = (await oneEvent(el, "sgds-selection-change")) as CustomEvent;
    expect(event.detail).to.deep.equal({ selectedKeys: [], selectedRows: [] });
  });
});

describe("<sgds-data-table> data mode: keyboard", () => {
  const render = (overrides: { columns?: SgdsDataTableColumnDefinition[]; multiSelect?: boolean } = {}) =>
    renderTable(html`
      <div>
        <button id="before">Before</button>
        <sgds-data-table
          label="People"
          .columns=${overrides.columns ?? columns}
          .rows=${people}
          .itemsPerPage=${2}
          .multiSelect=${overrides.multiSelect ?? false}
        ></sgds-data-table>
      </div>
    `).then(async wrapper => {
      const el = wrapper.querySelector("sgds-data-table") as SgdsDataTable;
      await settle(el);
      return el;
    });

  it("has exactly one tab stop, on the first header cell, and other targets are -1", async () => {
    const el = await render({ multiSelect: true });
    const stops = tabStops(el);
    expect(stops).to.have.length(1);
    expect(stops[0]).to.equal(getCell(el, 0, 0));
    Array.from(getGrid(el).querySelectorAll("[data-row][data-col]"))
      .filter(cell => cell !== stops[0])
      .forEach(cell => expect(focusTargetOf(cell as HTMLElement).getAttribute("tabindex")).to.equal("-1"));
  });

  it("Tab moves focus into the grid at the roving cell", async () => {
    const el = await render();
    (el.parentElement?.querySelector("#before") as HTMLButtonElement).focus();
    await press(el, "Tab");
    expect(activeCoords(el)).to.deep.equal([0, 0]);
  });

  it("arrow keys move focus and the single tab stop", async () => {
    const el = await render();
    await focusCell(el, 0, 0);

    await press(el, "ArrowRight");
    expect(activeCoords(el)).to.deep.equal([0, 1]);
    await press(el, "ArrowDown");
    expect(activeCoords(el)).to.deep.equal([1, 1]);
    await press(el, "ArrowDown");
    expect(activeCoords(el)).to.deep.equal([2, 1]);
    await press(el, "ArrowLeft");
    expect(activeCoords(el)).to.deep.equal([2, 0]);
    await press(el, "ArrowUp");
    expect(activeCoords(el)).to.deep.equal([1, 0]);

    expect(tabStops(el)).to.have.length(1);
    expect(tabStops(el)[0]).to.equal(getCell(el, 1, 0));
    expect(getCell(el, 0, 0).getAttribute("tabindex")).to.equal("-1");
  });

  it("does not move past the edges of the grid", async () => {
    const el = await render();
    await focusCell(el, 0, 0);
    await press(el, "ArrowLeft");
    expect(activeCoords(el)).to.deep.equal([0, 0]);
    await press(el, "ArrowUp");
    expect(activeCoords(el)).to.deep.equal([0, 0]);
    await focusCell(el, 2, 2);
    await press(el, "ArrowRight");
    expect(activeCoords(el)).to.deep.equal([2, 2]);
    await press(el, "ArrowDown");
    expect(activeCoords(el)).to.deep.equal([2, 2]);
  });

  it("Home and End move to the first and last cell of the row", async () => {
    const el = await render();
    await focusCell(el, 1, 1);
    await press(el, "End");
    expect(activeCoords(el)).to.deep.equal([1, 2]);
    await press(el, "Home");
    expect(activeCoords(el)).to.deep.equal([1, 0]);
  });

  it("Ctrl+Home and Ctrl+End move to the first and last cell of the grid", async () => {
    const el = await render();
    await focusCell(el, 1, 1);
    await press(el, "Control+End");
    expect(activeCoords(el)).to.deep.equal([2, 2]);
    await press(el, "Control+Home");
    expect(activeCoords(el)).to.deep.equal([0, 0]);
    expect(tabStops(el)).to.have.length(1);
  });

  it("follows mouse focus with the roving tab stop", async () => {
    const el = await render();
    getCell(el, 2, 1).focus();
    getCell(el, 2, 1).dispatchEvent(new FocusEvent("focusin", { bubbles: true, composed: true }));
    await settle(el);
    expect(tabStops(el)).to.deep.equal([getCell(el, 2, 1)]);
  });

  it("PageDown and PageUp change the page and emit sgds-page-change", async () => {
    const el = await render();
    await focusCell(el, 1, 0);
    const spy = sinon.spy();
    el.addEventListener("sgds-page-change", spy);

    await press(el, "PageDown");
    expect(el.currentPage).to.equal(2);
    expect(spy.lastCall.args[0].detail).to.deep.equal({ currentPage: 2, itemsPerPage: 2 });
    await press(el, "PageUp");
    expect(el.currentPage).to.equal(1);
    expect(spy.callCount).to.equal(2);
  });

  it("clamps focus into range when the next page has fewer rows", async () => {
    const el = await render();
    await focusCell(el, 2, 1);
    await press(el, "PageDown");
    await press(el, "PageDown");
    expect(el.currentPage).to.equal(3);
    await aTimeout(0);
    expect(activeCoords(el)).to.deep.equal([1, 1]);
    expect(tabStops(el)).to.have.length(1);
  });

  it("keeps focus on the same header after sorting by mouse", async () => {
    const el = await render();
    await focusCell(el, 0, 2);
    clickCell(getCell(el, 0, 2));
    await settle(el);
    expect(activeCoords(el)).to.deep.equal([0, 2]);
    expect(getGrid(el).contains(el.shadowRoot?.activeElement as Node)).to.be.true;
  });

  it("uses the filter input as the focus target in filter cells", async () => {
    const el = await render({ columns: filterableColumns });
    await focusCell(el, 0, 0);
    await press(el, "ArrowDown");
    const filterCell = getCell(el, 1, 0);
    expect(el.shadowRoot?.activeElement).to.equal(focusTargetOf(filterCell));
    expect(focusTargetOf(filterCell).tagName).to.equal("SGDS-INPUT");
    expect(focusTargetOf(filterCell).getAttribute("tabindex")).to.equal("0");
    expect(filterCell.getAttribute("tabindex")).to.not.equal("0");
  });

  it("Left and Right edit text inside a filter input while Up and Down leave it", async () => {
    const el = await render({ columns: filterableColumns });
    await focusCell(el, 1, 0);
    await press(el, "ArrowRight");
    expect(activeCoords(el)).to.deep.equal([1, 0]);
    await press(el, "Home");
    expect(activeCoords(el)).to.deep.equal([1, 0]);
    await press(el, "ArrowDown");
    expect(activeCoords(el)).to.deep.equal([2, 0]);
    await press(el, "ArrowUp");
    expect(activeCoords(el)).to.deep.equal([1, 0]);
    await press(el, "ArrowUp");
    expect(activeCoords(el)).to.deep.equal([0, 0]);
  });

  it("Enter in a filter input does not sort", async () => {
    const el = await render({ columns: filterableColumns });
    const spy = sinon.spy();
    el.addEventListener("sgds-sort", spy);
    await focusCell(el, 1, 0);
    await press(el, "Enter");
    expect(spy.called).to.be.false;
  });
});

describe("<sgds-data-table> data mode: grid structure", () => {
  it("renders the grid roles and counts", async () => {
    const el = await renderTable(html`
      <sgds-data-table label="People" .columns=${columns} .rows=${people} .itemsPerPage=${2}></sgds-data-table>
    `);
    await settle(el);
    const grid = getGrid(el);
    expect(grid.tagName).to.equal("TABLE");
    expect(grid.getAttribute("aria-label")).to.equal("People");
    expect(grid.getAttribute("aria-colcount")).to.equal("3");
    expect(grid.getAttribute("aria-rowcount")).to.equal("6");
    expect(getCell(el, 0, 0).tagName).to.equal("TH");
    expect(getCell(el, 0, 0).getAttribute("scope")).to.equal("col");
    expect(getCell(el, 1, 0).tagName).to.equal("TD");
    expect(getCell(el, 1, 0).getAttribute("role")).to.equal("gridcell");
    expect(grid.querySelector("thead tr")?.getAttribute("aria-rowindex")).to.equal("1");
    expect(bodyRows(el)[0].getAttribute("aria-rowindex")).to.equal("2");
  });

  it("uses sgds-data-table-column children when columns is empty", async () => {
    const el = await renderTable(html`
      <sgds-data-table .rows=${people} .itemsPerPage=${10}>
        <sgds-data-table-column key="name" header="Name" sortable></sgds-data-table-column>
        <sgds-data-table-column key="age" header="Age" align="right"></sgds-data-table-column>
      </sgds-data-table>
    `);
    await settle(el);
    expect(getCell(el, 0, 0).textContent).to.contain("Name");
    expect(getCell(el, 0, 1).textContent).to.contain("Age");
    clickCell(getCell(el, 0, 0));
    await settle(el);
    expect(getCell(el, 0, 0).getAttribute("aria-sort")).to.equal("ascending");
  });

  it("sets aria-busy while loading", async () => {
    const el = await renderTable(html`
      <sgds-data-table loading .columns=${columns} .rows=${people}></sgds-data-table>
    `);
    await settle(el);
    expect(getGrid(el).getAttribute("aria-busy")).to.equal("true");
    expect(getGrid(el).querySelector("[part~='loading']")).to.exist;
  });

  it("renders custom cell content from render", async () => {
    const el = await renderTable(html`
      <sgds-data-table
        .columns=${[{ key: "name", header: "Name", render: (value: unknown) => html`<strong>${value}</strong>` }]}
        .rows=${people}
        .itemsPerPage=${10}
      ></sgds-data-table>
    `);
    await settle(el);
    expect(getCell(el, 1, 0).querySelector("strong")?.textContent).to.equal("Cara");
  });
});
