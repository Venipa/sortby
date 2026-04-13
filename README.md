# fluent-sorter

`fluent-sorter` is a small utility for composing sort comparators with a fluent `thenBy` API.

## Install

```bash
pnpm add fluent-sorter
```

## Usage

### ESM

```ts
import sorter from "fluent-sorter"; // either use default export sorter or thenBy directly

const someApiResponse = await fetch("https://api.example.com/items").then(res => res.json());
return someApiResponse.sort(s => s.createdAt, "desc").thenBy(s => s.name, "asc"); // sort by createdAt descending and then by name ascending
```

```ts
import sorter from "fluent-sorter"; // either use default export sorter or thenBy directly

const byScoreThenName = sorter<{ score: number; name: string }>((a, b) => b.score - a.score).thenBy(
  (value) => value.name,
  "asc"
);

byScoreThenName({ score: 10, name: "Alice" }, { score: 20, name: "Bob" }); // -1
byScoreThenName({ score: 20, name: "Bob" }, { score: 10, name: "Alice" }); // 1
byScoreThenName({ score: 10, name: "Alice" }, { score: 10, name: "Bob" }); // 0
```

```ts
import { thenBy } from "fluent-sorter"; // either use default export sorter or thenBy directly

const byScoreThenName = thenBy<{ score: number; name: string }>((value) => value.score, "desc").thenBy(
  (value) => value.name,
  "asc"
);

import { thenBy } from "fluent-sorter"; // either use default export sorter or thenBy directly

const byScoreThenName = thenBy<{ score: number; name: string }>((value) => value.score, "desc").thenBy(
  (value) => value.name,
  "asc"
);
```

### CommonJS

```js
const { thenBy } = require("fluent-sorter");
const byScoreThenName = thenBy<{ score: number; name: string }>((value) => value.score, "desc").thenBy(
  (value) => value.name,
  "asc"
);
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
