import React, {
    useCallback,
    useId,
    useRef,
} from 'react';
import {
    IoIosArrowDown,
    IoIosArrowUp,
    IoMdClose,
} from 'react-icons/io';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import GenericOption, {
    ContentBaseProps,
    OptionKey,
} from '#components/GenericOption';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import { ListLayoutType } from '#components/ListLayout';
import Popup from '#components/Popup';
import RawInput from '#components/RawInput';
import useBlurEffect from '#hooks/useBlurEffect';
import useKeyboard from '#hooks/useKeyboard';
import { SpacingType } from '#utils/styles';

import List from '../List';
import EmptyOptions from './EmptyOptions';

import styles from './styles.module.css';

export type SelectInputContainerProps<
    OK extends OptionKey,
    N,
    O,
    P extends ContentBaseProps,
    OMISSION extends string,
> = Omit<{
    name: N,
    onOptionClick: (optionKey: OK, option: O, name: N) => void;
    dropdownShown: boolean;
    onDropdownShownChange: (value: boolean) => void;
    focused: boolean;
    onFocusedChange: (value: boolean) => void;
    focusedKey: { key: OK, mouse?: boolean } | undefined;
    onFocusedKeyChange: (value: { key: OK, mouse?: boolean } | undefined) => void;
    searchText: string | undefined;
    onSearchTextChange: (search: string | undefined) => void;
    optionContainerClassName?: string;
    optionKeySelector: (datum: O, index: number) => OK;
    optionRenderer: (props: Pick<P, Exclude<keyof P, 'containerClassName' | 'title'>>) => React.ReactNode;
    optionRendererParams: (optionKey: OK, option: O) => P;
    totalOptionsCount?: number;
    optionsPopupContentClassName?: string;
    optionPopupContentLayout?: ListLayoutType;
    optionPopupContentNumPreferredGridColumns?: number;
    options: O[] | undefined | null;
    optionsPending?: boolean;
    optionsFiltered?: boolean;
    optionsPopupClassName?: string;
    persistentOptionPopup?: boolean;
    placeholder?: string;
    valueDisplay: string | undefined;
    spacing?: SpacingType;

    hasValue: boolean;
    nonClearable?: boolean;
    onClear: () => void;
}, OMISSION> & Omit<InputContainerProps, 'input' | 'inputId'>;

const emptyList: unknown[] = [];

