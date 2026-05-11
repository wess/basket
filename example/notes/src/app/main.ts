import { invoke, subscribe } from "@basket/ipc/client";
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

const listEl = document.getElementById("list") as HTMLUListElement;
const titleEl = document.getElementById("title") as HTMLInputElement;
const bodyEl = document.getElementById("body") as HTMLTextAreaElement;
const metaEl = document.getElementById("meta") as HTMLElement;
const newBtn = document.getElementById("new") as HTMLButtonElement;

let notes: Note[] = [];
let selectedId: number | undefined;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const fmt = (iso: string) => new Date(iso).toLocaleString();

const renderList = () => {
  listEl.innerHTML = "";
  for (const n of notes) {
    const li = document.createElement("li");
    li.dataset.id = String(n.id);
    if (n.id === selectedId) li.classList.add("selected");
    if (n.pinned) li.classList.add("pinned");
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = n.title || "Untitled";
    const preview = document.createElement("div");
    preview.className = "preview";
    preview.textContent = n.body.slice(0, 80) || " ";
    li.append(title, preview);
    li.addEventListener("click", () => select(n.id));
    listEl.append(li);
  }
};

const renderEditor = () => {
  const note = notes.find((n) => n.id === selectedId);
  if (!note) {
    titleEl.value = "";
    bodyEl.value = "";
    metaEl.textContent = "";
    titleEl.disabled = bodyEl.disabled = true;
    return;
  }
  titleEl.disabled = bodyEl.disabled = false;
  titleEl.value = note.title;
  bodyEl.value = note.body;
  metaEl.textContent = `Created ${fmt(note.createdAt)} • Updated ${fmt(note.updatedAt)}`;
};

const select = (id: number) => {
  selectedId = id;
  renderList();
  renderEditor();
};

const upsert = (note: Note) => {
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) notes[idx] = note;
  else notes.unshift(note);
  notes = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
};

const remove = (id: number) => {
  notes = notes.filter((n) => n.id !== id);
  if (selectedId === id) selectedId = notes[0]?.id;
};

const queueSave = () => {
  if (selectedId === undefined) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (selectedId === undefined) return;
    await invoke(updateNote, { id: selectedId, title: titleEl.value, body: bodyEl.value });
  }, 250);
};

newBtn.addEventListener("click", async () => {
  const note = await invoke(createNote, { title: "Untitled" });
  upsert(note);
  select(note.id);
});

titleEl.addEventListener("input", queueSave);
bodyEl.addEventListener("input", queueSave);

document.addEventListener("keydown", async (e) => {
  if (e.key === "Backspace" && (e.metaKey || e.ctrlKey) && selectedId !== undefined && document.activeElement === document.body) {
    e.preventDefault();
    const id = selectedId;
    await invoke(deleteNote, { id });
    remove(id);
    renderList();
    renderEditor();
  }
});

subscribe(noteCreated, (note) => {
  upsert(note);
  if (selectedId === undefined) selectedId = note.id;
  renderList();
  renderEditor();
});

subscribe(noteUpdated, (note) => {
  upsert(note);
  renderList();
  if (selectedId === note.id) {
    metaEl.textContent = `Created ${fmt(note.createdAt)} • Updated ${fmt(note.updatedAt)}`;
  }
});

subscribe(noteDeleted, ({ id }) => {
  remove(id);
  renderList();
  renderEditor();
});

notes = await invoke(listNotes, undefined as unknown as void);
selectedId = notes[0]?.id;
renderList();
renderEditor();
