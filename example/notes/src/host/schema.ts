import { column, defineTable, type RowOf } from "@basket/db";

export const notesTable = defineTable("notes", {
  id: column.serial().primaryKey(),
  title: column.text(),
  body: column.text().default(""),
  pinned: column.boolean().default(false),
  createdAt: column.timestamp().default("now()"),
  updatedAt: column.timestamp().default("now()"),
});

export type NoteRow = RowOf<typeof notesTable>;
