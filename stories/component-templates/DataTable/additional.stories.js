import { html } from "lit";

const NoRowsTemplate = () => html`
  <sgds-data-table>
    <sgds-data-table-row>
      <sgds-data-table-head>#</sgds-data-table-head>
      <sgds-data-table-head>First name</sgds-data-table-head>
      <sgds-data-table-head>Last name</sgds-data-table-head>
      <sgds-data-table-head>Username</sgds-data-table-head>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const CustomNoDataTemplate = () => html`
  <sgds-data-table>
    <sgds-data-table-row>
      <sgds-data-table-head>#</sgds-data-table-head>
      <sgds-data-table-head>First name</sgds-data-table-head>
      <sgds-data-table-head>Last name</sgds-data-table-head>
      <sgds-data-table-head>Username</sgds-data-table-head>
    </sgds-data-table-row>
    <div slot="no-data" class="sgds:flex sgds:flex-col sgds:items-center">
      <div class="sgds:mb-paragraph-sm">
        <sgds-icon name="exclamation-circle-fill" size="xl" class="sgds:text-default"></sgds-icon>
      </div>
      No records found. Try adjusting your search or filters.
    </div>
  </sgds-data-table>
`;

const MultiSelectTemplate = () => html`
  <sgds-data-table currentPage="1" dataLength="3" itemsPerPage="5" multiSelect>
    <sgds-data-table-row>
      <sgds-data-table-head>#</sgds-data-table-head>
      <sgds-data-table-head>First name</sgds-data-table-head>
      <sgds-data-table-head>Last name</sgds-data-table-head>
      <sgds-data-table-head>Username</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>John</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@johndoe</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Jane</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@janedoe</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Bob</sgds-data-table-cell>
      <sgds-data-table-cell>Smith</sgds-data-table-cell>
      <sgds-data-table-cell>@bobsmith</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const MultiSelectRowSelectEventTemplate = () => html`
  <div class="event-demo">
    <sgds-data-table
      currentPage="1"
      dataLength="6"
      itemsPerPage="3"
      multiSelect
      @sgds-row-select=${e => {
        const output = e.target.closest(".event-demo")?.querySelector(".event-output");
        if (output) output.textContent = JSON.stringify(e.detail, null, 2);
      }}
    >
      <sgds-data-table-row>
        <sgds-data-table-head>#</sgds-data-table-head>
        <sgds-data-table-head>First name</sgds-data-table-head>
        <sgds-data-table-head>Last name</sgds-data-table-head>
        <sgds-data-table-head>Username</sgds-data-table-head>
      </sgds-data-table-row>
      <sgds-data-table-row>
        <sgds-data-table-cell>1</sgds-data-table-cell>
        <sgds-data-table-cell>John</sgds-data-table-cell>
        <sgds-data-table-cell>Doe</sgds-data-table-cell>
        <sgds-data-table-cell>@johndoe</sgds-data-table-cell>
      </sgds-data-table-row>
      <sgds-data-table-row>
        <sgds-data-table-cell>2</sgds-data-table-cell>
        <sgds-data-table-cell>Jane</sgds-data-table-cell>
        <sgds-data-table-cell>Doe</sgds-data-table-cell>
        <sgds-data-table-cell>@janedoe</sgds-data-table-cell>
      </sgds-data-table-row>
      <sgds-data-table-row>
        <sgds-data-table-cell>3</sgds-data-table-cell>
        <sgds-data-table-cell>Bob</sgds-data-table-cell>
        <sgds-data-table-cell>Smith</sgds-data-table-cell>
        <sgds-data-table-cell>@bobsmith</sgds-data-table-cell>
      </sgds-data-table-row>
      <sgds-data-table-row>
        <sgds-data-table-cell>4</sgds-data-table-cell>
        <sgds-data-table-cell>Amy</sgds-data-table-cell>
        <sgds-data-table-cell>Tan</sgds-data-table-cell>
        <sgds-data-table-cell>@amytan</sgds-data-table-cell>
      </sgds-data-table-row>
      <sgds-data-table-row>
        <sgds-data-table-cell>5</sgds-data-table-cell>
        <sgds-data-table-cell>Ben</sgds-data-table-cell>
        <sgds-data-table-cell>Ho</sgds-data-table-cell>
        <sgds-data-table-cell>@benho</sgds-data-table-cell>
      </sgds-data-table-row>
      <sgds-data-table-row>
        <sgds-data-table-cell>6</sgds-data-table-cell>
        <sgds-data-table-cell>Cara</sgds-data-table-cell>
        <sgds-data-table-cell>Lim</sgds-data-table-cell>
        <sgds-data-table-cell>@caralim</sgds-data-table-cell>
      </sgds-data-table-row>
    </sgds-data-table>
    <pre class="event-output sgds:mt-4 sgds:p-4 sgds:bg-alternate sgds:rounded-sm sgds:text-label-sm">
Check a row to see the sgds-row-select event detail</pre
    >
  </div>
`;

