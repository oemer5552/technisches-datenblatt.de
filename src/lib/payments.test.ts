import { describe, expect, it } from "vitest";
import { paymentsEnabled } from "./payments";

describe("payment feature switch", () => {
  it("keeps payments disabled unless the complete Stripe configuration is explicit", () => {
    expect(paymentsEnabled({})).toBe(false);
    expect(paymentsEnabled({ PAYMENTS_ENABLED: "false", PAYMENT_MODE: "stripe", STRIPE_SECRET_KEY: "sk_test" })).toBe(false);
    expect(paymentsEnabled({ PAYMENTS_ENABLED: "true", PAYMENT_MODE: "manual", STRIPE_SECRET_KEY: "sk_test" })).toBe(false);
    expect(paymentsEnabled({ PAYMENTS_ENABLED: "true", PAYMENT_MODE: "stripe" })).toBe(false);
  });

  it("enables payments only with the explicit switch and Stripe configuration", () => {
    expect(paymentsEnabled({ PAYMENTS_ENABLED: "true", PAYMENT_MODE: "stripe", STRIPE_SECRET_KEY: "sk_test" })).toBe(true);
  });
});
