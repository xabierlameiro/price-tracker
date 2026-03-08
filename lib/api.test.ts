import {
  AppError,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/errors";
import { describe, expect, it } from "vitest";
import { buildMeta } from "./api";
import { fail } from "./api";

describe("fail()", () => {
  it("should return 422 for a ZodError", async () => {
    const { z } = await import("zod");
    let zodError: unknown;
    try {
      z.string().min(5).parse("hi");
    } catch (error) {
      zodError = error;
    }
    const response = fail(zodError);
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("should return the AppError statusCode and code", () => {
    const error = new AppError("Something failed", "CUSTOM_CODE", 409);
    const response = fail(error);
    expect(response.status).toBe(409);
  });

  it("should return 401 for AuthenticationError", async () => {
    const error = new AuthenticationError();
    const response = fail(error);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.code).toBe("UNAUTHORIZED");
  });

  it("should return 403 for AuthorizationError", () => {
    const error = new AuthorizationError();
    const response = fail(error);
    expect(response.status).toBe(403);
  });

  it("should return 500 for an unknown error", () => {
    const response = fail(new Error("unexpected"));
    expect(response.status).toBe(500);
  });
});

describe("buildMeta()", () => {
  it("should calculate totalPages correctly", () => {
    const meta = buildMeta(1, 20, 45);
    expect(meta.totalPages).toBe(3);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(false);
  });

  it("should report hasPrevPage true when past first page", () => {
    const meta = buildMeta(2, 20, 45);
    expect(meta.hasPrevPage).toBe(true);
  });

  it("should report hasNextPage false on last page", () => {
    const meta = buildMeta(3, 20, 45);
    expect(meta.hasNextPage).toBe(false);
  });

  it("should handle empty results", () => {
    const meta = buildMeta(1, 20, 0);
    expect(meta.totalPages).toBe(0);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(false);
  });
});
