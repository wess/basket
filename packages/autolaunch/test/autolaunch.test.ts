import { describe, expect, test } from "bun:test";
import { disable, enable, isEnabled } from "../index.ts";

describe("autolaunch appId validation", () => {
  const bad = ["bad id", "has/slash", "semi;colon", "", "back\\slash"];

  for (const id of bad) {
    test(`enable rejects ${JSON.stringify(id)}`, async () => {
      await expect(enable({ appId: id })).rejects.toThrow(/appId must match/);
    });

    test(`disable rejects ${JSON.stringify(id)}`, async () => {
      await expect(disable(id)).rejects.toThrow(/appId must match/);
    });

    test(`isEnabled rejects ${JSON.stringify(id)}`, async () => {
      await expect(isEnabled(id)).rejects.toThrow(/appId must match/);
    });
  }

  test("accepts well-formed ids without throwing on validation", async () => {
    // isEnabled is read-only: it only stats/queries, never mutates the system.
    await expect(isEnabled("io.basket.app")).resolves.toBeBoolean();
    await expect(isEnabled("my-app_1.0")).resolves.toBeBoolean();
  });
});
