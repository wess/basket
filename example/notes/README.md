# Notes

A working basket example — minimal notes app. Demonstrates `@basket/db`, `@basket/store`, `@basket/window`, `@basket/ipc`, `@basket/menu`, `@basket/config`.

## Run

From the basket root:

```bash
bun install
cd example/notes
bun run dev
```

## Structure

```
src/
  shared/
    types.ts       # Note shape (used both sides)
    channels.ts    # Typed IPC channels and events
  host/
    schema.ts      # @basket/db table definition
    menu.ts        # @basket/menu definition
    index.ts       # main host: db, ipc handlers, window, menu
  app/
    index.html     # webview UI shell
    main.ts        # webview-side logic; calls invoke/subscribe
    styles.css
  env.d.ts
butter.yaml
package.json
```

## What it shows

- Schema-driven SQLite with `defineTable` + `RowOf` typed rows
- Typed end-to-end IPC: the same `Channel<I, O>` definitions are used by both host and webview, so renaming a channel or changing its payload is a tsserver-detected error on both ends
- Window state persistence across launches via `@basket/store`
- Native app menu with keyboard shortcuts wired to IPC actions
- Live updates via host-emitted events the webview subscribes to
