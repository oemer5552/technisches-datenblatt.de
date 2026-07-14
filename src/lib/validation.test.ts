import { describe, expect, it } from "vitest";
import { EUROPEAN_COUNTRIES, formatEuropeanCountry } from "./european-countries";
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

  it("only accepts a listed European country", () => {
    expect(orderInputSchema.safeParse({ ...validOrder, originCountry: "US" }).success).toBe(false);
  });
});

describe("European country options", () => {
  it("contains unique country codes and localized names", () => {
    const codes = EUROPEAN_COUNTRIES.map(({ code }) => code);

    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toEqual(expect.arrayContaining(["DE", "FR", "GB", "TR", "UA", "XK"]));
    expect(formatEuropeanCountry("IT", "de")).toBe("Italien");
    expect(formatEuropeanCountry("IT", "en")).toBe("Italy");
  });

  it("keeps legacy country names readable in the backoffice", () => {
    expect(formatEuropeanCountry("Frankreich", "de")).toBe("Frankreich");
    expect(formatEuropeanCountry(null, "de")).toBe("—");
  });
});
