import { createHttpError, isHttpError } from "./errors";

describe("createHttpError", () => {
  it("creates an Error carrying the given status and message", () => {
    const error = createHttpError(404, "Trail not found");

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Trail not found");
    expect(error.status).toBe(404);
  });
});

describe("isHttpError", () => {
  it("returns true for errors with a numeric status", () => {
    const error = createHttpError(500, "boom");

    expect(isHttpError(error)).toBe(true);
  });

  it("returns false for a plain Error without a status", () => {
    expect(isHttpError(new Error("plain"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isHttpError("not an error")).toBe(false);
    expect(isHttpError(null)).toBe(false);
    expect(isHttpError(undefined)).toBe(false);
    expect(isHttpError({ status: 404 })).toBe(false);
  });
});
