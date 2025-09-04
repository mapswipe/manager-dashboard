import {
    type SetStateAction,
    useCallback,
    useMemo,
    useReducer,
} from 'react';
import { type EntriesAsList } from '@togglecorp/toggle-form';

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

interface SetOrderAction<ORDER extends object> {
    type: 'set-order'
    value: SetStateAction<ORDER | undefined>;
}

type FilterActions<FILTERS extends object, ORDER extends object> = (
    ResetFilterAction
    | SetFilterAction<FILTERS>
    | SetPageAction
    | SetOrderAction<ORDER>
);

interface FilterState<FILTER, ORDER> {
    filters: FILTER,
    order: ORDER | undefined,
    page: number,
}

function useListManagement<FILTERS extends object, ORDER extends object>(options: {
    filters: FILTERS,
    order?: ORDER,
    page?: number,
    pageSize?: number,
    debounceTime?: number,
}) {
    const {
        filters,
        order,
        page = DEFAULT_PAGE,
        pageSize = DEFAULT_PAGE_SIZE,
        debounceTime = 200,
    } = options;

    type Reducer = (
        prevState: FilterState<FILTERS, ORDER>,
        action: FilterActions<FILTERS, ORDER>,
    ) => FilterState<FILTERS, ORDER>;

    const [state, dispatch] = useReducer<Reducer>(
        (prevState, action) => {
            if (action.type === 'reset-filter') {
                return {
                    filters,
                    order,
                    page,
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
            if (action.type === 'set-order') {
                return {
                    ...prevState,
                    order: typeof action.value === 'function'
                        ? action.value(prevState.order)
                        : action.value,
                    page: 1,
                };
            }

            return prevState;
        },
        {
            filters,
            order,
            page,
        },
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
    const setOrder = useCallback(
        (value: SetStateAction<ORDER | undefined>) => {
            dispatch({
                type: 'set-order',
                value,
            });
        },
        [],
    );

    const debouncedState = useDebouncedValue(state, debounceTime);

    const sortState = useMemo(
        () => ({
            sorting: state.order,
            setSorting: setOrder,
        }),
        [state.order, setOrder],
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

        rawOrder: order,
        order: debouncedState.order,

        sortState,
        pageSize,
    };
}

export default useListManagement;
