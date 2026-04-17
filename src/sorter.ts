export type Comparator<T> = (a: T, b: T) => number;
export type SortDirection = "asc" | "desc";
export type ComparableValue = string | number | bigint | boolean | Date | null | undefined;
export type SortSelector<T, TValue extends ComparableValue> = (value: T) => TValue;
export type ComparablePropertyName<T> = {
	[K in keyof T]-?: T[K] extends ComparableValue ? K : never;
}[keyof T];

export interface SorterComparator<T> {
	thenBy(comparator: Comparator<T>): SorterComparator<T>;
	thenBy<TValue extends ComparableValue>(
		selector: SortSelector<T, TValue>,
		direction?: SortDirection
	): SorterComparator<T>;
	thenBy(property: PropertyKey, direction?: SortDirection): SorterComparator<T>;
	thenBy<K extends ComparablePropertyName<T>>(
		property: K,
		direction?: SortDirection
	): SorterComparator<T>;
	(a: T, b: T): number;
}

const DEFAULT_SORT_DIRECTION: SortDirection = "desc";

const toDirectionSign = (direction: SortDirection = DEFAULT_SORT_DIRECTION): number =>
	direction === "asc" ? 1 : -1;

const compareSequentially = <T>(a: T, b: T, comparators: readonly Comparator<T>[]): number => {
	for (const comparator of comparators) {
		const result: number = comparator(a, b);
		if (result !== 0) {
			return result;
		}
	}

	return 0;
};

const compareValues = <TValue extends ComparableValue>(left: TValue, right: TValue): number => {
	if (left === right) {
		return 0;
	}

	if (left == null && right == null) {
		return 0;
	}

	if (left == null) {
		return 1;
	}

	if (right == null) {
		return -1;
	}

	if (left instanceof Date && right instanceof Date) {
		return left.getTime() - right.getTime();
	}

	if (typeof left === "string" && typeof right === "string") {
		return left.localeCompare(right);
	}

	if (typeof left === "number" && typeof right === "number") {
		return left - right;
	}

	if (typeof left === "boolean" && typeof right === "boolean") {
		return Number(left) - Number(right);
	}

	return left > right ? 1 : -1;
};

const hasComparatorArity = <T>(
	value: Comparator<T> | SortSelector<T, ComparableValue>
): value is Comparator<T> => value.length >= 2;

const isThenByComparatorCall = <T>(
	value: Comparator<T> | SortSelector<T, ComparableValue> | PropertyKey,
	direction?: SortDirection
): value is Comparator<T> =>
	typeof value === "function" && direction === undefined && hasComparatorArity(value);

const createDirectionalComparator = <T>(comparator: Comparator<T>, direction: SortDirection): Comparator<T> => {
	const sign: number = toDirectionSign(direction);
	if (sign === 1) {
		return comparator;
	}

	return (a: T, b: T): number => comparator(a, b) * sign;
};

const createSelectorComparator = <T, TValue extends ComparableValue>(
	selector: SortSelector<T, TValue>,
	direction?: SortDirection
): Comparator<T> => {
	const sign: number = toDirectionSign(direction);

	return (a: T, b: T): number => {
		const left: TValue = selector(a);
		const right: TValue = selector(b);
		return compareValues(left, right) * sign;
	};
};

const createPropertyComparator = <T, K extends PropertyKey>(
	property: K,
	direction?: SortDirection
): Comparator<T> => {
	const selector: SortSelector<T, ComparableValue> = (value: T): ComparableValue =>
		(value as Record<PropertyKey, ComparableValue>)[property];
	return createSelectorComparator(selector, direction);
};

const toComparator = <T>(
	comparatorOrSelector: Comparator<T> | SortSelector<T, ComparableValue> | PropertyKey,
	direction?: SortDirection
): Comparator<T> => {
	if (isThenByComparatorCall(comparatorOrSelector, direction)) {
		return comparatorOrSelector;
	}

	if (typeof comparatorOrSelector === "function") {
		return createSelectorComparator(comparatorOrSelector as SortSelector<T, ComparableValue>, direction);
	}

	return createPropertyComparator(comparatorOrSelector, direction);
};

const createFluentComparator = <T>(comparators: readonly Comparator<T>[]): SorterComparator<T> => {
	const comparator = ((a: T, b: T): number => compareSequentially(a, b, comparators)) as SorterComparator<T>;

	const thenByComparator: SorterComparator<T>["thenBy"] = (
		comparatorOrSelector: Comparator<T> | SortSelector<T, ComparableValue> | PropertyKey,
		direction?: SortDirection
	): SorterComparator<T> => createFluentComparator([...comparators, toComparator(comparatorOrSelector, direction)]);

	comparator.thenBy = thenByComparator;

	return comparator;
};

export function thenBy<T>(comparator: Comparator<T>): SorterComparator<T>;
export function thenBy<T, TValue extends ComparableValue>(
	selector: SortSelector<T, TValue>,
	direction?: SortDirection
): SorterComparator<T>;
export function thenBy<T>(property: PropertyKey, direction?: SortDirection): SorterComparator<T>;
export function thenBy<T, K extends ComparablePropertyName<T>>(property: K, direction?: SortDirection): SorterComparator<T>;
export function thenBy<T, TValue extends ComparableValue>(
	comparatorOrSelector: Comparator<T> | SortSelector<T, TValue> | PropertyKey,
	direction?: SortDirection
): SorterComparator<T> {
	return createFluentComparator([toComparator(comparatorOrSelector, direction)]);
}

export function sorter<T>(comparator: Comparator<T>, direction?: SortDirection): SorterComparator<T>;
export function sorter<T, TValue extends ComparableValue>(
	selector: SortSelector<T, TValue>,
	direction?: SortDirection
): SorterComparator<T>;
export function sorter<T>(
	property: ComparablePropertyName<T>,
	direction?: SortDirection
): SorterComparator<T>;
export function sorter<T, TValue extends ComparableValue>(
	comparatorOrSelector: Comparator<T> | SortSelector<T, TValue> | ComparablePropertyName<T>,
	direction: SortDirection = DEFAULT_SORT_DIRECTION
): SorterComparator<T> {
	if (typeof comparatorOrSelector === "function" && hasComparatorArity(comparatorOrSelector)) {
		return createFluentComparator([createDirectionalComparator(comparatorOrSelector, direction)]);
	}

	if (typeof comparatorOrSelector === "function") {
		return createFluentComparator([createSelectorComparator(comparatorOrSelector, direction)]);
	}

	return createFluentComparator([createPropertyComparator(comparatorOrSelector, direction)]);
}
