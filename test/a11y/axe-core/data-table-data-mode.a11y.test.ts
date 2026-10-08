import { html } from "lit";
import { elementUpdated, expect, fixture, nextFrame } from "@open-wc/testing";
import { SgdsDataTable } from "../../../src/components";
import type { SgdsDataTableColumnDefinition } from "../../../src/components/DataTable/types";
import "../../sgds-web-component";

const columns: SgdsDataTableColumnDefinition[] = [
  { key: "name", header: "Name", sortable: true, filterable: true },
  { key: "department", header: "Department", sortable: true, filterable: true },
  { key: "age", header: "Age", sortable: true, align: "right" }
];

const basicColumns: SgdsDataTableColumnDefinition[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "department", header: "Department", sortable: true },
  { key: "age", header: "Age", sortable: true, align: "right" }
];

const rows = [
  { id: 1, name: "Amy Tan", department: "Finance", age: 28 },
  { id: 2, name: "Ben Lim", department: "Engineering", age: 35 },
  { id: 3, name: "Cara Ng", department: "Engineering", age: 31 },
  { id: 4, name: "Dan Koh", department: "Operations", age: 26 },
  { id: 5, name: "Eli Goh", department: "Finance", age: 40 },
  { id: 6, name: "Faye Chua", department: "Policy", age: 29 }
];

const settle = async (el: SgdsDataTable) => {
  await elementUpdated(el);
  await nextFrame();
  await el.updateComplete;
};

describe("<sgds-data-table> data mode a11y", () => {
  it("basic data mode should be accessible", async () => {
    const el = await fixture<SgdsDataTable>(html`
      <sgds-data-table
        label="Staff directory"
        .columns=${basicColumns}
        .rows=${rows}
        .itemsPerPage=${10}
        .sort=${[{ key: "name", direction: "ascending" }]}
      ></sgds-data-table>
    `);
    await settle(el);
    await expect(el).to.be.accessible();
  });

  it("data mode with filters, multiSelect and pagination should be accessible", async () => {
    const el = await fixture<SgdsDataTable>(html`
      <sgds-data-table
        label="Staff directory"
        .columns=${columns}
        .rows=${rows}
        .itemsPerPage=${3}
        .selectedKeys=${[1]}
        showGlobalFilter
        multiSelect
        multiSort
      ></sgds-data-table>
    `);
    await settle(el);
    await expect(el).to.be.accessible();
  });

  it("empty data mode should be accessible", async () => {
    const el = await fixture<SgdsDataTable>(html`
      <sgds-data-table label="Staff directory" .columns=${columns} .rows=${[]}>
        <div slot="no-data">No staff match your search</div>
      </sgds-data-table>
    `);
    await settle(el);
    await expect(el).to.be.accessible();
  });

  it("loading data mode should be accessible", async () => {
    const el = await fixture<SgdsDataTable>(html`
      <sgds-data-table label="Staff directory" loading .columns=${columns} .rows=${rows}></sgds-data-table>
    `);
    await settle(el);
    await expect(el).to.be.accessible();
  });

  it("dense data mode with sticky header should be accessible", async () => {
    const el = await fixture<SgdsDataTable>(html`
      <sgds-data-table
        label="Staff directory"
        density="dense"
        stickyHeader
        style="--sgds-data-table-max-height: 160px;"
        .columns=${columns}
        .rows=${rows}
        .itemsPerPage=${10}
      ></sgds-data-table>
    `);
    await settle(el);
    await expect(el).to.be.accessible();
  });
});
