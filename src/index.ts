import { sorter, thenBy } from "./sorter";

export type { SortDirection, SorterComparator } from "./sorter";
export { sorter, thenBy };

// backwards compatibility
export default sorter;
