import { describe, expect, it } from "vitest";
import { PRODUCTS, getProduct } from "./site";

describe("service pricing", () => {
  it("uses the advertised 199 euro gross price for the registration package", () => {
    expect(getProduct("registration")).toBe(PRODUCTS.registration);
    expect(PRODUCTS.registration.priceCents).toBe(19_900);
    expect(PRODUCTS.registration.price).toBe("199,00 €");
  });

  it("keeps the separate digital data package at 24.99 euros", () => {
    expect(getProduct("data")).toBe(PRODUCTS.data);
    expect(PRODUCTS.data.priceCents).toBe(2_499);
  });

  it("falls back safely to the registration package for unknown legacy values", () => {
    expect(getProduct("complete")).toBe(PRODUCTS.registration);
  });
});
