import { describe, expect, it } from "vitest";
import { detectMediaType } from "./files";
import { normalizeVin } from "./security";

describe("document security", () => {
  it("detects file signatures instead of trusting names", () => {
    expect(detectMediaType(Buffer.from("%PDF-1.7"))).toBe("application/pdf");
    expect(detectMediaType(Buffer.from("not-a-pdf"))).toBeNull();
  });

  it("normalizes valid VIN characters", () => {
    expect(normalizeVin("wvw-zzz-1jz-3w-386752")).toBe("WVWZZZ1JZ3W386752");
  });
});

