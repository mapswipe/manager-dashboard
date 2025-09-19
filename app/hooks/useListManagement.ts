import {
    type SetStateAction,
    useCallback,
    useMemo,
    useReducer,
} from 'react';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import { Ordering } from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    hasSomeDefinedValue,
} from '#utils/common';

interface ResetFilterAction {
    type: 'reset-filter';
}

interface SetFilterAction<FILTERS extends object> {
    type: 'set-filter';
    value: SetStateAction<FILTERS>;
}

interface SetPageAction {
    type: 'set-page';
    value: number;
}

interface SetSortAction<SORT_KEY extends object> {
    type: 'set-sort'
    value: SetStateAction<SORT_KEY | undefined>;
}

export type ListFilter<
    FILTER extends object,
    PROPERTY extends keyof FILTER,
> = NonNullable<FILTER[PROPERTY]> extends { inList?: infer TYPE }
    ? NonNullable<TYPE> | undefined
    : never;

export type SearchFilter<
    FILTER extends object,
    PROPERTY extends keyof FILTER,
> = NonNullable<FILTER[PROPERTY]> extends { iContains?: infer TYPE }
    ? NonNullable<TYPE> | undefined
    : never;

export type ExactFilter<
    FILTER extends object,
    PROPERTY extends keyof FILTER,
> = NonNullable<FILTER[PROPERTY]> extends { exact?: infer TYPE }
    ? NonNullable<TYPE> | undefined
    : never;

export type IdFilter<
    FILTER extends object,
    PROPERTY extends keyof FILTER,
> = NonNullable<FILTER[PROPERTY]> extends { id?: infer TYPE } ? TYPE : never;

export type IsNullFilter<
    FILTER extends object,
    PROPERTY extends keyof FILTER,
> = NonNullable<FILTER[PROPERTY]> extends { isNull?: infer TYPE } ? TYPE : never;

interface SortState<SORT_KEY> {
    key: SORT_KEY;
    ordering: Ordering;
}

interface ListState<FILTER, SORT> {
    filters: FILTER,
    sort: SORT | undefined,
    page: number,
}

type ListStateActions<FILTERS extends object, SORT extends object> = (
    ResetFilterAction
    | SetFilterAction<FILTERS>
    | SetPageAction
    | SetSortAction<SORT>
);

interface Option<FILTERS, SORT> {
    defaultFilters: FILTERS,
    defaultSort ?: SORT,
    defaultPage?: number,
    pageSize?: number,
    debounceTime?: number,
}

function useListManagement<
    FILTERS extends object,
    SORT_KEY,
    SORT extends SortState<SORT_KEY> = SortState<SORT_KEY>,
>(
    options: Option<FILTERS, SORT>,
) {
    const {
        defaultFilters,
        defaultSort,
        defaultPage = DEFAULT_PAGE,
        pageSize = DEFAULT_PAGE_SIZE,
        debounceTime = 200,
    } = options;

    type Reducer = (
        prevState: ListState<FILTERS, SORT>,
        action: ListStateActions<FILTERS, SORT>,
    ) => ListState<FILTERS, SORT>;

    const [state, dispatch] = useReducer<Reducer>(
        (prevState, action) => {
            if (action.type === 'reset-filter') {
                return {
                    filters: defaultFilters,
                    sort: defaultSort,
                    page: defaultPage,
                };
            }
            if (action.type === 'set-filter') {
                return {
                    ...prevState,
                    filters: typeof action.value === 'function'
                        ? action.value(prevState.filters)
                        : action.value,
                    page: 1,
                };
            }
            if (action.type === 'set-page') {
                return {
                    ...prevState,
                    page: action.value,
                };
            }
            if (action.type === 'set-sort') {
                return {
                    ...prevState,
                    sort: typeof action.value === 'function'
                        ? action.value(prevState.sort)
                        : action.value,
                    page: 1,
                };
            }

            return prevState;
        },
        {
            filters: defaultFilters,
            sort: defaultSort,
            page: defaultPage,
        } satisfies ListState<FILTERS, SORT>,
    );

    const setFilters = useCallback(
        (value: SetStateAction<FILTERS>) => {
            dispatch({
                type: 'set-filter',
                value,
            });
        },
        [],
    );

    const resetFilters = useCallback(
        () => {
            dispatch({ type: 'reset-filter' });
        },
        [],
    );

    const setFilterField = useCallback(
        (...args: EntriesAsList<FILTERS>) => {
            const [val, key] = args;
            setFilters((oldFilterValue) => {
                const newFilterValue = {
                    ...oldFilterValue,
                    [key]: val,
                };
                return newFilterValue;
            });
        },
        [setFilters],
    );

    const setPage = useCallback(
        (value: number) => {
            dispatch({
                type: 'set-page',
                value,
            });
        },
        [],
    );

    const setSort = useCallback(
        (value: SetStateAction<SORT | undefined>) => {
            dispatch({
                type: 'set-sort',
                value,
            });
        },
        [],
    );

    const setSortKey = useCallback(
        (newKey: SORT_KEY) => {
            setSort((oldSortState) => {
                const newSortState = {
                    ...oldSortState,
                    key: newKey,
                } as SORT;

                return newSortState;
            });
        },
        [setSort],
    );

    const setSortOrdering = useCallback(
        (newOrdering: Ordering) => {
            setSort((oldSortState) => {
                const newSortState = {
                    ...oldSortState,
                    ordering: newOrdering,
                } as SORT;

                return newSortState;
            });
        },
        [setSort],
    );

    const debouncedState = useDebouncedValue(state, debounceTime);

    const filtersApplied = useMemo(
        () => hasSomeDefinedValue(debouncedState.filters),
        [debouncedState.filters],
    );
    const rawFiltersApplied = useMemo(
        () => hasSomeDefinedValue(state.filters),
        [state.filters],
    );

    return {
        rawFilters: state.filters,
        rawFiltersApplied,

        filters: debouncedState.filters,
        filtersApplied,
        setFilters,
        setFilterField,

        resetFilters,

        page: state.page,
        offset: pageSize * (debouncedState.page - 1),
        limit: pageSize,
        setPage,
        pageSize,

        rawSort: state.sort,
        sort: state.sort,

        setSortKey,
        setSortOrdering,

    };
}

export default useListManagement;
