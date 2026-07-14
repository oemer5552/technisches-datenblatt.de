import { describe, expect, it } from "vitest";
import { EU_COUNTRIES, formatEuCountry } from "./eu-countries";
import { orderInputSchema } from "./validation";

const validOrder = {
  locale: "de",
  service: "data",
  customerName: "Erika Mustermann",
  customerEmail: "ERIKA@EXAMPLE.DE",
  customerPhone: "",
  company: "",
  vin: "wvw zzz 1j z3w 386752",
  firstRegistration: "2003-01-15",
  originCountry: "IT",
  notes: "",
  vinConfirmation: "accepted",
  privacy: "accepted",
  terms: "accepted",
  earlyPerformance: "accepted",
  withdrawalAck: "accepted",
} as const;

describe("order input", () => {
  it("accepts the reduced vehicle details and normalizes contact and VIN data", () => {
    const result = orderInputSchema.parse(validOrder);

    expect(result.customerEmail).toBe("erika@example.de");
    expect(result.vin).toBe("WVWZZZ1JZ3W386752");
    expect(result.firstRegistration).toBe("2003-01-15");
    expect(result.originCountry).toBe("IT");
    expect(result).not.toHaveProperty("make");
    expect(result).not.toHaveProperty("model");
    expect(result).not.toHaveProperty("vinLocation");
  });

  it("requires the first registration date", () => {
    expect(orderInputSchema.safeParse({ ...validOrder, firstRegistration: "" }).success).toBe(false);
  });

  it("only accepts a current EU Member State", () => {
    expect(orderInputSchema.safeParse({ ...validOrder, originCountry: "US" }).success).toBe(false);
  });

  it("rejects common email domain typos with a useful correction", () => {
    const result = orderInputSchema.safeParse({ ...validOrder, customerEmail: "erika@gmil.com" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toContain("erika@gmail.com");
  });
});

describe("EU country options", () => {
  it("contains exactly the 27 unique EU Member States", () => {
    const codes = EU_COUNTRIES.map(({ code }) => code);

    expect(codes).toHaveLength(27);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toEqual(expect.arrayContaining(["DE", "FR", "IT", "PL", "SE", "CY"]));
    for (const code of ["GB", "TR", "UA", "CH"]) expect(codes).not.toContain(code);
    expect(formatEuCountry("IT", "de")).toBe("Italien");
    expect(formatEuCountry("IT", "en")).toBe("Italy");
  });

  it("keeps legacy country names readable in the backoffice", () => {
    expect(formatEuCountry("Frankreich", "de")).toBe("Frankreich");
    expect(formatEuCountry(null, "de")).toBe("—");
  });
});
