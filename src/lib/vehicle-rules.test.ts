import { describe, expect, it } from "vitest";
import { colorCode, fuelCode, hasExactApprovalNumber } from "./vehicle-rules";

describe("vehicle document rules", () => {
  it("derives the official color code from the visible color", () => {
    expect(colorCode("WEISS")).toBe("0");
    expect(colorCode("SCHWARZ")).toBe("9");
    expect(colorCode("Platinium-Grau")).toBe("7");
    expect(colorCode("Schwarzblau")).toBe("5");
    expect(colorCode("ROT/SCHWARZ")).toBe("3/9");
    expect(colorCode("Harlekin")).toBe("00");
    expect(colorCode("UNBEKANNT")).toBe("—");
  });

  it("derives the official fuel code without a default guess", () => {
    expect(fuelCode("Benzin")).toBe("0001");
    expect(fuelCode("Diesel")).toBe("0002");
    expect(fuelCode("Elektro")).toBe("0004");
    expect(fuelCode("Hybrid Benzin/Elektro")).toBe("0008");
    expect(fuelCode("Plug-in-Hybrid Diesel")).toBe("0026");
    expect(fuelCode("unbekannt")).toBe("—");
  });

  it("requires the exact TAN extension from field K", () => {
    expect(hasExactApprovalNumber("e2*2007/46*0534*15")).toBe(true);
    expect(hasExactApprovalNumber("e2*2007/46*0534")).toBe(false);
    expect(hasExactApprovalNumber(null)).toBe(false);
  });
});
