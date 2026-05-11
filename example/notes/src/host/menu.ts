import { item, section, separator, type Menu } from "@basket/menu";

const menu: Menu = [
  section("File", [
    item("New Note", "note:new", { shortcut: "CmdOrCtrl+N" }),
    separator(),
    item("Quit", "quit", { shortcut: "CmdOrCtrl+Q" }),
  ]),
  section("Edit", [
    item("Undo", "undo", { shortcut: "CmdOrCtrl+Z" }),
    item("Redo", "redo", { shortcut: "CmdOrCtrl+Shift+Z" }),
    separator(),
    item("Cut", "cut", { shortcut: "CmdOrCtrl+X" }),
    item("Copy", "copy", { shortcut: "CmdOrCtrl+C" }),
    item("Paste", "paste", { shortcut: "CmdOrCtrl+V" }),
  ]),
];

export default menu;