const MultiSelectPrecheckedOnLoadTemplate = () => html`
  <sgds-data-table currentPage="1" dataLength="3" itemsPerPage="5" multiSelect>
    <sgds-data-table-row>
      <sgds-data-table-head>#</sgds-data-table-head>
      <sgds-data-table-head>First name</sgds-data-table-head>
      <sgds-data-table-head>Last name</sgds-data-table-head>
      <sgds-data-table-head>Username</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>John</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@johndoe</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row checked>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Jane</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@janedoe</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Bob</sgds-data-table-cell>
      <sgds-data-table-cell>Smith</sgds-data-table-cell>
      <sgds-data-table-cell>@bobsmith</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const ExpandableRowsTemplate = () => html`
  <sgds-data-table currentPage="1" dataLength="3" itemsPerPage="5">
    <sgds-data-table-row>
      <sgds-data-table-head>#</sgds-data-table-head>
      <sgds-data-table-head>First name</sgds-data-table-head>
      <sgds-data-table-head>Last name</sgds-data-table-head>
      <sgds-data-table-head>Username</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row expand open>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>John</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@johndoe</sgds-data-table-cell>
      <div slot="content">
        <div class="sgds:rounded-sm">
          <sgds-table>
            <sgds-table-row>
              <sgds-table-head>Case ID</sgds-table-head>
              <sgds-table-head>Owner</sgds-table-head>
              <sgds-table-head>Category</sgds-table-head>
              <sgds-table-head>Amount</sgds-table-head>
              <sgds-table-head>Status</sgds-table-head>
            </sgds-table-row>

            <sgds-table-row>
              <sgds-table-cell>OPS-2026-001</sgds-table-cell>
              <sgds-table-cell>Amy Tan</sgds-table-cell>
              <sgds-table-cell><sgds-badge variant="info" outlined>Operations</sgds-badge></sgds-table-cell>
              <sgds-table-cell>12,450.00</sgds-table-cell>
              <sgds-table-cell><sgds-badge variant="warning" outlined>Review</sgds-badge></sgds-table-cell>
            </sgds-table-row>

            <sgds-table-row>
              <sgds-table-cell>FIN-2026-014</sgds-table-cell>
              <sgds-table-cell>Ben Ho</sgds-table-cell>
              <sgds-table-cell><sgds-badge variant="purple" outlined>Finance</sgds-badge></sgds-table-cell>
              <sgds-table-cell>3,180.00</sgds-table-cell>
              <sgds-table-cell><sgds-badge variant="success" outlined>Approved</sgds-badge></sgds-table-cell>
            </sgds-table-row>

            <sgds-table-row>
              <sgds-table-cell>SEC-2026-007</sgds-table-cell>
              <sgds-table-cell>Cara Lim</sgds-table-cell>
              <sgds-table-cell><sgds-badge variant="danger" outlined>Security</sgds-badge></sgds-table-cell>
              <sgds-table-cell>28,900.00</sgds-table-cell>
              <sgds-table-cell><sgds-badge variant="danger" outlined>Escalated</sgds-badge></sgds-table-cell>
            </sgds-table-row>
          </sgds-table>
        </div>
      </div>
    </sgds-data-table-row>
    <sgds-data-table-row expand>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Jane</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@janedoe</sgds-data-table-cell>
      <div slot="content">
        <div class="sgds:rounded-sm">
          <sgds-table>
            <sgds-table-row>
              <sgds-table-head>Case ID</sgds-table-head>
              <sgds-table-head>Owner</sgds-table-head>
              <sgds-table-head>Category</sgds-table-head>
              <sgds-table-head>Amount</sgds-table-head>
              <sgds-table-head>Status</sgds-table-head>
            </sgds-table-row>

            <sgds-table-row>
              <sgds-table-cell>OPS-2026-019</sgds-table-cell>
              <sgds-table-cell>Faye Low</sgds-table-cell>
              <sgds-table-cell><sgds-badge variant="info" outlined>Design</sgds-badge></sgds-table-cell>
              <sgds-table-cell>4,560.00</sgds-table-cell>
              <sgds-table-cell><sgds-badge variant="warning" outlined>In Review</sgds-badge></sgds-table-cell>
            </sgds-table-row>

            <sgds-table-row>
              <sgds-table-cell>OPS-2026-021</sgds-table-cell>
              <sgds-table-cell>Glen Neo</sgds-table-cell>
              <sgds-table-cell><sgds-badge variant="primary" outlined>Operations</sgds-badge></sgds-table-cell>
              <sgds-table-cell>2,330.00</sgds-table-cell>
              <sgds-table-cell><sgds-badge variant="success" outlined>Completed</sgds-badge></sgds-table-cell>
            </sgds-table-row>
          </sgds-table>
        </div>
      </div>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Bob</sgds-data-table-cell>
      <sgds-data-table-cell>Smith</sgds-data-table-cell>
      <sgds-data-table-cell>@bobsmith</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const ExpandableMultiSelectTemplate = () => html`
  <sgds-data-table currentPage="1" dataLength="3" itemsPerPage="5" multiSelect>
    <sgds-data-table-row>
      <sgds-data-table-head>#</sgds-data-table-head>
      <sgds-data-table-head>First name</sgds-data-table-head>
      <sgds-data-table-head>Last name</sgds-data-table-head>
      <sgds-data-table-head>Username</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row expand>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>John</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@johndoe</sgds-data-table-cell>
      <div slot="content">
        <div class="sgds:rounded-sm">Department: Engineering</div>
      </div>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Jane</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@janedoe</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Bob</sgds-data-table-cell>
      <sgds-data-table-cell>Smith</sgds-data-table-cell>
      <sgds-data-table-cell>@bobsmith</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const CustomPaginationSummaryTemplate = () => html`
  <sgds-data-table currentPage="1" dataLength="4" itemsPerPage="2" paginationSummary="Showing 2 out of 4 records">
    <sgds-data-table-row>
      <sgds-data-table-head>ID</sgds-data-table-head>
      <sgds-data-table-head>Name</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>Amy</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Ben</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Cara</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>4</sgds-data-table-cell>
      <sgds-data-table-cell>Dan</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const HeaderAndCellPropsTemplate = () => html`
  <sgds-data-table layout="fixed" currentPage="1" dataLength="4" itemsPerPage="4">
    <sgds-data-table-row>
      <sgds-data-table-head>ID</sgds-data-table-head>
      <sgds-data-table-head sorting sortKey="name">Name</sgds-data-table-head>
      <sgds-data-table-head>Role</sgds-data-table-head>
      <sgds-data-table-head sorting sortKey="score" textAlign="right">Score</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>Lina</sgds-data-table-cell>
      <sgds-data-table-cell>Engineer</sgds-data-table-cell>
      <sgds-data-table-cell>82</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Adam</sgds-data-table-cell>
      <sgds-data-table-cell>Engineer</sgds-data-table-cell>
      <sgds-data-table-cell>70</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Nora</sgds-data-table-cell>
      <sgds-data-table-cell>Manager</sgds-data-table-cell>
      <sgds-data-table-cell>85</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const DefaultSortTemplate = () => html`
  <sgds-data-table currentPage="1" dataLength="4" itemsPerPage="4">
    <sgds-data-table-row>
      <sgds-data-table-head sorting sortKey="id">ID</sgds-data-table-head>
      <sgds-data-table-head sorting sortKey="name" sortDirection="ascending">Name</sgds-data-table-head>
      <sgds-data-table-head>Role</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Alice</sgds-data-table-cell>
      <sgds-data-table-cell>Engineer</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>4</sgds-data-table-cell>
      <sgds-data-table-cell>Ben</sgds-data-table-cell>
      <sgds-data-table-cell>Analyst</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>Chloe</sgds-data-table-cell>
      <sgds-data-table-cell>Manager</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Darren</sgds-data-table-cell>
      <sgds-data-table-cell>Designer</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const SortingWithNoRowsTemplate = () => html`
  <sgds-data-table>
    <sgds-data-table-row>
      <sgds-data-table-head sorting sortKey="id">ID</sgds-data-table-head>
      <sgds-data-table-head sorting sortKey="name">Name</sgds-data-table-head>
      <sgds-data-table-head sorting sortKey="role">Role</sgds-data-table-head>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const HeaderAlignmentTemplate = () => html`
  <sgds-data-table dataLength="3" itemsPerPage="5" currentPage="1">
    <sgds-data-table-row>
      <sgds-data-table-head>ID</sgds-data-table-head>
      <sgds-data-table-head>Name</sgds-data-table-head>
      <sgds-data-table-head>Category</sgds-data-table-head>
      <sgds-data-table-head textAlign="right">Quantity</sgds-data-table-head>
      <sgds-data-table-head textAlign="right">Amount</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>Amy Tan</sgds-data-table-cell>
      <sgds-data-table-cell>Operations</sgds-data-table-cell>
      <sgds-data-table-cell>12</sgds-data-table-cell>
      <sgds-data-table-cell>125.00</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Ben Ho</sgds-data-table-cell>
      <sgds-data-table-cell>Finance</sgds-data-table-cell>
      <sgds-data-table-cell>5</sgds-data-table-cell>
      <sgds-data-table-cell>98.30</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Cara Lim</sgds-data-table-cell>
      <sgds-data-table-cell>Security</sgds-data-table-cell>
      <sgds-data-table-cell>28</sgds-data-table-cell>
      <sgds-data-table-cell>302.10</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const LoadingTemplate = () => html`
  <sgds-data-table loading currentPage="1" dataLength="3" itemsPerPage="5">
    <sgds-data-table-row>
      <sgds-data-table-head>#</sgds-data-table-head>
      <sgds-data-table-head>First name</sgds-data-table-head>
      <sgds-data-table-head>Last name</sgds-data-table-head>
      <sgds-data-table-head>Username</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>John</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@johndoe</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Jane</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@janedoe</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Bob</sgds-data-table-cell>
      <sgds-data-table-cell>Smith</sgds-data-table-cell>
      <sgds-data-table-cell>@bobsmith</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const LoadingExpandableTemplate = () => html`
  <sgds-data-table loading currentPage="1" dataLength="3" itemsPerPage="5">
    <sgds-data-table-row>
      <sgds-data-table-head>#</sgds-data-table-head>
      <sgds-data-table-head>First name</sgds-data-table-head>
      <sgds-data-table-head>Last name</sgds-data-table-head>
      <sgds-data-table-head>Username</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row expand open>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>John</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@johndoe</sgds-data-table-cell>
      <div slot="content">Department: Engineering</div>
    </sgds-data-table-row>
    <sgds-data-table-row expand>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Jane</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@janedoe</sgds-data-table-cell>
      <div slot="content">Department: Design</div>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Bob</sgds-data-table-cell>
      <sgds-data-table-cell>Smith</sgds-data-table-cell>
      <sgds-data-table-cell>@bobsmith</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const LoadingMultiSelectTemplate = () => html`
  <sgds-data-table loading currentPage="1" dataLength="3" itemsPerPage="5" multiSelect>
    <sgds-data-table-row>
      <sgds-data-table-head>#</sgds-data-table-head>
      <sgds-data-table-head>First name</sgds-data-table-head>
      <sgds-data-table-head>Last name</sgds-data-table-head>
      <sgds-data-table-head>Username</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>John</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@johndoe</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>2</sgds-data-table-cell>
      <sgds-data-table-cell>Jane</sgds-data-table-cell>
      <sgds-data-table-cell>Doe</sgds-data-table-cell>
      <sgds-data-table-cell>@janedoe</sgds-data-table-cell>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>3</sgds-data-table-cell>
      <sgds-data-table-cell>Bob</sgds-data-table-cell>
      <sgds-data-table-cell>Smith</sgds-data-table-cell>
      <sgds-data-table-cell>@bobsmith</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const ServerLoadingTemplate = () => html`
  <sgds-data-table mode="server" loading dataLength="50" itemsPerPage="10" currentPage="1">
    <sgds-data-table-row>
      <sgds-data-table-head>ID</sgds-data-table-head>
      <sgds-data-table-head>Name</sgds-data-table-head>
      <sgds-data-table-head textAlign="right">Amount</sgds-data-table-head>
    </sgds-data-table-row>
    <sgds-data-table-row>
      <sgds-data-table-cell>1</sgds-data-table-cell>
      <sgds-data-table-cell>Citizen 1</sgds-data-table-cell>
      <sgds-data-table-cell>42</sgds-data-table-cell>
    </sgds-data-table-row>
  </sgds-data-table>
