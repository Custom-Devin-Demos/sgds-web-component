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

describe("<sgds-data-table> data mode rendering", () => {
  const people = [
    { id: 1, name: "Amy", age: 28, status: "Active" },
    { id: 2, name: "Ben", age: 35, status: "Pending" },
    { id: 3, name: "Cara", age: 31, status: "Inactive" },
    { id: 4, name: "Dan", age: 26, status: "Active" },
    { id: 5, name: "Eli", age: 40, status: "Pending" },
    { id: 6, name: "Faye", age: 29, status: "Inactive" },
    { id: 7, name: "Gabe", age: 33, status: "Active" }
  ];
  const featureColumns = [
    { key: "name", header: "Name", sortable: true, filterable: true },
    { key: "age", header: "Age", sortable: true, align: "right" as const, width: "120px" },
    { key: "status", header: "Status", filterable: true }
  ];
  const shadow = (el: SgdsDataTable) => el.shadowRoot as ShadowRoot;

  const fullTable = () =>
    fixture<SgdsDataTable>(html`<sgds-data-table
      label="People"
      .columns=${featureColumns}
      .rows=${people}
      .sort=${[
        { key: "age", direction: "descending" },
        { key: "name", direction: "ascending" }
      ]}
      .columnFilters=${{ name: "a" }}
      .selectedKeys=${[2]}
      multiSelect
      showGlobalFilter
      itemsPerPage="5"
    ></sgds-data-table>`);

  it("renders every documented part", async () => {
    const el = await fullTable();
    const parts = [
      "base",
      "toolbar",
      "global-filter",
      "table-container",
      "table",
      "header-row",
      "header-cell",
      "sort-indicator",
      "filter-row",
      "filter-input",
      "row",
      "cell",
      "checkbox-cell",
      "footer",
      "pagination-summary",
      "pagination"
    ];
    parts.forEach(part => expect(shadow(el).querySelector(`[part~="${part}"]`), part).to.exist);
  });

  it("sets grid aria attributes", async () => {
    const el = await fullTable();
    const grid = shadow(el).querySelector("[role='grid']") as HTMLElement;
    expect(grid.tagName).to.equal("TABLE");
    expect(grid.getAttribute("aria-label")).to.equal("People");
    expect(grid.getAttribute("aria-rowcount")).to.equal(String(el.rows.length + 2));
    expect(grid.getAttribute("aria-colcount")).to.equal("4");
    expect(grid.getAttribute("aria-multiselectable")).to.equal("true");
    expect(grid.hasAttribute("aria-busy")).to.be.false;
  });

  it("omits aria-multiselectable without multiSelect", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${columns} .rows=${rows}></sgds-data-table>`
    );
    const grid = shadow(el).querySelector("[role='grid']") as HTMLElement;
    expect(grid.hasAttribute("aria-multiselectable")).to.be.false;
    expect(grid.getAttribute("aria-rowcount")).to.equal("4");
    expect(grid.getAttribute("aria-colcount")).to.equal("2");
    expect(shadow(el).querySelector("[part~='checkbox-cell']")).to.not.exist;
    expect(shadow(el).querySelector("[part~='filter-row']")).to.not.exist;
    expect(shadow(el).querySelector("[part~='toolbar']")).to.not.exist;
  });

  it("puts aria-sort on the primary sorted header only and describes secondary sorts", async () => {
    const el = await fullTable();
    const headers = Array.from(shadow(el).querySelectorAll<HTMLElement>("[part~='header-row'] th"));
    const [, name, age, status] = headers;
    expect(age.getAttribute("aria-sort")).to.equal("descending");
    expect(name.hasAttribute("aria-sort")).to.be.false;
    expect(status.hasAttribute("aria-sort")).to.be.false;
    expect(name.querySelector(".visually-hidden")?.textContent?.trim()).to.equal("sorted ascending, priority 2");
    expect(age.querySelector(".visually-hidden")).to.not.exist;
    expect(age.querySelector("[part='sort-indicator']")?.getAttribute("name")).to.equal("arrow-down");
    expect(name.querySelector("[part='sort-indicator']")?.getAttribute("name")).to.equal("arrow-up");
    expect(status.querySelector("[data-activate]")).to.not.exist;
    headers.forEach(th => expect(th.getAttribute("scope")).to.equal("col"));
  });

  it("renders an unsorted sortable header with the neutral indicator and no aria-sort", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${featureColumns} .rows=${people}></sgds-data-table>`
    );
    const th = shadow(el).querySelector<HTMLElement>("[part~='header-row'] th");
    expect(th?.hasAttribute("aria-sort")).to.be.false;
    expect(th?.querySelector("[part='sort-indicator']")?.getAttribute("name")).to.equal("chevron-selector-vertical");
    const activator = th?.querySelector<HTMLElement>("[data-activate]");
    expect(activator?.getAttribute("tabindex")).to.equal("-1");
  });

  it("calls the header handler once per activator click", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${featureColumns} .rows=${people}></sgds-data-table>`
    );
    const calls: Array<[string, boolean]> = [];
    (el as unknown as { _onHeaderActivate: (key: string, additive: boolean) => void })._onHeaderActivate = (
      key,
      additive
    ) => calls.push([key, additive]);
    const activator = shadow(el).querySelector<HTMLElement>("[data-col='1'] [data-activate]");
    activator?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, shiftKey: true }));
    expect(calls).to.deep.equal([["age", true]]);
  });

  it("renders a filter row with one labelled input per filterable column", async () => {
    const el = await fullTable();
    const filterRow = shadow(el).querySelector("[part~='filter-row']") as HTMLElement;
    const cells = filterRow.querySelectorAll("th");
    expect(cells.length).to.equal(4);
    const inputs = Array.from(filterRow.querySelectorAll<HTMLElement & { value: string }>("[part~='filter-input']"));
    expect(inputs.map(input => input.getAttribute("aria-label"))).to.deep.equal(["Filter Name", "Filter Status"]);
    expect(inputs[0].value).to.equal("a");
    expect(inputs[1].value).to.equal("");
    inputs.forEach(input => expect(input.hasAttribute("data-cell-focus")).to.be.true);
  });

  it("calls the filter handlers from the inputs", async () => {
    const el = await fullTable();
    const calls: string[] = [];
    const host = el as unknown as {
      _onGlobalFilterInput: (value: string) => void;
      _onColumnFilterInput: (key: string, value: string) => void;
    };
    host._onGlobalFilterInput = value => calls.push(`global:${value}`);
    host._onColumnFilterInput = (key, value) => calls.push(`${key}:${value}`);
    const global = shadow(el).querySelector<HTMLElement & { value: string }>("[part~='global-filter']");
    const status = shadow(el).querySelectorAll<HTMLElement & { value: string }>("[part~='filter-input']")[1];
    if (!global || !status) throw new Error("inputs missing");
    global.value = "amy";
    global.dispatchEvent(new CustomEvent("sgds-input"));
    status.value = "act";
    status.dispatchEvent(new CustomEvent("sgds-input"));
    expect(calls).to.deep.equal(["global:amy", "status:act"]);
  });

  it("renders the checkbox column with labels and selection state", async () => {
    const el = await fullTable();
    const headerCheckbox = shadow(el).querySelector<HTMLElement & { ariaLabel: string }>(
      "[part~='header-row'] [part~='checkbox-cell'] sgds-checkbox"
    );
    expect(headerCheckbox?.ariaLabel).to.equal("Select all rows");
    expect(headerCheckbox?.getAttribute("tabindex")).to.equal("-1");
    const bodyRows = Array.from(shadow(el).querySelectorAll<HTMLElement>("tbody tr[part~='row']"));
    expect(bodyRows.length).to.equal(5);
    bodyRows.forEach((tr, index) => {
      const cell = tr.querySelector<HTMLElement>("[part~='checkbox-cell']");
      const checkbox = cell?.querySelector<HTMLElement & { ariaLabel: string; checked: boolean }>("sgds-checkbox");
      expect(cell?.hasAttribute("data-activate")).to.be.true;
      expect(checkbox?.ariaLabel).to.equal(`Select row ${index + 1}`);
      expect(checkbox?.getAttribute("tabindex")).to.equal("-1");
      expect(tr.getAttribute("aria-selected")).to.equal(index === 1 ? "true" : "false");
      expect(checkbox?.checked).to.equal(index === 1);
    });
  });

  it("toggles selection exactly once per cell or checkbox click", async () => {
    const el = await fullTable();
    const keys: unknown[] = [];
    let selectAll = 0;
    const host = el as unknown as { _toggleRowSelection: (key: unknown) => void; _toggleSelectAll: () => void };
    host._toggleRowSelection = key => keys.push(key);
    host._toggleSelectAll = () => selectAll++;
    const firstRowCell = shadow(el).querySelector<HTMLElement>("tbody [part~='checkbox-cell']");
    firstRowCell?.click();
    (firstRowCell?.querySelector("sgds-checkbox") as HTMLElement).click();
    shadow(el).querySelector<HTMLElement>("thead [part~='checkbox-cell']")?.click();
    expect(keys).to.deep.equal([1, 1]);
    expect(selectAll).to.equal(1);
  });

  it("assigns data-row and data-col coordinates across the grid", async () => {
    const el = await fullTable();
    const trs = Array.from(shadow(el).querySelectorAll<HTMLElement>("thead tr, tbody tr"));
    trs.forEach((tr, rowIndex) => {
      Array.from(tr.children).forEach((cell, colIndex) => {
        expect(cell.getAttribute("data-row")).to.equal(String(rowIndex));
        expect(cell.getAttribute("data-col")).to.equal(String(colIndex));
      });
    });
    const bodyRowIndexes = Array.from(shadow(el).querySelectorAll("tbody tr")).map(tr =>
      tr.getAttribute("aria-rowindex")
    );
    expect(bodyRowIndexes).to.deep.equal(["3", "4", "5", "6", "7"]);
  });

  it("offsets aria-rowindex by the page in client pagination", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table
        label="People"
        .columns=${columns}
        .rows=${people}
        itemsPerPage="5"
        currentPage="2"
      ></sgds-data-table>`
    );
    const indexes = Array.from(shadow(el).querySelectorAll("tbody tr")).map(tr => tr.getAttribute("aria-rowindex"));
    expect(indexes).to.deep.equal(["7", "8"]);
    expect(shadow(el).querySelector("[part='pagination-summary']")?.textContent?.trim()).to.equal(
      "Showing 6 to 7 of 7 results"
    );
  });

  it("has exactly one tab stop in the grid", async () => {
    const el = await fullTable();
    const grid = shadow(el).querySelector("[role='grid']") as HTMLElement;
    const stops = grid.querySelectorAll("[tabindex='0']");
    expect(stops.length).to.equal(1);
    expect(stops[0].getAttribute("data-row")).to.equal("0");
    expect(stops[0].getAttribute("data-col")).to.equal("0");
    grid.querySelectorAll("[data-row]").forEach(cell => {
      if (cell !== stops[0]) expect(cell.getAttribute("tabindex")).to.equal("-1");
    });
    grid.querySelectorAll("[data-cell-focus]").forEach(input => expect(input.getAttribute("tabindex")).to.equal("-1"));
  });

  it("renders the empty state with the no-data slot", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${columns} .rows=${[]} multiSelect></sgds-data-table>`
    );
    const empty = shadow(el).querySelector("tbody tr[part='empty']") as HTMLElement;
    expect(empty).to.exist;
    expect(shadow(el).querySelectorAll("tbody tr").length).to.equal(1);
    const td = empty.querySelector("td");
    expect(td?.getAttribute("colspan")).to.equal("3");
    const slot = empty.querySelector<HTMLSlotElement>("slot[name='no-data']");
    expect(slot?.textContent?.trim()).to.equal("No data");
    expect(shadow(el).querySelector("[role='status']")?.textContent?.trim()).to.equal("0 results");
  });

  it("renders skeleton rows and aria-busy while loading", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table
        label="People"
        .columns=${columns}
        .rows=${rows}
        loading
        itemsPerPage="3"
      ></sgds-data-table>`
    );
    const grid = shadow(el).querySelector("[role='grid']") as HTMLElement;
    expect(grid.getAttribute("aria-busy")).to.equal("true");
    const loadingRows = shadow(el).querySelectorAll("tbody tr[part='loading']");
    expect(loadingRows.length).to.equal(3);
    expect(loadingRows[0].querySelectorAll("sgds-skeleton").length).to.equal(2);
    expect(shadow(el).querySelector("tbody tr[part='row']")).to.not.exist;
    expect(shadow(el).querySelector("tbody tr[part='empty']")).to.not.exist;
  });

  it("announces the result count in a polite live region", async () => {
    const el = await fullTable();
    const status = shadow(el).querySelector("[role='status']") as HTMLElement;
    expect(status.getAttribute("aria-live")).to.equal("polite");
    expect(status.textContent?.trim()).to.equal(`${el.rows.length} results`);
  });

  it("shows the footer only when rows exceed itemsPerPage or in server mode", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${columns} .rows=${rows} itemsPerPage="5"></sgds-data-table>`
    );
    expect(shadow(el).querySelector("[part='footer']")).to.not.exist;
    el.mode = "server";
    el.dataLength = 3;
    await elementUpdated(el);
    expect(shadow(el).querySelector("[part='footer']")).to.exist;
    el.mode = "client";
    el.itemsPerPage = 2;
    await elementUpdated(el);
    expect(shadow(el).querySelector("[part='footer'] [part='pagination']")).to.exist;
  });

  it("reflects density and stickyHeader", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table
        style="--sgds-dimension-56: 56px; --sgds-dimension-40: 40px;"
        label="People"
        .columns=${columns}
        .rows=${rows}
      ></sgds-data-table>`
    );
    expect(el.getAttribute("density")).to.equal("comfortable");
    const cell = shadow(el).querySelector("td") as HTMLElement;
    const comfortableHeight = cell.getBoundingClientRect().height;
    el.density = "dense";
    el.stickyHeader = true;
    await elementUpdated(el);
    expect(el.getAttribute("density")).to.equal("dense");
    expect(el.hasAttribute("stickyheader")).to.be.true;
    expect(cell.getBoundingClientRect().height).to.be.lessThan(comfortableHeight);
    expect(getComputedStyle(shadow(el).querySelector("thead") as HTMLElement).position).to.equal("sticky");
  });

  it("applies column align and width", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${featureColumns} .rows=${people}></sgds-data-table>`
    );
    const ageHeader = shadow(el).querySelector<HTMLElement>("[part~='header-row'] [data-col='1']");
    const ageCell = shadow(el).querySelector<HTMLElement>("tbody [data-col='1']");
    expect(ageHeader?.style.width).to.equal("120px");
    expect(getComputedStyle(ageCell as HTMLElement).textAlign).to.equal("right");
  });

  it("renders cells with column.render or the stringified value", async () => {
    const el = await fixture<SgdsDataTable>(
      html`<sgds-data-table
        label="People"
        .columns=${[
          { key: "name", header: "Name", render: (value: unknown) => html`<strong>${value}</strong>` },
          { key: "missing", header: "Missing" }
        ]}
        .rows=${rows}
      ></sgds-data-table>`
    );
    const cells = shadow(el).querySelectorAll("tbody tr:first-child td");
    expect(cells[0].querySelector("strong")?.textContent).to.equal("Amy");
    expect(cells[0].getAttribute("role")).to.equal("gridcell");
    expect(cells[1].textContent?.trim()).to.equal("");
  });

  it("is accessible with every feature enabled", async () => {
    const el = await fullTable();
    await expect(el).to.be.accessible();
  });

  it("is accessible in the empty and loading states", async () => {
    const empty = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${featureColumns} .rows=${[]} multiSelect></sgds-data-table>`
    );
    await expect(empty).to.be.accessible();
    const loading = await fixture<SgdsDataTable>(
      html`<sgds-data-table label="People" .columns=${featureColumns} .rows=${people} loading></sgds-data-table>`
    );
    await expect(loading).to.be.accessible();
  });
});
