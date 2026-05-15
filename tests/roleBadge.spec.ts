import { render } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import RoleBadge from "../src/components/ui/RoleBadge.vue";
import StatusBadge from "../src/components/ui/StatusBadge.vue";

describe("RoleBadge", () => {
  it("renders friendly label for each role", () => {
    expect(render(RoleBadge, { props: { role: "USER" } }).getByText("User")).toBeTruthy();
    expect(render(RoleBadge, { props: { role: "MANAGER" } }).getByText("Manager")).toBeTruthy();
    expect(render(RoleBadge, { props: { role: "SUPER_ADMIN" } }).getByText("Super Admin")).toBeTruthy();
  });
});

describe("StatusBadge", () => {
  it("renders Active and Inactive labels", () => {
    expect(render(StatusBadge, { props: { status: "ACTIVE" } }).getByText("Active")).toBeTruthy();
    expect(render(StatusBadge, { props: { status: "INACTIVE" } }).getByText("Inactive")).toBeTruthy();
  });
});
