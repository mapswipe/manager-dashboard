import {
    type SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
} from 'react';
import { useSearchParams } from 'react-router';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
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

interface SetListStateAction<FILTERS, SORT> {
    type: 'set-state';
    value: ListState<FILTERS, SORT>;
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
    | SetListStateAction<FILTERS, SORT>
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
    syncWithUrl?: boolean,
}

const PAGE_PARAM = 'page';
const SORT_PARAM = 'sort';

function isSameValue(foo: unknown, bar: unknown) {
    if (!hasSomeDefinedValue(foo) && !hasSomeDefinedValue(bar)) {
        return true;
    }
    return JSON.stringify(foo) === JSON.stringify(bar);
}

function getOwnedKeys(defaultFilters: object) {
    return [...Object.keys(defaultFilters), PAGE_PARAM, SORT_PARAM];
}

function getOwnedParams(params: URLSearchParams, ownedKeys: string[]) {
    const ownedParams = new URLSearchParams();
    ownedKeys.forEach((key) => {
        const value = params.get(key);
        if (isDefined(value)) {
            ownedParams.set(key, value);
        }
    });
    return ownedParams;
}

function parseFilters<FILTERS extends object>(
    params: URLSearchParams,
    defaultFilters: FILTERS,
): FILTERS {
    const filters = { ...defaultFilters };
    (Object.keys(defaultFilters) as (keyof FILTERS & string)[]).forEach((key) => {
        const rawValue = params.get(key);
        if (isNotDefined(rawValue)) {
            return;
        }
        const value = JSON.parse(rawValue);
        if (value === null) {
            return;
        }
        const defaultValue = defaultFilters[key];
        if (
            isDefined(defaultValue)
                && (
                    typeof value !== typeof defaultValue
                    || Array.isArray(value) !== Array.isArray(defaultValue)
                )
        ) {
            return;
        }
        filters[key] = value;
    });
    return filters;
}

function parsePage(params: URLSearchParams, defaultPage: number) {
    const rawValue = params.get(PAGE_PARAM);
    if (isNotDefined(rawValue)) {
        return defaultPage;
    }
    const page = Number(rawValue);
    return Number.isInteger(page) && page >= 1 ? page : defaultPage;
}

function parseSort<SORT>(params: URLSearchParams, defaultSort: SORT | undefined) {
    const rawValue = params.get(SORT_PARAM);
    if (isNotDefined(rawValue)) {
        return defaultSort;
    }
    const descending = rawValue.startsWith('-');
    const key = descending ? rawValue.slice(1) : rawValue;
    if (key.length === 0) {
        return defaultSort;
    }
    return {
        key,
        ordering: descending ? Ordering.Desc : Ordering.Asc,
    } as SORT;
}

function serializeSort(sort: SortState<unknown> | undefined) {
    if (isNotDefined(sort)) {
        return undefined;
    }
    const descending = sort.ordering === Ordering.Desc
        || sort.ordering === Ordering.DescNullsFirst
        || sort.ordering === Ordering.DescNullsLast;
    return `${descending ? '-' : ''}${String(sort.key)}`;
}

function serializeState<FILTERS extends object, SORT extends SortState<unknown>>(
    state: ListState<FILTERS, SORT>,
    defaults: ListState<FILTERS, SORT>,
) {
    const params = new URLSearchParams();
    (Object.keys(defaults.filters) as (keyof FILTERS & string)[]).forEach((key) => {
        const value = state.filters[key];
        if (!isSameValue(value, defaults.filters[key]) && hasSomeDefinedValue(value)) {
            params.set(key, JSON.stringify(value));
        }
    });
    if (state.page !== defaults.page) {
        params.set(PAGE_PARAM, String(state.page));
    }
    const sort = serializeSort(state.sort);
    if (isDefined(sort) && sort !== serializeSort(defaults.sort)) {
        params.set(SORT_PARAM, sort);
    }
    return params;
}

function parseState<FILTERS extends object, SORT>(
    params: URLSearchParams,
    defaults: ListState<FILTERS, SORT>,
): ListState<FILTERS, SORT> {
    return {
        filters: parseFilters(params, defaults.filters),
        sort: parseSort(params, defaults.sort),
        page: parsePage(params, defaults.page),
    };
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
        syncWithUrl = false,
    } = options;

    const [searchParams, setSearchParams] = useSearchParams();

    const defaults: ListState<FILTERS, SORT> = {
        filters: defaultFilters,
        sort: defaultSort,
        page: defaultPage,
    };

    type Reducer = (
        prevState: ListState<FILTERS, SORT>,
        action: ListStateActions<FILTERS, SORT>,
    ) => ListState<FILTERS, SORT>;

    const [state, dispatch] = useReducer<Reducer, undefined>(
        (prevState, action) => {
            if (action.type === 'reset-filter') {
                return defaults;
            }
            if (action.type === 'set-state') {
                return action.value;
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
        undefined,
        () => (syncWithUrl ? parseState(searchParams, defaults) : defaults),
    );

    const defaultsRef = useRef(defaults);
    defaultsRef.current = defaults;
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    const lastSyncedParamsRef = useRef<string | undefined>(undefined);
    if (isNotDefined(lastSyncedParamsRef.current)) {
        lastSyncedParamsRef.current = syncWithUrl
            ? getOwnedParams(searchParams, getOwnedKeys(defaultFilters)).toString()
            : '';
    }

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

    useEffect(
        () => {
            if (!syncWithUrl) {
                return;
            }
            const currentDefaults = defaultsRef.current;
            const ownedKeys = getOwnedKeys(currentDefaults.filters);
            const ownedParams = getOwnedParams(searchParams, ownedKeys).toString();
            if (ownedParams === lastSyncedParamsRef.current) {
                return;
            }
            lastSyncedParamsRef.current = ownedParams;
            dispatch({
                type: 'set-state',
                value: parseState(searchParams, currentDefaults),
            });
        },
        [syncWithUrl, searchParams],
    );

    useEffect(
        () => {
            if (!syncWithUrl) {
                return;
            }
            const currentDefaults = defaultsRef.current;
            const ownedKeys = getOwnedKeys(currentDefaults.filters);

            const nextOwnedParams = serializeState(debouncedState, currentDefaults);
            const nextOwnedParamsString = nextOwnedParams.toString();
            lastSyncedParamsRef.current = nextOwnedParamsString;

            const currentOwnedParams = getOwnedParams(searchParamsRef.current, ownedKeys);
            if (currentOwnedParams.toString() === nextOwnedParamsString) {
                return;
            }

            const nextParams = new URLSearchParams(searchParamsRef.current);
            ownedKeys.forEach((key) => {
                nextParams.delete(key);
            });
            nextOwnedParams.forEach((value, key) => {
                nextParams.set(key, value);
            });
            setSearchParams(nextParams, { replace: true });
        },
        [syncWithUrl, debouncedState, setSearchParams],
    );

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
