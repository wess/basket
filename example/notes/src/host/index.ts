import { mkdir } from "node:fs/promises";
import { defineConfig, paths } from "@basket/config";
import { connect, from, migrate } from "@basket/db";
import { emit, handle } from "@basket/ipc";
import { applyMenu, onMenu } from "@basket/menu";
import { createStore } from "@basket/store";
import { mainWindow } from "@basket/window";
import {
  createNote,
  deleteNote,
  listNotes,
  noteCreated,
  noteDeleted,
  noteUpdated,
  updateNote,
} from "../shared/channels.ts";
import type { Note } from "../shared/types.ts";
import menu from "./menu.ts";
import { notesTable } from "./schema.ts";

const config = defineConfig({
  app: { name: "Notes", id: "io.wess.basket.notes" },
});

const dataDir = paths(config.app).data;
await mkdir(dataDir, { recursive: true });

const settings = createStore("settings", {
  app: config.app,
  defaults: { lastSelectedId: undefined as number | undefined },
});

const db = connect(`${dataDir}/notes.db`);
migrate(db, [notesTable]);

const win = mainWindow({
  defaults: { width: 1100, height: 720, title: config.app.name },
  store: settings,
  storeKey: "main",
});

applyMenu(menu);

const toNote = (row: { id: number; title: string; body: string; pinned: boolean | number; createdAt: string; updatedAt: string }): Note => ({
  ...row,
  pinned: Boolean(row.pinned),
});

handle(listNotes, () => {
  const rows = db.all(from(notesTable).order("pinned", "desc").order("updatedAt", "desc"));
  return rows.map(toNote);
});

handle(createNote, ({ title, body }) => {
  const created = db.insert(notesTable, { title, body: body ?? "" });
  const note = toNote(created as never);
  emit(noteCreated, note);
  return note;
});

handle(updateNote, ({ id, title, body, pinned }) => {
  const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (title !== undefined) patch.title = title;
  if (body !== undefined) patch.body = body;
  if (pinned !== undefined) patch.pinned = pinned;
  db.update(notesTable, { id } as never, patch as never);
  const row = db.one(from(notesTable).where((q) => q("id").equals(id)));
  if (!row) throw new Error(`note ${id} not found`);
  const note = toNote(row as never);
  emit(noteUpdated, note);
  return note;
});

handle(deleteNote, ({ id }) => {
  db.remove(notesTable, { id } as never);
  emit(noteDeleted, { id });
  return { id };
});

onMenu("note:new", () => {
  const note = toNote(db.insert(notesTable, { title: "Untitled" }) as never);
  emit(noteCreated, note);
});

onMenu("quit", () => {
  win.save();
  db.close();
  process.exit(0);
});

console.log(`[Notes] ready. Data at ${dataDir}/notes.db`);
