import { describe, expect, it } from "vitest";
import { PRODUCTS, getProduct } from "./site";

describe("service pricing", () => {
  it("offers exactly one digital package at 24.99 euros gross", () => {
    expect(Object.keys(PRODUCTS)).toEqual(["data"]);
    expect(getProduct("data")).toBe(PRODUCTS.data);
    expect(PRODUCTS.data.priceCents).toBe(2_499);
    expect(PRODUCTS.data.price).toBe("24,99 €");
  });

  it("maps unknown legacy values safely to the only current product", () => {
    expect(getProduct("registration")).toBe(PRODUCTS.data);
  });
});
