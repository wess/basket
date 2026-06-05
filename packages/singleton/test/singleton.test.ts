import { describe, expect, mock, test } from "bun:test";

const handlers = new Map<string, (d: unknown) => void>();
const realButter = await import("butter");
mock.module("butter", () => ({
  ...realButter,
  on: (event: string, cb: (d: unknown) => void) => {
    handlers.set(event, cb);
  },
}));

const { isLeader, onSecondInstance } = await import("../index.ts");

const dispatch = async (data: unknown) => {
  handlers.get("app:secondinstance")?.(data);
  await new Promise((r) => setTimeout(r, 5));
};

describe("singleton", () => {
  test("isLeader is true", () => {
    expect(isLeader()).toBe(true);
  });

  test("onSecondInstance receives normalized info", async () => {
    let got: unknown;
    const off = onSecondInstance((info) => {
      got = info;
    });
    await dispatch({ argv: ["--open", "x"], cwd: "/home" });
    expect(got).toEqual({ argv: ["--open", "x"], cwd: "/home" });
    off();
  });

  test("malformed payload normalizes to safe defaults", async () => {
    let got: unknown;
    const off = onSecondInstance((info) => {
      got = info;
    });
    await dispatch(null);
    expect(got).toEqual({ argv: [], cwd: "" });
    off();
  });

  test("unsubscribe stops delivery", async () => {
    let count = 0;
    const off = onSecondInstance(() => {
      count++;
    });
    off();
    await dispatch({ argv: [], cwd: "/" });
    expect(count).toBe(0);
  });
});
