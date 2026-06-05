import { describe, expect, mock, test } from "bun:test";

const handlers = new Map<string, (d: unknown) => void>();
const realButter = await import("butter");
mock.module("butter", () => ({
  ...realButter,
  on: (event: string, cb: (d: unknown) => void) => {
    handlers.set(event, cb);
  },
}));

const { createThemeManager, onThemeChange } = await import("../index.ts");

describe("createThemeManager", () => {
  test("initial explicit theme is reported by get", () => {
    const m = createThemeManager({ initial: "dark" });
    expect(m.get()).toBe("dark");
  });

  test("set updates raw and resolved for explicit themes", () => {
    const m = createThemeManager({ initial: "dark" });
    m.set("light");
    expect(m.get()).toBe("light");
    expect(m.resolved()).toBe("light");
    m.set("dark");
    expect(m.get()).toBe("dark");
    expect(m.resolved()).toBe("dark");
  });

  test("subscribers receive resolved + raw on change", () => {
    const m = createThemeManager({ initial: "dark" });
    let payload: [string, string] | undefined;
    const off = m.subscribe((resolved, raw) => {
      payload = [resolved, raw];
    });
    m.set("light");
    expect(payload).toEqual(["light", "light"]);
    off();
    m.set("dark");
    expect(payload).toEqual(["light", "light"]);
  });
});

describe("onThemeChange", () => {
  test("forwards valid theme values only", () => {
    const seen: string[] = [];
    const off = onThemeChange((t) => {
      seen.push(t);
    });
    handlers.get("theme:changed")?.({ theme: "dark" });
    handlers.get("theme:changed")?.({ theme: "bogus" });
    handlers.get("theme:changed")?.({ theme: "light" });
    expect(seen).toEqual(["dark", "light"]);
    off();
  });
});
