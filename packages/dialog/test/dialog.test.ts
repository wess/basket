import { describe, expect, mock, test } from "bun:test";

let cancel = false;
mock.module("butter/dialog", () => ({
  dialog: {
    open: async ({ multiple }: { multiple?: boolean }) =>
      cancel
        ? { cancelled: true, paths: [] }
        : multiple
          ? { cancelled: false, paths: ["/a", "/b"] }
          : { cancelled: false, paths: ["/a"] },
    save: async () => (cancel ? { cancelled: true } : { cancelled: false, path: "/out.txt" }),
    folder: async () => (cancel ? { cancelled: true, paths: [] } : { cancelled: false, paths: ["/dir"] }),
    message: async () => ({ response: 0 }),
    alert: async () => {},
    confirm: async () => true,
  },
}));

const { openFile, openFiles, openFolder, saveFile, confirm } = await import("../index.ts");

describe("dialog", () => {
  test("openFile returns first path", async () => {
    cancel = false;
    expect(await openFile()).toBe("/a");
  });

  test("openFiles returns all paths", async () => {
    cancel = false;
    expect(await openFiles()).toEqual(["/a", "/b"]);
  });

  test("saveFile returns path", async () => {
    cancel = false;
    expect(await saveFile()).toBe("/out.txt");
  });

  test("openFolder returns first folder", async () => {
    cancel = false;
    expect(await openFolder()).toBe("/dir");
  });

  test("confirm passes through", async () => {
    expect(await confirm("sure?")).toBe(true);
  });

  test("cancelled selections map to undefined", async () => {
    cancel = true;
    expect(await openFile()).toBeUndefined();
    expect(await saveFile()).toBeUndefined();
    expect(await openFolder()).toBeUndefined();
    expect(await openFiles()).toBeUndefined();
  });
});
