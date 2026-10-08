import { html, LitElement } from "lit";
import { elementUpdated, expect, fixture } from "@open-wc/testing";
import { DataTableKeyboardController } from "../src/components/DataTable/data-table-keyboard";

interface ClickRecord {
  target: HTMLElement;
  shiftKey: boolean;
}

class KeyboardTestGrid extends LitElement {
  static properties = {
    shape: { attribute: false },
    withInput: { type: Boolean }
  };

  /** Number of cells in each row. */
  declare shape: number[];
  /** Renders an `input[data-cell-focus]` in cell (1, 0). */
  declare withInput: boolean;

  pageSteps: number[] = [];
  clicks: ClickRecord[] = [];

  keyboard = new DataTableKeyboardController(
    this,
    () => this.shadowRoot?.querySelector<HTMLElement>("[role='grid']") ?? null,
    { onPageStep: delta => this.pageSteps.push(delta) }
  );

  constructor() {
    super();
    this.shape = [3, 3, 3, 3];
    this.withInput = false;
  }

  private _renderCell(row: number, col: number) {
    const tabIndex = this.keyboard.tabIndexFor(row, col);
    if (row === 0) {
      return html`<th data-row=${row} data-col=${col} tabindex=${tabIndex}>
        <button data-activate tabindex="-1">H${col}</button>
      </th>`;
    }
    if (this.withInput && row === 1 && col === 0) {
      return html`<td data-row=${row} data-col=${col}>
        <input data-cell-focus tabindex=${tabIndex} aria-label="Filter" value="hello" />
      </td>`;
    }
    return html`<td data-row=${row} data-col=${col} tabindex=${tabIndex}>${row}-${col}</td>`;
  }

  render() {
    return html`<table
      role="grid"
      @keydown=${this.keyboard.handleKeydown}
      @click=${(e: MouseEvent) => this.clicks.push({ target: e.target as HTMLElement, shiftKey: e.shiftKey })}
    >
      <tbody>
        ${this.shape.map(
          (cols, row) =>
            html`<tr>
              ${Array.from({ length: cols }, (_, col) => this._renderCell(row, col))}
            </tr>`
        )}
      </tbody>
    </table>`;
  }
}

if (!customElements.get("test-keyboard-grid")) customElements.define("test-keyboard-grid", KeyboardTestGrid);

const cell = (el: KeyboardTestGrid, row: number, col: number) =>
  el.shadowRoot?.querySelector<HTMLElement>(`[data-row="${row}"][data-col="${col}"]`) as HTMLElement;

const focused = (el: KeyboardTestGrid) => el.shadowRoot?.activeElement as HTMLElement | null;

const press = (target: Element, key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};

const pressFocused = async (el: KeyboardTestGrid, key: string, init: KeyboardEventInit = {}) => {
  const event = press(focused(el) ?? cell(el, el.keyboard.active.row, el.keyboard.active.col), key, init);
  await elementUpdated(el);
  return event;
};

const tabStops = (el: KeyboardTestGrid) =>
  Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>("[role='grid'] [tabindex='0']") ?? []);

const expectActive = (el: KeyboardTestGrid, row: number, col: number) => {
  expect(el.keyboard.active).to.deep.equal({ row, col });
  const stops = tabStops(el);
  expect(stops.length, "exactly one tabindex=0").to.equal(1);
  const target = cell(el, row, col);
  expect(stops[0] === target || target.contains(stops[0])).to.be.true;
  expect(target.contains(focused(el))).to.be.true;
};

const setup = async (template = html`<test-keyboard-grid></test-keyboard-grid>`) => {
  const el = await fixture<KeyboardTestGrid>(template);
  cell(el, 0, 0).focus();
  await elementUpdated(el);
  return el;
};

