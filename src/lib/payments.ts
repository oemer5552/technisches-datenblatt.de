type PaymentEnvironment = Readonly<Record<string, string | undefined>>;

export function paymentsEnabled(env: PaymentEnvironment = process.env) {
  return env.PAYMENTS_ENABLED === "true"
    && env.PAYMENT_MODE === "stripe"
    && Boolean(env.STRIPE_SECRET_KEY);
}
