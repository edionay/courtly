import { describe, expect, it } from "vitest";
import { readPort } from "../../src/settings";

describe("readPort", () => {
  it("uses the default port when none is configured", () => {
    expect(readPort(undefined)).toBe(3000);
  });

  it("rejects invalid port values", () => {
    expect(() => readPort("0")).toThrow("PORT must be an integer between 1 and 65535");
    expect(() => readPort("not-a-port")).toThrow("PORT must be an integer between 1 and 65535");
  });
});