describe("DataTableKeyboardController", () => {
  it("starts with a single tab stop on the first cell", async () => {
    const el = await fixture<KeyboardTestGrid>(html`<test-keyboard-grid></test-keyboard-grid>`);
    expect(el.keyboard.active).to.deep.equal({ row: 0, col: 0 });
    expect(tabStops(el)).to.deep.equal([cell(el, 0, 0)]);
    expect(el.shadowRoot?.querySelectorAll("[tabindex='-1']").length).to.equal(3 * 4 - 1 + 3);
  });

  it("moves one cell with the arrow keys and prevents default", async () => {
    const el = await setup();
    let event = await pressFocused(el, "ArrowDown");
    expect(event.defaultPrevented).to.be.true;
    expectActive(el, 1, 0);
    event = await pressFocused(el, "ArrowRight");
    expect(event.defaultPrevented).to.be.true;
    expectActive(el, 1, 1);
    await pressFocused(el, "ArrowRight");
    expectActive(el, 1, 2);
    await pressFocused(el, "ArrowUp");
    expectActive(el, 0, 2);
    await pressFocused(el, "ArrowLeft");
    expectActive(el, 0, 1);
  });

  it("stays put at the grid edges", async () => {
    const el = await setup();
    expect((await pressFocused(el, "ArrowUp")).defaultPrevented).to.be.true;
    expectActive(el, 0, 0);
    await pressFocused(el, "ArrowLeft");
    expectActive(el, 0, 0);
    el.keyboard.focusCell({ row: 3, col: 2 });
    await elementUpdated(el);
    await pressFocused(el, "ArrowDown");
    expectActive(el, 3, 2);
    await pressFocused(el, "ArrowRight");
    expectActive(el, 3, 2);
  });

  it("Home/End go to the first/last cell in the row", async () => {
    const el = await setup();
    el.keyboard.focusCell({ row: 2, col: 1 });
    await elementUpdated(el);
    expect((await pressFocused(el, "End")).defaultPrevented).to.be.true;
    expectActive(el, 2, 2);
    expect((await pressFocused(el, "Home")).defaultPrevented).to.be.true;
    expectActive(el, 2, 0);
  });

  it("Ctrl+Home/Ctrl+End go to the first/last cell in the grid", async () => {
    const el = await setup();
    el.keyboard.focusCell({ row: 1, col: 1 });
    await elementUpdated(el);
    expect((await pressFocused(el, "End", { ctrlKey: true })).defaultPrevented).to.be.true;
    expectActive(el, 3, 2);
    expect((await pressFocused(el, "Home", { ctrlKey: true })).defaultPrevented).to.be.true;
    expectActive(el, 0, 0);
  });

  it("PageUp/PageDown step pages through the callback", async () => {
    const el = await setup();
    const down = await pressFocused(el, "PageDown");
    const up = await pressFocused(el, "PageUp");
    expect(down.defaultPrevented).to.be.true;
    expect(up.defaultPrevented).to.be.true;
    expect(el.pageSteps).to.deep.equal([1, -1]);
  });

  it("ignores unrelated keys and Alt/Meta combinations", async () => {
    const el = await setup();
    expect((await pressFocused(el, "a")).defaultPrevented).to.be.false;
    expect((await pressFocused(el, "ArrowDown", { altKey: true })).defaultPrevented).to.be.false;
    expect((await pressFocused(el, "ArrowDown", { metaKey: true })).defaultPrevented).to.be.false;
    expectActive(el, 0, 0);
  });

  it("Enter dispatches a synthetic click on the [data-activate] element", async () => {
    const el = await setup();
    el.keyboard.focusCell({ row: 0, col: 1 });
    await elementUpdated(el);
    const event = await pressFocused(el, "Enter");
    expect(event.defaultPrevented).to.be.true;
    expect(el.clicks.length).to.equal(1);
    expect(el.clicks[0].target).to.equal(cell(el, 0, 1).querySelector("[data-activate]"));
    expect(el.clicks[0].shiftKey).to.be.false;
  });

  it("Shift+Space dispatches a click carrying shiftKey on the cell itself", async () => {
    const el = await setup();
    el.keyboard.focusCell({ row: 2, col: 2 });
    await elementUpdated(el);
    const event = await pressFocused(el, " ", { shiftKey: true });
    expect(event.defaultPrevented).to.be.true;
    expect(el.clicks.length).to.equal(1);
    expect(el.clicks[0].target).to.equal(cell(el, 2, 2));
    expect(el.clicks[0].shiftKey).to.be.true;
  });

  it("clamps to the last existing column when rows have different lengths", async () => {
    const el = await setup(html`<test-keyboard-grid .shape=${[3, 1, 3]}></test-keyboard-grid>`);
    el.keyboard.focusCell({ row: 0, col: 2 });
    await elementUpdated(el);
    await pressFocused(el, "ArrowDown");
    expectActive(el, 1, 0);
    await pressFocused(el, "End");
    expectActive(el, 1, 0);
    await pressFocused(el, "ArrowRight");
    expectActive(el, 1, 0);
    el.keyboard.focusCell({ row: 1, col: 5 });
    await elementUpdated(el);
    expectActive(el, 1, 0);
  });

  it("focusCell clamps out-of-range positions into the grid", async () => {
    const el = await setup();
    el.keyboard.focusCell({ row: 99, col: 99 });
    await elementUpdated(el);
    expectActive(el, 3, 2);
    el.keyboard.focusCell({ row: -5, col: -5 });
    await elementUpdated(el);
    expectActive(el, 0, 0);
  });

  it("tracks mouse/programmatic focus with focusin", async () => {
    const el = await setup();
    cell(el, 2, 1).focus();
    await elementUpdated(el);
    expectActive(el, 2, 1);
  });

  it("stops tracking focus after disconnect and resumes after reconnect", async () => {
    const el = await setup();
    const parent = el.parentElement as HTMLElement;
    el.remove();
    parent.appendChild(el);
    await elementUpdated(el);
    cell(el, 3, 1).focus();
    await elementUpdated(el);
    expectActive(el, 3, 1);
  });

  describe("inside a [data-cell-focus] input", () => {
    const setupInput = async () => {
      const el = await setup(html`<test-keyboard-grid withInput></test-keyboard-grid>`);
      el.keyboard.focusCell({ row: 1, col: 0 });
      await elementUpdated(el);
      return el;
    };

    it("puts the tab stop and focus on the input", async () => {
      const el = await setupInput();
      const input = cell(el, 1, 0).querySelector("input") as HTMLInputElement;
      expect(focused(el)).to.equal(input);
      expect(tabStops(el)).to.deep.equal([input]);
      expect(cell(el, 1, 0).hasAttribute("tabindex")).to.be.false;
    });

    it("does not intercept Left/Right/Home/End/Space/Enter", async () => {
      const el = await setupInput();
      for (const [key, init] of [
        ["ArrowLeft", {}],
        ["ArrowRight", {}],
        ["Home", {}],
        ["End", {}],
        ["Home", { ctrlKey: true }],
        ["End", { ctrlKey: true }],
        [" ", {}],
        ["Enter", {}]
      ] as [string, KeyboardEventInit][]) {
        const event = await pressFocused(el, key, init);
        expect(event.defaultPrevented, key).to.be.false;
        expectActive(el, 1, 0);
      }
      expect(el.clicks.length).to.equal(0);
    });

    it("leaves the input with Up/Down", async () => {
      const el = await setupInput();
      expect((await pressFocused(el, "ArrowDown")).defaultPrevented).to.be.true;
      expectActive(el, 2, 0);
      el.keyboard.focusCell({ row: 1, col: 0 });
      await elementUpdated(el);
      expect((await pressFocused(el, "ArrowUp")).defaultPrevented).to.be.true;
      expectActive(el, 0, 0);
    });
  });

  describe("after re-render", () => {
    it("restores focus to the clamped cell when rows are removed", async () => {
      const el = await setup();
      el.keyboard.focusCell({ row: 3, col: 2 });
      await elementUpdated(el);
      expectActive(el, 3, 2);
      el.shape = [3, 3];
      await elementUpdated(el);
      await elementUpdated(el);
      expectActive(el, 1, 2);
    });

    it("restores focus to the clamped column when a row gets shorter", async () => {
      const el = await setup();
      el.keyboard.focusCell({ row: 2, col: 2 });
      await elementUpdated(el);
      el.shape = [3, 3, 1, 3];
      await elementUpdated(el);
      await elementUpdated(el);
      expectActive(el, 2, 0);
    });

    it("clamps without stealing focus when focus was outside the grid", async () => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      const el = await setup();
      el.keyboard.focusCell({ row: 3, col: 2 });
      await elementUpdated(el);
      outside.focus();
      el.shape = [3];
      await elementUpdated(el);
      await elementUpdated(el);
      expect(el.keyboard.active).to.deep.equal({ row: 0, col: 2 });
      expect(tabStops(el)).to.deep.equal([cell(el, 0, 2)]);
      expect(document.activeElement).to.equal(outside);
      outside.remove();
    });

    it("keeps focus on a re-rendered cell that still exists", async () => {
      const el = await setup();
      el.keyboard.focusCell({ row: 1, col: 1 });
      await elementUpdated(el);
      el.shape = [3, 3, 3];
      await elementUpdated(el);
      expectActive(el, 1, 1);
    });
  });
});
