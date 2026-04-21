import { describe, expect, test } from "bun:test";
import { sorter, thenBy } from "./index";

interface ValueBox<TValue> {
	value: TValue;
}

const expectAsc = <T>(comparator: (a: T, b: T) => number, left: T, right: T): void => {
	expect(comparator(left, right)).toBeLessThan(0);
	expect(comparator(right, left)).toBeGreaterThan(0);
};

const expectDesc = <T>(comparator: (a: T, b: T) => number, left: T, right: T): void => {
	expect(comparator(left, right)).toBeGreaterThan(0);
	expect(comparator(right, left)).toBeLessThan(0);
};
describe("thenBy selector type coverage", () => {
	test("compares strings", () => {
		const compareByValue = thenBy<ValueBox<string>, string>((item) => item.value, "asc");
		expectAsc(compareByValue, { value: "Alice" }, { value: "Bob" });
	});

	test("compares numbers", () => {
		const compareByValue = thenBy<ValueBox<number>, number>((item) => item.value, "asc");
		expectAsc(compareByValue, { value: 10 }, { value: 20 });
	});

	test("compares bigints", () => {
		const compareByValue = thenBy<ValueBox<bigint>, bigint>((item) => item.value, "asc");
		expectAsc(compareByValue, { value: 10n }, { value: 20n });
	});

	test("compares booleans", () => {
		const compareByValue = thenBy<ValueBox<boolean>, boolean>((item) => item.value, "asc");
		expectAsc(compareByValue, { value: false }, { value: true });
	});

	test("compares dates", () => {
		const compareByValue = thenBy<ValueBox<Date>, Date>((item) => item.value, "asc");
		expectAsc(compareByValue, { value: new Date("2026-01-01T00:00:00.000Z") }, { value: new Date("2026-01-02T00:00:00.000Z") });
	});

	test("treats null and undefined as equal", () => {
		const compareByValue = thenBy<ValueBox<null | undefined>, null | undefined>((item) => item.value, "asc");
		expect(compareByValue({ value: null }, { value: undefined })).toBe(0);
		expect(compareByValue({ value: undefined }, { value: null })).toBe(0);
	});

	test("places nullish after defined values in ascending order", () => {
		const compareByValue = thenBy<ValueBox<number | null | undefined>, number | null | undefined>((item) => item.value, "asc");
		expectAsc(compareByValue, { value: 1 }, { value: null });
		expectAsc(compareByValue, { value: 1 }, { value: undefined });
	});
});

describe("sorter and chaining behavior", () => {
	interface ScoredItem {
		readonly score: number;
		readonly name: string;
	}

	test("applies descending direction by default", () => {
		const compareByScoreDesc = sorter<ScoredItem>((a, b) => a.score - b.score);
		expectDesc(compareByScoreDesc, { score: 10, name: "A" }, { score: 20, name: "B" });
	});

	test("allows explicit ascending direction override", () => {
		const compareByScoreAsc = sorter<ScoredItem>((a, b) => a.score - b.score, "asc");
		expectAsc(compareByScoreAsc, { score: 10, name: "A" }, { score: 20, name: "B" });
	});

	test("uses descending as default thenBy selector direction", () => {
		const compareByScoreThenName = sorter<ScoredItem>((a, b) => b.score - a.score).thenBy((item) => item.name);
		expectDesc(compareByScoreThenName, { score: 10, name: "Alice" }, { score: 10, name: "Bob" });
	});

	test("accepts selector form in sorter", () => {
		const compareByScore = sorter<ScoredItem, number>((item) => item.score);
		expectDesc(compareByScore, { score: 10, name: "A" }, { score: 20, name: "B" });
	});

	test("accepts property-name form with chaining", () => {
		const items: ScoredItem[] = [
			{ score: 10, name: "Bob" },
			{ score: 20, name: "Alice" },
			{ score: 30, name: "Bob" }
		];
		const sortedItems = items.toSorted(sorter("name").thenBy("score"));
		expect(sortedItems).toEqual([
			{ score: 30, name: "Bob" },
			{ score: 10, name: "Bob" },
			{ score: 20, name: "Alice" }
		]);
	});

	test("sorts with secondary comparator", () => {
		const items: ScoredItem[] = [
			{ score: 10, name: "Charlie" },
			{ score: 20, name: "Bob" },
			{ score: 20, name: "Alice" }
		];
		const comparator = sorter<ScoredItem>((a, b) => a.score - b.score).thenBy((item) => item.name, "asc");
		const sortedItems = items.toSorted(comparator);
		expect(sortedItems.map((item) => item.name)).toEqual(["Alice", "Bob", "Charlie"]);
	});
});