`;

const SortEventTemplate = () => html`
  <div class="event-demo">
    <sgds-data-table
      mode="server"
      serverSort
      currentPage="1"
      dataLength="3"
      itemsPerPage="5"
      @sgds-sort=${e => {
        const output = e.target.closest(".event-demo")?.querySelector(".event-output");
        if (output) output.textContent = JSON.stringify(e.detail, null, 2);
      }}
    >
      <sgds-data-table-row>
        <sgds-data-table-head sorting sortKey="id">ID</sgds-data-table-head>
        <sgds-data-table-head sorting sortKey="name">Name</sgds-data-table-head>
        <sgds-data-table-head sorting sortKey="role">Role</sgds-data-table-head>
      </sgds-data-table-row>
      <sgds-data-table-row>
        <sgds-data-table-cell>1</sgds-data-table-cell>
        <sgds-data-table-cell>Alice</sgds-data-table-cell>
        <sgds-data-table-cell>Engineer</sgds-data-table-cell>
      </sgds-data-table-row>
      <sgds-data-table-row>
        <sgds-data-table-cell>2</sgds-data-table-cell>
        <sgds-data-table-cell>Ben</sgds-data-table-cell>
        <sgds-data-table-cell>Analyst</sgds-data-table-cell>
      </sgds-data-table-row>
      <sgds-data-table-row>
        <sgds-data-table-cell>3</sgds-data-table-cell>
        <sgds-data-table-cell>Chloe</sgds-data-table-cell>
        <sgds-data-table-cell>Manager</sgds-data-table-cell>
      </sgds-data-table-row>
    </sgds-data-table>
    <pre
      class="event-output"
      style="margin-top: 1rem; padding: 1rem; background: var(--sgds-color-bg-neutral-subtle, #f5f5f5); border-radius: 4px; font-size: 0.875rem; min-height: 2.5rem;"
    >
