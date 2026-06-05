import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Drive @basket/config's paths() at a temp HOME instead of mocking the
// module, so nothing leaks into other packages' tests.
const home = mkdtempSync(join(tmpdir(), "basket-logger-"));
const prevHome = Bun.env.HOME;
const prevProfile = Bun.env.USERPROFILE;
Bun.env.HOME = home;
Bun.env.USERPROFILE = home;

const { createLogger, LEVELS } = await import("../index.ts");

const app = { name: "BasketLoggerTest", id: "io.test.logger" };

afterAll(() => {
  Bun.env.HOME = prevHome;
  Bun.env.USERPROFILE = prevProfile;
  rmSync(home, { recursive: true, force: true });
});

describe("logger", () => {
  test("level ordering", () => {
    expect(LEVELS.debug).toBeLessThan(LEVELS.info);
    expect(LEVELS.info).toBeLessThan(LEVELS.warn);
    expect(LEVELS.warn).toBeLessThan(LEVELS.error);
  });

  test("writes info lines with metadata", async () => {
    const log = createLogger({ app, file: "a.log", level: "info" });
    log.info("hello", { user: "wess" });
    await log.flush();
    const text = await Bun.file(log.path).text();
    expect(text).toContain("INFO");
    expect(text).toContain("hello");
    expect(text).toContain('"user":"wess"');
  });

  test("filters below the configured level", async () => {
    const log = createLogger({ app, file: "b.log", level: "warn" });
    log.debug("noise");
    log.info("noise");
    log.error("kept");
    await log.flush();
    const text = await Bun.file(log.path).text();
    expect(text).not.toContain("noise");
    expect(text).toContain("kept");
  });

  test("child merges bindings", async () => {
    const log = createLogger({ app, file: "c.log", level: "info" });
    const child = log.child({ scope: "db" });
    child.info("query");
    await child.flush();
    const text = await Bun.file(log.path).text();
    expect(text).toContain('"scope":"db"');
  });

  test("rotates when maxSize is exceeded", async () => {
    const log = createLogger({ app, file: "d.log", level: "info", maxSize: 80, keep: 3 });
    for (let i = 0; i < 6; i++) log.info(`line number ${i} padded out`);
    await log.flush();
    expect(await Bun.file(`${log.path}.1`).exists()).toBe(true);
  });
});
