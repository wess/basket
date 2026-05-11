import { defineChannel, defineEvent } from "@basket/ipc";
import type { Note } from "./types.ts";

export const listNotes = defineChannel<void, Note[]>("notes:list");
export const createNote = defineChannel<{ title: string; body?: string }, Note>("notes:create");
export const updateNote = defineChannel<{ id: number; title?: string; body?: string; pinned?: boolean }, Note>("notes:update");
export const deleteNote = defineChannel<{ id: number }, { id: number }>("notes:delete");

export const noteCreated = defineEvent<Note>("notes:created");
export const noteUpdated = defineEvent<Note>("notes:updated");
export const noteDeleted = defineEvent<{ id: number }>("notes:deleted");
