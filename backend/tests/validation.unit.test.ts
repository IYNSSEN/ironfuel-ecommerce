import { registerSchema } from "../src/validators.js";

describe("Validation unit", () => {
  it("password must be at least 8 chars", () => {
    const r = registerSchema.safeParse({ login: "abc", password: "short" });
    expect(r.success).toBe(false);
  });

  it("valid payload passes", () => {
    const r = registerSchema.safeParse({ login: "abc", password: "password123" });
    expect(r.success).toBe(true);
  });
});
