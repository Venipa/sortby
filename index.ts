export type Comparator<T> = (a: T, b: T) => number;
export type SortDirection = "asc" | "desc";
export type ComparableValue = string | number | bigint | boolean | Date | null | undefined;
export type SortSelector<T, TValue extends ComparableValue> = (value: T) => TValue;

export interface SorterComparator<T> {
	thenBy(comparator: Comparator<T>): SorterComparator<T>;
	thenBy<TValue extends ComparableValue>(
		selector: SortSelector<T, TValue>,
		direction?: SortDirection
	): SorterComparator<T>;
	(a: T, b: T): number;
}

const compareSequentially = <T>(a: T, b: T, comparators: readonly Comparator<T>[]): number => {
	for (const comparator of comparators) {
		const result = comparator(a, b);
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

	if (left == null) {
		return 1;
	}

	if (right == null) {
		return -1;
	}

	if (left instanceof Date && right instanceof Date) {
		return left.getTime() - right.getTime();
	}

	return left > right ? 1 : -1;
};

const isComparatorFunction = <T>(
	value: Comparator<T> | SortSelector<T, ComparableValue>,
	direction?: SortDirection
): value is Comparator<T> => direction === undefined && value.length >= 2;

const toComparator = <T, TValue extends ComparableValue>(
	comparatorOrSelector: Comparator<T> | SortSelector<T, TValue>,
	direction?: SortDirection
): Comparator<T> => {
	if (isComparatorFunction(comparatorOrSelector, direction)) {
		return comparatorOrSelector;
	}

	const sign: number = (direction ?? "desc") === "asc" ? 1 : -1;

	return (a: T, b: T): number => {
		const left: TValue = (comparatorOrSelector as SortSelector<T, TValue>)(a);
		const right: TValue = (comparatorOrSelector as SortSelector<T, TValue>)(b);
		return compareValues(left, right) * sign;
	};
};

const createSorterComparator = <T>(comparators: readonly Comparator<T>[]): SorterComparator<T> => {
	const comparator = ((a: T, b: T): number => compareSequentially(a, b, comparators)) as SorterComparator<T>;

	comparator.thenBy = <TValue extends ComparableValue>(
		comparatorOrSelector: Comparator<T> | SortSelector<T, TValue>,
		direction?: SortDirection
	): SorterComparator<T> => createSorterComparator([...comparators, toComparator(comparatorOrSelector, direction)]);

	return comparator;
};

export function thenBy<T>(comparator: Comparator<T>): SorterComparator<T>;
export function thenBy<T, TValue extends ComparableValue>(
	selector: SortSelector<T, TValue>,
	direction?: SortDirection
): SorterComparator<T>;
export function thenBy<T, TValue extends ComparableValue>(
	comparatorOrSelector: Comparator<T> | SortSelector<T, TValue>,
	direction?: SortDirection
): SorterComparator<T> {
	return createSorterComparator([toComparator(comparatorOrSelector, direction)]);
}

export default function sorter<T>(comparators: Comparator<T>, direction: SortDirection = "desc"): SorterComparator<T> {
	const sign: number = direction === "asc" ? 1 : -1;
	const directedComparator: Comparator<T> = (a: T, b: T): number => comparators(a, b) * sign;
	return createSorterComparator([directedComparator]);
}