Click a sort header to see the sgds-sort event detail</pre
    >
  </div>
`;

export const NoRows = {
  render: NoRowsTemplate.bind({}),
  name: "No rows",
  args: {},
  parameters: {}
};

export const CustomNoData = {
  render: CustomNoDataTemplate.bind({}),
  name: "Custom no-data slot",
  args: {},
  parameters: {}
};

export const MultiSelect = {
  render: MultiSelectTemplate.bind({}),
  name: "Multi-select",
  args: {},
  parameters: {}
};

export const MultiSelectRowSelectEvent = {
  render: MultiSelectRowSelectEventTemplate.bind({}),
  name: "Multi-select row select event",
  args: {},
  parameters: {}
};

export const MultiSelectPrecheckedOnLoad = {
  render: MultiSelectPrecheckedOnLoadTemplate.bind({}),
  name: "Multi-select pre-checked on load",
  args: {},
  parameters: {}
};

export const ExpandableRows = {
  render: ExpandableRowsTemplate.bind({}),
  name: "Expandable rows",
  args: {},
  parameters: {}
};

export const ExpandableMultiSelect = {
  render: ExpandableMultiSelectTemplate.bind({}),
  name: "Expandable with multi-select",
  args: {},
  parameters: {}
};

export const PaginationVariantDescription = {
  render: Template.bind({}),
  name: "Pagination variant: description",
  args: { ...args, paginationVariant: "description" },
  parameters: {}
};

export const PaginationVariantNumber = {
  render: Template.bind({}),
  name: "Pagination variant: number",
  args: { ...args, paginationVariant: "number" },
  parameters: {}
};

export const PaginationVariantButton = {
  render: Template.bind({}),
  name: "Pagination variant: button",
  args: { ...args, paginationVariant: "button" },
  parameters: {}
};

export const CustomPaginationSummary = {
  render: CustomPaginationSummaryTemplate.bind({}),
  name: "Custom pagination summary",
  args: {},
  parameters: {}
};

export const HeaderAndCellProps = {
  render: HeaderAndCellPropsTemplate.bind({}),
  name: "Header and cell props",
  args: {},
  parameters: {}
};

export const DefaultSort = {
  render: DefaultSortTemplate.bind({}),
  name: "Default sort",
  args: {},
  parameters: {}
};

export const SortingWithNoRows = {
  render: SortingWithNoRowsTemplate.bind({}),
  name: "Sorting with no rows",
  args: {},
  parameters: {}
};

export const HeaderTextAlignment = {
  render: HeaderAlignmentTemplate.bind({}),
  name: "Header text alignment",
  args: {},
  parameters: {}
};

export const Loading = {
  render: LoadingTemplate.bind({}),
  name: "Loading",
  args: {},
  parameters: {}
};

export const LoadingExpandable = {
  render: LoadingExpandableTemplate.bind({}),
  name: "Loading (expandable)",
  args: {},
  parameters: {}
};

export const LoadingMultiSelect = {
  render: LoadingMultiSelectTemplate.bind({}),
  name: "Loading (multi-select)",
  args: {},
  parameters: {}
};

export const ServerLoading = {
  render: ServerLoadingTemplate.bind({}),
  name: "Server loading",
  args: {},
  parameters: {}
};

export const SortEvent = {
  render: SortEventTemplate.bind({}),
  name: "Sort event (server mode)",
  args: {},
  parameters: {}
};

/* ── Data mode ─────────────────────────────────────────────────── */

const dataModePeople = [
  { id: 1, name: "Amy Tan", department: "Finance", role: "Analyst", status: "Active", age: 28 },
  { id: 2, name: "Ben Lim", department: "Engineering", role: "Engineer", status: "Pending", age: 35 },
  { id: 3, name: "Cara Ng", department: "Engineering", role: "Manager", status: "Inactive", age: 31 },
  { id: 4, name: "Dan Koh", department: "Operations", role: "Officer", status: "Active", age: 26 },
  { id: 5, name: "Eli Goh", department: "Finance", role: "Manager", status: "Pending", age: 40 },
  { id: 6, name: "Faye Chua", department: "Policy", role: "Analyst", status: "Inactive", age: 29 },
  { id: 7, name: "Gabe Ong", department: "Engineering", role: "Engineer", status: "Active", age: 33 },
  { id: 8, name: "Hana Lee", department: "Operations", role: "Officer", status: "Pending", age: 24 },
  { id: 9, name: "Ivan Teo", department: "Policy", role: "Manager", status: "Inactive", age: 37 },
  { id: 10, name: "Jade Wong", department: "Finance", role: "Analyst", status: "Active", age: 27 },
  { id: 11, name: "Kai Seah", department: "Engineering", role: "Engineer", status: "Pending", age: 30 },
  { id: 12, name: "Lena Yeo", department: "Operations", role: "Manager", status: "Inactive", age: 38 },
  { id: 13, name: "Milo Chan", department: "Policy", role: "Officer", status: "Active", age: 25 },
  { id: 14, name: "Nora Pang", department: "Finance", role: "Engineer", status: "Pending", age: 34 },
  { id: 15, name: "Owen Low", department: "Engineering", role: "Analyst", status: "Inactive", age: 32 },
  { id: 16, name: "Pia Quek", department: "Operations", role: "Engineer", status: "Active", age: 36 },
  { id: 17, name: "Quinn Ho", department: "Policy", role: "Analyst", status: "Pending", age: 41 },
  { id: 18, name: "Rina Sim", department: "Finance", role: "Officer", status: "Active", age: 23 },
  { id: 19, name: "Sam Foo", department: "Engineering", role: "Manager", status: "Inactive", age: 39 },
  { id: 20, name: "Tara Kwek", department: "Operations", role: "Analyst", status: "Active", age: 30 }
];

const dataModeColumns = [
  { key: "name", header: "Name", sortable: true },
  { key: "department", header: "Department", sortable: true },
  { key: "role", header: "Role", sortable: true },
  { key: "status", header: "Status", sortable: true },
  { key: "age", header: "Age", sortable: true, align: "right" }
];

const dataModeFilterableColumns = dataModeColumns.map(column =>
  column.key === "age" ? column : { ...column, filterable: true }
);

const dataModeStatusVariant = status =>
  status === "Active" ? "success" : status === "Pending" ? "warning" : "neutral";

const dataModeArgs = {
  label: "Staff directory",
  columns: dataModeColumns,
  rows: dataModePeople,
  rowKey: "id",
  sort: [],
  multiSort: false,
  globalFilter: "",
  columnFilters: {},
  showGlobalFilter: false,
  serverFilter: false,
  multiSelect: false,
  selectedKeys: [],
  density: "comfortable",
  stickyHeader: false,
  loading: false,
  mode: "client",
  serverSort: false,
  currentPage: 1,
  itemsPerPage: 5,
  dataLength: 0,
  paginationVariant: "default",
  paginationSummary: ""
};

const DataModeTemplate = args => html`
  <sgds-data-table
    label=${args.label}
    .columns=${args.columns}
    .rows=${args.rows}
    .rowKey=${args.rowKey}
    .sort=${args.sort}
    .multiSort=${args.multiSort}
    .globalFilter=${args.globalFilter}
    .columnFilters=${args.columnFilters}
    .showGlobalFilter=${args.showGlobalFilter}
    .serverFilter=${args.serverFilter}
    .multiSelect=${args.multiSelect}
    .selectedKeys=${args.selectedKeys}
    .density=${args.density}
    .stickyHeader=${args.stickyHeader}
    .loading=${args.loading}
    .mode=${args.mode}
    .serverSort=${args.serverSort}
    .currentPage=${args.currentPage}
    .itemsPerPage=${args.itemsPerPage}
    .dataLength=${args.dataLength}
    .paginationVariant=${args.paginationVariant}
    .paginationSummary=${args.paginationSummary}
  ></sgds-data-table>
