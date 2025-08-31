import React, {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { FaCheck } from 'react-icons/fa6';
import {
    _cs,
    isDefined,
    listToMap,
    unique,
} from '@togglecorp/fujs';

import ButtonLayout from '#components/ButtonLayout';
import SelectInputContainer, { SelectInputContainerProps } from '#components/SelectInputContainer';

import {
    OptionKey,
    rankedSearchOnList,
} from '../utils';

import styles from './styles.module.css';

interface OptionProps {
    children: React.ReactNode;
}

function Option(props: OptionProps) {
    const { children } = props;

    return (
        <ButtonLayout
            className={styles.optionLayout}
            start={<FaCheck className={styles.icon} />}
            styleVariant="transparent"
            withFullWidth
            childrenContainerClassName={styles.label}
            withoutPadding
        >
            { children }
        </ButtonLayout>
    );
}

type Def = { containerClassName?: string, title?: string; };

export type SearchSelectInputProps<
    T extends OptionKey,
    K,
    O extends object,
    P extends Def,
    OMISSION extends string,
> = Omit<{
    value: T | undefined | null;
    options: O[] | undefined | null;
    searchOptions?: O[] | undefined | null;
    keySelector: (option: O) => T;
    labelSelector: (option: O) => string;
    optionLabelSelector?: (option: O) => React.ReactNode;
    name: K;
    disabled?: boolean;
    readOnly?: boolean;
    onOptionsChange?: React.Dispatch<React.SetStateAction<O[] | undefined | null>>;
    sortFunction?: (options: O[], search: string, labelSelector: (option: O) => string) => O[];
    onSearchValueChange?: (value: string | undefined) => void;
    onShowDropdownChange?: (value: boolean) => void;
}, OMISSION> & (
    SelectInputContainerProps<T, K, O, P,
        'name'
        | 'options'
        | 'nonClearable'
        | 'onClear'
        | 'onOptionClick'
        | 'optionKeySelector'
        | 'optionRenderer'
        | 'optionRendererParams'
        | 'optionsFiltered'
        | 'persistentOptionPopup'
        | 'valueDisplay'
        | 'optionContainerClassName'
        | 'searchText'
        | 'onSearchTextChange'
        | 'dropdownShown'
        | 'onDropdownShownChange'
        | 'focused'
        | 'onFocusedChange'
        | 'focusedKey'
        | 'onFocusedKeyChange'
        | 'hasValue'
    >
) & (
    { nonClearable: true; onChange: (newValue: T, name: K) => void }
    | { nonClearable?: false; onChange: (newValue: T | undefined, name: K) => void }
);

const emptyList: unknown[] = [];

function SearchSelectInput<
    T extends OptionKey,
    K,
    O extends object,
    P extends Def,
>(
    props: SearchSelectInputProps<T, K, O, P, never>,
) {
    const {
        keySelector,
        labelSelector,
        optionLabelSelector = labelSelector,
        name,
        onChange,
        onOptionsChange,
        options: optionsFromProps,
        optionsPending,
        value,
        sortFunction,
        searchOptions: searchOptionsFromProps,
        onSearchValueChange,
        onShowDropdownChange,
        ...otherProps
    } = props;

    const options = optionsFromProps ?? (emptyList as O[]);
    const searchOptions = searchOptionsFromProps ?? (emptyList as O[]);

    const [searchInputValue, setSearchInputValue] = React.useState<string | undefined>('');
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const [
        focusedKey,
        setFocusedKey,
    ] = React.useState<{ key: T, mouse?: boolean } | undefined>();

    const [selectedKeys, setSelectedKeys] = useState<{
        [key: string]: boolean,
    }>({});

    const optionsLabelMap = useMemo(
        () => (
            listToMap(options, (...p) => String(keySelector(...p)), labelSelector)
        ),
        [options, keySelector, labelSelector],
    );

    const valueDisplay = isDefined(value) ? optionsLabelMap[String(value)] ?? '?' : undefined;

    // NOTE: we can skip this calculation if optionsShowInitially is false
    const selectedOptions = useMemo(
        () => {
            const selectedValue = options?.find((item) => keySelector(item) === value);
            return !selectedValue ? [] : [selectedValue];
        },
        [value, options, keySelector],
    );

    const realOptions = useMemo(
        () => {
            const allOptions = unique(
                [...searchOptions, ...selectedOptions],
                (...p) => String(keySelector(...p)),
            );

            const initiallySelected = allOptions
                .filter((item) => selectedKeys[String(keySelector(item))]);
            const initiallyNotSelected = allOptions
                .filter((item) => !selectedKeys[String(keySelector(item))]);

            if (sortFunction) {
                return [
                    ...rankedSearchOnList(initiallySelected, searchInputValue, labelSelector),
                    ...sortFunction(initiallyNotSelected, searchInputValue ?? '', labelSelector),
                ];
            }

            return [
                ...rankedSearchOnList(initiallySelected, searchInputValue, labelSelector),
                ...initiallyNotSelected,
            ];
        },
        [
            keySelector,
            labelSelector,
            searchInputValue,
            searchOptions,
            selectedKeys,
            selectedOptions,
            sortFunction,
        ],
    );

    const handleSearchValueChange = useCallback(
        (searchValue: string | undefined) => {
            setSearchInputValue(searchValue);
            if (onSearchValueChange) {
                onSearchValueChange(searchValue);
            }
        },
        [onSearchValueChange],
    );

    const handleChangeDropdown = useCallback(
        (myVal: boolean) => {
            setShowDropdown(myVal);
            if (onShowDropdownChange) {
                onShowDropdownChange(myVal);
            }
            if (myVal) {
                setSelectedKeys(
                    listToMap(
                        value ? [value] : [],
                        (item) => String(item),
                        () => true,
                    ),
                );
                setFocusedKey(value ? { key: value } : undefined);
            } else {
                setSelectedKeys({});
                setFocusedKey(undefined);
                setSearchInputValue('');
                if (onSearchValueChange) {
                    onSearchValueChange('');
                }
            }
        },
        [value, onSearchValueChange, onShowDropdownChange],
    );

    const optionRendererParams = useCallback(
        (key: OptionKey, option: O) => {
            const isActive = key === value;

            return {
                children: optionLabelSelector(option),
                containerClassName: _cs(styles.option, isActive && styles.active),
                title: labelSelector(option),
            };
        },
        [value, optionLabelSelector, labelSelector],
    );

    const handleOptionClick = useCallback(
        (k: T, v: O) => {
            if (onOptionsChange) {
                onOptionsChange(((existingOptions) => {
                    const safeOptions = existingOptions ?? [];
                    const opt = safeOptions.find((item) => keySelector(item) === k);
                    if (opt) {
                        return existingOptions;
                    }
                    return [...safeOptions, v];
                }));
            }
            onChange(k, name);
        },
        [onChange, name, onOptionsChange, keySelector],
    );

    const handleClear = useCallback(
        () => {
            // eslint-disable-next-line react/destructuring-assignment
            if (!props.nonClearable) {
                // eslint-disable-next-line react/destructuring-assignment
                const changeHandler = props.onChange;
                changeHandler(undefined, name);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [name, props.onChange, props.nonClearable],
    );

    return (
        <SelectInputContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            name={name}
            options={realOptions}
            optionsPending={optionsPending}
            optionsFiltered={(searchInputValue?.length ?? 0) > 0}
            optionKeySelector={keySelector}
            optionRenderer={Option}
            optionRendererParams={optionRendererParams}
            // optionContainerClassName={styles.optionContainer}
            onOptionClick={handleOptionClick}
            valueDisplay={valueDisplay}
            onClear={handleClear}
            searchText={searchInputValue}
            onSearchTextChange={handleSearchValueChange}
            dropdownShown={showDropdown}
            onDropdownShownChange={handleChangeDropdown}
            focused={focused}
            onFocusedChange={setFocused}
            focusedKey={focusedKey}
            onFocusedKeyChange={setFocusedKey}
            hasValue={isDefined(value)}
            persistentOptionPopup={false}
        />
    );
}

export default SearchSelectInput;
