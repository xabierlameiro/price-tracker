import { describe, expect, it } from "vitest";
import { API_ROUTES, APP_NAME, ROUTES } from "@/lib/constants";

describe("app setup", () => {
  it("should have APP_NAME defined", () => {
    expect(APP_NAME).toBeTruthy();
    expect(typeof APP_NAME).toBe("string");
  });

  it("should have ROUTES pointing to expected paths", () => {
    expect(ROUTES.home).toBe("/");
    expect(ROUTES.signIn).toMatch(/^\/auth/);
    expect(ROUTES.dashboard).toMatch(/^\//);
  });

  it("should have API_ROUTES defined", () => {
    expect(API_ROUTES.health).toBeTruthy();
  });
});