`;

const DataModeColumnChildrenTemplate = args => html`
  <sgds-data-table label=${args.label} .rows=${args.rows} .itemsPerPage=${args.itemsPerPage}>
    <sgds-data-table-column key="name" header="Name" sortable></sgds-data-table-column>
    <sgds-data-table-column key="department" header="Department" sortable filterable></sgds-data-table-column>
    <sgds-data-table-column key="role" header="Role"></sgds-data-table-column>
    <sgds-data-table-column key="age" header="Age" sortable align="right" width="96px"></sgds-data-table-column>
  </sgds-data-table>
`;

const DataModeMultiSortTemplate = args => html`
  <p class="sgds:text-body-md sgds:mb-layout-xs">
    Activate a header to sort by that column. Hold Shift while you click, or press Shift + Enter, to add another column
    to the sort.
  </p>
  ${DataModeTemplate(args)}
`;

const dataModeServerFetch = ({ sort, globalFilter, columnFilters, currentPage, itemsPerPage }) => {
  const query = (globalFilter || "").toLowerCase();
  const filtered = dataModePeople.filter(row => {
    const matchesGlobal =
      !query || dataModeColumns.some(column => String(row[column.key]).toLowerCase().includes(query));
    const matchesColumns = Object.entries(columnFilters || {}).every(
      ([key, value]) => !value || String(row[key]).toLowerCase().includes(value.toLowerCase())
    );
    return matchesGlobal && matchesColumns;
  });
  const sorted = [...filtered].sort((left, right) => {
    for (const { key, direction } of sort || []) {
      const result = String(left[key]).localeCompare(String(right[key]), undefined, { numeric: true });
      if (result !== 0) return direction === "ascending" ? result : -result;
    }
    return 0;
  });
  const start = (currentPage - 1) * itemsPerPage;
  return { rows: sorted.slice(start, start + itemsPerPage), total: sorted.length };
};

const DataModeServerTemplate = args => {
  const initial = dataModeServerFetch({
    sort: [],
    globalFilter: "",
    columnFilters: {},
    currentPage: 1,
    itemsPerPage: args.itemsPerPage
  });
  const reload = (event, eventName) => {
    const table = event.currentTarget;
    const output = table.closest(".event-demo")?.querySelector(".event-output");
    if (output) output.textContent = `${eventName}\n${JSON.stringify(event.detail, null, 2)}`;
    table.loading = true;
    window.setTimeout(() => {
      const currentPage = eventName === "sgds-page-change" ? event.detail.currentPage : table.currentPage;
      const { rows, total } = dataModeServerFetch({
        sort: table.sort,
        globalFilter: table.globalFilter,
        columnFilters: table.columnFilters,
        currentPage,
        itemsPerPage: table.itemsPerPage
      });
      table.rows = rows;
      table.dataLength = total;
      table.loading = false;
    }, 400);
  };
  return html`
    <div class="event-demo">
      <sgds-data-table
        label="Staff directory (server)"
        mode="server"
        serverSort
        serverFilter
        showGlobalFilter
        .columns=${dataModeFilterableColumns}
        .rows=${initial.rows}
        .dataLength=${initial.total}
        .itemsPerPage=${args.itemsPerPage}
        @sgds-sort=${e => reload(e, "sgds-sort")}
        @sgds-filter=${e => reload(e, "sgds-filter")}
        @sgds-page-change=${e => reload(e, "sgds-page-change")}
      ></sgds-data-table>
      <pre
        class="event-output sgds:mt-layout-xs sgds:p-component-md sgds:bg-surface-raised sgds:rounded-sm sgds:text-label-sm"
      >
