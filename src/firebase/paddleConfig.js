export function readPaddleConfig(env) {
  const environment = env.VITE_PADDLE_ENVIRONMENT || "sandbox";
  if (!["sandbox", "production"].includes(environment)) {
    throw new Error("Invalid Paddle environment.");
  }
  const token = env.VITE_PADDLE_CLIENT_TOKEN || "";
  const prefix = environment === "production" ? "live_" : "test_";
  if (!token.startsWith(prefix)) {
    throw new Error("Paddle client token does not match its environment.");
  }
  const planPriceIds = JSON.parse(env.VITE_PADDLE_PLAN_PRICE_IDS || "{}");
  return { environment, token, planPriceIds };
}

export function selectPaddlePrice({ environment, planPriceIds, testPriceId, type, programPriceId, planId, billingCycle }) {
  const configured = type === "program" ? programPriceId : planPriceIds?.[planId]?.[billingCycle];
  const priceId = configured || (type !== "program" && environment === "sandbox" ? testPriceId : "");
  return typeof priceId === "string" && /^pri_[a-z0-9]+$/.test(priceId) ? priceId : "";
}

export function programLicenseForRole(role, requestedLicense) {
  if (role === "teacher") return requestedLicense === "class" ? "class" : "teacher";
  return role === "student" ? "student" : null;
}