// eslint-disable-next-line max-len
function SelectInputContainer<OK extends OptionKey, N, O extends object, P extends ContentBaseProps>(
    props: SelectInputContainerProps<OK, N, O, P, never>,
) {
    const {
        actions,
        className,
        disabled,
        error,
        hint,
        icons,
        label,
        name,
        onOptionClick,
        searchText,
        onSearchTextChange,
        // optionContainerClassName,
        optionKeySelector,
        optionRenderer,
        optionRendererParams,
        options: optionsFromProps,
        optionsPopupClassName,
        optionsPopupContentClassName,
        optionPopupContentLayout,
        optionPopupContentNumPreferredGridColumns,
        persistentOptionPopup,
        readOnly,
        placeholder,
        valueDisplay,
        nonClearable,
        onClear,
        optionsPending,
        optionsFiltered,
        focused,
        focusedKey,
        onFocusedKeyChange,
        onFocusedChange,
        dropdownShown,
        onDropdownShownChange,
        totalOptionsCount,
        hasValue,
        spacing,
    } = props;

    const inputId = useId();
    const options = optionsFromProps ?? (emptyList as O[]);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputSectionRef = useRef<HTMLDivElement>(null);
    const inputElementRef = useRef<HTMLInputElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const handleFocusOut = useCallback(
        () => {
            onFocusedChange(true);
        },
        [onFocusedChange],
    );
    const handleFocusIn = useCallback(
        () => {
            onFocusedChange(true);
        },
        [onFocusedChange],
    );

    const handleSearchInputChange = useCallback(
        (value: string | undefined) => {
            if (!dropdownShown) {
                onDropdownShownChange(true);
            }

            onSearchTextChange(value);
        },
        [
            dropdownShown,
            onDropdownShownChange,
            onSearchTextChange,
        ],
    );

    const handleToggleDropdown = useCallback(
        () => {
            onDropdownShownChange(!dropdownShown);
        },
        [dropdownShown, onDropdownShownChange],
    );

    const handleShowDropdown = useCallback(
        () => {
            // FIXME: this is not atomic
            // FIXME: call only once
            if (!dropdownShown) {
                onDropdownShownChange(true);
            }
        },
        [
            dropdownShown,
            onDropdownShownChange,
        ],
    );

    const handleHideDropdown = useCallback(
        () => {
            onDropdownShownChange(false);
        },
        [
            onDropdownShownChange,
        ],
    );

    const handleSearchInputClick = useCallback(
        () => {
            if (readOnly) {
                return;
            }
            handleShowDropdown();
        },
        [readOnly, handleShowDropdown],
    );

    const handlePopupBlur = useCallback(
        (clickedInside: boolean, clickedInParent: boolean) => {
            if (clickedInParent) {
                return;
            }

            if (clickedInside && persistentOptionPopup) {
                inputElementRef.current?.focus();
                return;
            }

            handleHideDropdown();
        },
        [handleHideDropdown, persistentOptionPopup],
    );

    const handleOptionClick = useCallback(
        (valueKey: OK, value: O) => {
            onOptionClick(valueKey, value, name);
            if (!persistentOptionPopup) {
                handleHideDropdown();
            }
        },
        [onOptionClick, handleHideDropdown, persistentOptionPopup, name],
    );

    const optionListRendererParams = useCallback(
        (key: OK, option: O) => ({
            contentRendererParam: optionRendererParams,
            option,
            optionKey: key,
            focusedKey,
            contentRenderer: optionRenderer,
            onClick: handleOptionClick,
            onFocus: onFocusedKeyChange,
        }),
        [focusedKey, handleOptionClick, onFocusedKeyChange, optionRenderer, optionRendererParams],
    );

    useBlurEffect(
        dropdownShown,
        handlePopupBlur,
        popupRef,
        containerRef,
    );

    const handleKeyDown = useKeyboard(
        focusedKey,
        optionKeySelector,
        options,
        dropdownShown,

        onFocusedKeyChange,
        handleHideDropdown,
        handleShowDropdown,
        handleOptionClick,
    );

    return (
        <>
            <InputContainer
                elementRef={containerRef}
                inputSectionRef={inputSectionRef}
                actions={(
                    <>
                        {actions}
                        {!readOnly && !nonClearable && hasValue && (
                            <Button
                                onClick={onClear}
                                disabled={disabled}
                                styleVariant="action"
                                name={undefined}
                                title="Clear"
                            >
                                <IoMdClose />
                            </Button>
                        )}
                        {!readOnly && (
                            <Button
                                onClick={handleToggleDropdown}
                                styleVariant="action"
                                name={undefined}
                                title={dropdownShown ? 'Close' : 'Open'}
                            >
                                {dropdownShown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                            </Button>
                        )}
                    </>
                )}
                className={className}
                disabled={disabled}
                error={error}
                hint={hint}
                icons={icons}
                label={label}
                readOnly={readOnly}
                inputId={inputId}
                spacing={spacing}
                input={(
                    <RawInput
                        id={inputId}
                        name={name}
                        elementRef={inputElementRef}
                        readOnly={readOnly}
                        disabled={disabled}
                        value={(dropdownShown || focused) ? searchText : valueDisplay}
                        onChange={handleSearchInputChange}
                        onClick={handleSearchInputClick}
                        onFocus={handleFocusIn}
                        onBlur={handleFocusOut}
                        placeholder={valueDisplay ?? placeholder}
                        autoComplete="off"
                        onKeyDown={handleKeyDown}
                    />
                )}
            />
            {dropdownShown && (
                <Popup
                    elementRef={popupRef}
                    parentRef={inputSectionRef}
                    className={_cs(optionsPopupClassName, styles.popup)}
                    contentClassName={_cs(
                        styles.popupContent,
                        optionsPopupContentClassName,
                    )}
                    contentLayout={optionPopupContentLayout}
                    contentNumPreferredGridColumns={optionPopupContentNumPreferredGridColumns}
                >
                    <List
                        data={options}
                        keySelector={optionKeySelector}
                        renderer={GenericOption}
                        rendererParams={optionListRendererParams}
                    />
                    <EmptyOptions
                        filtered={optionsFiltered}
                        pending={optionsPending}
                        optionsCount={options.length}
                        totalOptionsCount={totalOptionsCount}
                    />
                </Popup>
            )}
        </>
    );
}

export default SelectInputContainer;