Sort, filter, or change page to see the event detail</pre
      >
    </div>
  `;
};

const DataModeSelectionTemplate = args => html`
  <div class="event-demo">
    <sgds-data-table
      label=${args.label}
      multiSelect
      .columns=${args.columns}
      .rows=${args.rows}
      .selectedKeys=${args.selectedKeys}
      .itemsPerPage=${args.itemsPerPage}
      @sgds-selection-change=${e => {
        const output = e.target.closest(".event-demo")?.querySelector(".event-output");
        if (output) output.textContent = JSON.stringify({ selectedKeys: e.detail.selectedKeys }, null, 2);
      }}
    ></sgds-data-table>
    <pre
      class="event-output sgds:mt-layout-xs sgds:p-component-md sgds:bg-surface-raised sgds:rounded-sm sgds:text-label-sm"
    >
Select a row to see the sgds-selection-change event detail</pre
    >
  </div>
`;

const DataModeStickyHeaderTemplate = args => html`
  <sgds-data-table
    style="--sgds-data-table-max-height: 320px;"
    label=${args.label}
    stickyHeader
    .columns=${args.columns}
    .rows=${args.rows}
    .itemsPerPage=${args.itemsPerPage}
  ></sgds-data-table>
`;

const DataModeEmptyTemplate = args => html`
  <sgds-data-table label=${args.label} showGlobalFilter .columns=${args.columns} .rows=${[]}>
    <div slot="no-data" class="sgds:flex sgds:flex-col sgds:items-center">
      <div class="sgds:mb-paragraph-sm">
        <sgds-icon name="exclamation-circle-fill" size="xl" class="sgds:text-default"></sgds-icon>
      </div>
      No staff found. Try adjusting your search or filters.
    </div>
  </sgds-data-table>
