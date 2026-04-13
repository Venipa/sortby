#!/usr/bin/env bun

import sorter from "./index.ts";

const byScoreThenName = sorter<{ score: number; name: string }>((a, b) => b.score - a.score).thenBy(
  (value) => value.name
);

console.log(byScoreThenName({ score: 10, name: "Alice" }, { score: 20, name: "Bob" })); // -1
console.log(byScoreThenName({ score: 20, name: "Bob" }, { score: 10, name: "Alice" })); // 1
console.log(byScoreThenName({ score: 10, name: "Alice" }, { score: 10, name: "Bob" })); // 0