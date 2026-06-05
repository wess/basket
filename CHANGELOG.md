# Changelog

All notable changes to basket are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the workspace
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Basket is a 29-package monorepo. All `@basket/*` packages share a single
version line and are released together.

## [Unreleased]

### Added

- GitHub Actions CI running typecheck, Biome, and the test suite on every
  push to `main` and on pull requests.
- Test coverage for previously untested packages: `singleton`, `lifecycle`,
  `theme`, `notify`, `dialog`, `logger`, `power`, and `autolaunch`.

### Fixed

- Biome format and lint findings in `@basket/power` and `@basket/autolaunch`
  (optional-chain simplifications, an unused parameter, and reflow).
- README package count corrected to 29.

## [0.0.1] - 2026-05-31

Initial baseline of the workspace.

### Added

- **Core**: `config`, `store`, `ipc`, `window`.
- **Native shell**: `menu`, `tray`, `dialog`, `notify`, `shortcut`,
  `protocol`, `lifecycle`, `theme`, `power`, `autolaunch`, `singleton`,
  `sidecar`.
- **Data**: `db`, `migrate`, `fs`, `cache`, `logger`.
- **Network · Auth · AI**: `request`, `secrets`, `auth`, `update`, `ai`,
  `mcp`.
- **UI · CLI**: `ui`, `cli`.

### Notes

- Packages ship raw TypeScript via `exports.import`; the typecheck
  (`bunx tsc --noEmit`) is the de facto build.
- Distributed as a vendored workspace rather than via npm.

## Path to 1.0

Reaching a stable 1.0 requires product decisions that are intentionally
out of scope for routine releases:

- Publishing strategy: npm publish vs. vendor-only workspace.
- Ship-as-source (Bun-only) vs. compiled `js` + `d.ts` for non-Bun consumers.
- The supported-platform and supported-provider contract for the native-shim
  and AI/MCP packages, which freezes their public API.

[Unreleased]: https://github.com/wess/basket/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/wess/basket/releases/tag/v0.0.1