`;

const dataModeRenderColumns = [
  { key: "name", header: "Name", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: value => html`<sgds-badge variant=${dataModeStatusVariant(value)} outlined>${value}</sgds-badge>`
  },
  {
    key: "age",
    header: "Age",
    align: "right",
    sortable: true,
    accessor: row => row.age,
    render: value => `${value} years`
  },
  {
    key: "actions",
    header: "Actions",
    accessor: () => "",
    render: (_value, row) => html`<sgds-link><a href="#" aria-label=${`View ${row.name}`}>View</a></sgds-link>`
  }
];

const DataModeThemingTemplate = args => html`
  <style>
    .data-table-themed {
      --sgds-data-table-header-bg: var(--sgds-primary-surface-muted);
      --sgds-data-table-border-color: var(--sgds-primary-border-color-muted);
      --sgds-data-table-row-hover-bg: var(--sgds-primary-surface-translucent);
      --sgds-data-table-row-selected-bg: var(--sgds-primary-surface-muted);
      --sgds-data-table-cell-padding-inline: var(--sgds-padding-lg);
    }
    .data-table-themed::part(header-cell) {
      font-weight: var(--sgds-font-weight-bold);
    }
    .data-table-themed::part(footer) {
      border-top: var(--sgds-border-width-1) solid var(--sgds-primary-border-color-muted);
    }
  </style>
  <sgds-data-table
    class="data-table-themed"
    label=${args.label}
    multiSelect
    .columns=${args.columns}
    .rows=${args.rows}
    .selectedKeys=${[2]}
    .itemsPerPage=${args.itemsPerPage}
  ></sgds-data-table>
