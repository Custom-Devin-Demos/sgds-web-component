import { css, nothing } from "lit";
import { property } from "lit/decorators.js";
import SgdsElement from "../../base/sgds-element";
import type { SgdsDataTableColumnDefinition } from "./types";

/**
 * @summary Declarative column definition for `sgds-data-table` data mode. Renders nothing itself;
 * place it as a light-DOM child of `sgds-data-table` and supply row objects through the table's `rows` property.
 * Ignored when the table's `columns` property is non-empty.
 */
export class SgdsDataTableColumn extends SgdsElement {
  static styles = [
    ...SgdsElement.styles,
    css`
      :host {
        display: none;
      }
    `
  ];

  /** Field on each row object rendered in this column. Also used as the column identity in sort and filter state. */
  @property({ type: String, reflect: true }) key = "";

  /** Visible header label. */
  @property({ type: String, reflect: true }) header = "";

  /** Enables sorting on this column. */
  @property({ type: Boolean, reflect: true }) sortable = false;

  /** Renders a per-column text filter for this column. */
  @property({ type: Boolean, reflect: true }) filterable = false;

  /** Horizontal alignment for header and body cells. */
  @property({ type: String, reflect: true }) align: "left" | "right" = "left";

  /** CSS width applied to the column, e.g. `120px` or `20%`. */
  @property({ type: String, reflect: true }) width: string | undefined;

  /** @internal Returns the column definition consumed by `sgds-data-table`. */
  toColumn(): SgdsDataTableColumnDefinition {
    return {
      key: this.key,
      header: this.header,
      sortable: this.sortable,
      filterable: this.filterable,
      align: this.align,
      width: this.width
    };
  }

  protected updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);
    this.emit("i-sgds-column-change", { composed: false });
  }

  render() {
    return nothing;
  }
}

export default SgdsDataTableColumn;
