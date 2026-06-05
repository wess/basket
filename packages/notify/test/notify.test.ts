import { describe, expect, test } from "bun:test";
import { notify } from "../index.ts";

describe("notify", () => {
  test("rejects when title is empty", async () => {
    await expect(notify({ title: "", body: "hi" })).rejects.toThrow(/title and body are required/);
  });

  test("rejects when body is empty", async () => {
    await expect(notify({ title: "hi", body: "" })).rejects.toThrow(/title and body are required/);
  });
});