`;

const DataModeKeyboardTemplate = args => html`
  <p class="sgds:text-body-md sgds:mb-layout-xs">
    Press Tab to move focus into the grid. Use the arrow keys to move between cells, Home and End to reach the first and
    last cell of a row, and Ctrl + Home or Ctrl + End to reach the first or last cell of the grid. Press Enter or Space
    on a header to sort, or on a checkbox cell to select. PageUp and PageDown change the page.
  </p>
  ${DataModeTemplate(args)}
`;

export const DataModeColumns = {
  render: DataModeTemplate.bind({}),
  name: "Data mode: columns property",
  args: { ...dataModeArgs },
  parameters: {}
};

export const DataModeColumnChildren = {
  render: DataModeColumnChildrenTemplate.bind({}),
  name: "Data mode: column elements",
  args: { ...dataModeArgs },
  parameters: {}
};

export const DataModeSort = {
  render: DataModeTemplate.bind({}),
  name: "Data mode: sort",
  args: { ...dataModeArgs, sort: [{ key: "name", direction: "ascending" }] },
  parameters: {}
};

export const DataModeMultiSort = {
  render: DataModeMultiSortTemplate.bind({}),
  name: "Data mode: multi-column sort",
  args: {
    ...dataModeArgs,
    multiSort: true,
    sort: [
      { key: "department", direction: "ascending" },
      { key: "age", direction: "descending" }
    ]
  },
  parameters: {}
};

export const DataModeGlobalFilter = {
  render: DataModeTemplate.bind({}),
  name: "Data mode: global filter",
  args: { ...dataModeArgs, showGlobalFilter: true },
  parameters: {}
};

export const DataModeColumnFilters = {
  render: DataModeTemplate.bind({}),
  name: "Data mode: column filters",
  args: { ...dataModeArgs, columns: dataModeFilterableColumns, columnFilters: { department: "eng" } },
  parameters: {}
};

export const DataModePagination = {
  render: DataModeTemplate.bind({}),
  name: "Data mode: client pagination",
  args: { ...dataModeArgs, itemsPerPage: 5, paginationVariant: "number" },
  parameters: {}
};

export const DataModeServer = {
  render: DataModeServerTemplate.bind({}),
  name: "Data mode: server mode",
  args: { ...dataModeArgs, itemsPerPage: 5 },
  parameters: {}
};

export const DataModeMultiSelect = {
  render: DataModeSelectionTemplate.bind({}),
  name: "Data mode: multi-select",
  args: { ...dataModeArgs, selectedKeys: [1, 3] },
  parameters: {}
};

export const DataModeDense = {
  render: DataModeTemplate.bind({}),
  name: "Data mode: dense density",
  args: { ...dataModeArgs, density: "dense", itemsPerPage: 10 },
  parameters: {}
};

export const DataModeStickyHeader = {
  render: DataModeStickyHeaderTemplate.bind({}),
  name: "Data mode: sticky header",
  args: { ...dataModeArgs, itemsPerPage: 20 },
  parameters: {}
};

export const DataModeLoading = {
  render: DataModeTemplate.bind({}),
  name: "Data mode: loading",
  args: { ...dataModeArgs, loading: true, rows: [] },
  parameters: {}
};

export const DataModeEmpty = {
  render: DataModeEmptyTemplate.bind({}),
  name: "Data mode: empty with custom no-data slot",
  args: { ...dataModeArgs },
  parameters: {}
};

export const DataModeCustomRender = {
  render: DataModeTemplate.bind({}),
  name: "Data mode: custom cell render",
  args: { ...dataModeArgs, columns: dataModeRenderColumns },
  parameters: {}
};

export const DataModeTheming = {
  render: DataModeThemingTemplate.bind({}),
  name: "Data mode: custom theming",
  args: { ...dataModeArgs },
  parameters: {}
};

export const DataModeKeyboard = {
  render: DataModeKeyboardTemplate.bind({}),
  name: "Data mode: keyboard navigation",
  args: { ...dataModeArgs, columns: dataModeFilterableColumns, multiSelect: true },
  parameters: {}
};
