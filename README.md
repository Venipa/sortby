# fluent-sorter

`fluent-sorter` is a small utility for composing sort comparators with a fluent `thenBy` API.

## Install

```bash
pnpm add fluent-sorter
```

## Usage

### ESM

```ts
import sorter from "fluent-sorter";

interface Item {
  name: string;
  score: number;
  createdAt: Date;
}

const items: Item[] = [
  { name: "Bob", score: 10, createdAt: new Date("2026-01-01") },
  { name: "Alice", score: 20, createdAt: new Date("2026-01-02") },
  { name: "Bob", score: 30, createdAt: new Date("2026-01-03") }
];

const sorted = items.toSorted(
  sorter<Item>("name").thenBy("score")
);

// default direction is "desc" for sorter and thenBy:
// Bob (30), Bob (10), Alice (20)
console.log(sorted.map((item) => `${item.name} (${item.score})`));
```

```ts
import sorter from "fluent-sorter";

const byScoreThenNameAsc = sorter<{ score: number; name: string }>(
  (a, b) => a.score - b.score
).thenBy(
  (value) => value.name,
  "asc"
);
```

```ts
import { thenBy } from "fluent-sorter";

const byCreatedAtDescThenNameAsc = thenBy<{ createdAt: Date; name: string }>(
  (value) => value.createdAt
).thenBy(
  (value) => value.name,
  "asc"
);
```

### CommonJS (Node)

```js
const sorter = require("fluent-sorter").default;

const byScoreThenName = sorter((a, b) => a.score - b.score).thenBy((value) => value.name, "asc");
const sorted = [{ score: 10, name: "Bob" }, { score: 20, name: "Alice" }].sort(byScoreThenName);
```

## Package output

This package is built with Bun and published with dual-module support:

- ESM entry: `dist/index.js`
- CJS entry: `dist/index.cjs`
- Types: `dist/index.d.ts`

## Build

```bash
bun run build
```

## Test

```bash
bun test
```
