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
