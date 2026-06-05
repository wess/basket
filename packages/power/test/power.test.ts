import { afterEach, describe, expect, mock, test } from "bun:test";

const realButter = await import("butter");
mock.module("butter", () => ({
  ...realButter,
  on: () => {},
}));

const { idleSeconds, listScreens, onSleep } = await import("../index.ts");

type Runtime = { control: (action: string, data?: unknown) => Promise<unknown> };
const setRuntime = (rt: Runtime | undefined) => {
  (globalThis as { __butterRuntime?: Runtime }).__butterRuntime = rt;
};

afterEach(() => setRuntime(undefined));

describe("idleSeconds", () => {
  test("returns seconds on a healthy reply", async () => {
    setRuntime({ control: async () => ({ ok: true, seconds: 42 }) });
    expect(await idleSeconds()).toBe(42);
  });

  test("throws when the reply is not ok", async () => {
    setRuntime({ control: async () => ({ ok: false }) });
    await expect(idleSeconds()).rejects.toThrow(/idle query failed/);
  });

  test("throws when the runtime is missing", async () => {
    setRuntime(undefined);
    await expect(idleSeconds()).rejects.toThrow(/runtime is not initialized/);
  });
});

describe("listScreens", () => {
  test("returns the screens array", async () => {
    const rect = { x: 0, y: 0, width: 1920, height: 1080 };
    const screens = [{ id: 1, primary: true, scale: 2, bounds: rect, workArea: rect }];
    setRuntime({ control: async () => ({ ok: true, screens }) });
    expect(await listScreens()).toBe(screens);
  });

  test("throws when screens is not an array", async () => {
    setRuntime({ control: async () => ({ ok: true, screens: null }) });
    await expect(listScreens()).rejects.toThrow(/screen list query failed/);
  });
});

describe("event subscriptions", () => {
  test("onSleep returns an unsubscribe function", () => {
    const off = onSleep(() => {});
    expect(typeof off).toBe("function");
    off();
  });
});
