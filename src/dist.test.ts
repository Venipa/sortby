import { describe, expect, test } from "bun:test";
import sorter, { thenBy } from "../dist";

describe("dist test", () => {
	test("exports are defined", () => {
		expect(sorter).toBeDefined();
		expect(thenBy).toBeDefined();
	});
});