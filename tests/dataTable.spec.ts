import { render } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import DataTable from "../src/components/ui/DataTable.vue";

describe("DataTable", () => {
  it("renders rows with formatted cells", () => {
    const { getByText } = render(DataTable, {
      props: {
        columns: [
          { key: "name", label: "Name" },
          { key: "amount", label: "Amount", formatter: (value: unknown) => `Rp ${value}` }
        ],
        rows: [{ id: "1", name: "Sample", amount: 100 }]
      }
    });

    expect(getByText("Sample")).toBeTruthy();
    expect(getByText("Rp 100")).toBeTruthy();
  });

  it("shows empty message when there are no rows", () => {
    const { getByText } = render(DataTable, {
      props: {
        columns: [{ key: "name", label: "Name" }],
        rows: [],
        emptyMessage: "Nothing yet"
      }
    });

    expect(getByText("Nothing yet")).toBeTruthy();
  });
});
