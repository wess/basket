import { describe, expect, mock, test } from "bun:test";

const handlers = new Map<string, () => void>();
const realButter = await import("butter");
mock.module("butter", () => ({
  ...realButter,
  on: (event: string, cb: () => void) => {
    handlers.set(event, cb);
  },
}));

const { onActivate, onBeforeQuit, onReopen, onWillQuit } = await import("../index.ts");

const fire = async (event: string) => {
  handlers.get(event)?.();
  await new Promise((r) => setTimeout(r, 5));
};

describe("lifecycle", () => {
  test("onBeforeQuit runs registered handlers", async () => {
    let hit = false;
    const off = onBeforeQuit(() => {
      hit = true;
    });
    await fire("app:beforequit");
    expect(hit).toBe(true);
    off();
  });

  test("onWillQuit / onActivate / onReopen wire distinct events", async () => {
    let will = 0;
    let activate = 0;
    let reopen = 0;
    onWillQuit(() => {
      will++;
    });
    onActivate(() => {
      activate++;
    });
    onReopen(() => {
      reopen++;
    });
    await fire("app:willquit");
    await fire("app:activate");
    await fire("app:reopen");
    expect([will, activate, reopen]).toEqual([1, 1, 1]);
  });

  test("unsubscribe removes the handler", async () => {
    let count = 0;
    const off = onActivate(() => {
      count++;
    });
    off();
    await fire("app:activate");
    expect(count).toBe(0);
  });

  test("a throwing handler does not block the others", async () => {
    const seen: string[] = [];
    onReopen(() => {
      throw new Error("boom");
    });
    onReopen(() => {
      seen.push("second");
    });
    await fire("app:reopen");
    expect(seen).toContain("second");
  });
});
