import {
    useCallback,
    useContext,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import InputInteractivityContext from '#base/context/InputInteractivityContext';

import styles from './styles.module.css';

export interface Props<NAME> extends Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'value' | 'name'> {
    className?: string;
    name: NAME;
    value: string | undefined | null;
    onChange?: (
        value: string | undefined,
        name: NAME,
        e: React.FormEvent<HTMLInputElement> | undefined,
    ) => void;
    elementRef?: React.Ref<HTMLInputElement>;
}

function RawInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        onChange,
        elementRef,
        value,
        name,
        disabled,
        readOnly,
        onFocus,
        onBlur,
        ...otherProps
    } = props;

    const { setFocused } = useContext(InputInteractivityContext);

    const handleFocus = useCallback<React.FocusEventHandler<HTMLInputElement>>((e) => {
        setFocused(true);

        if (isDefined(onFocus)) {
            onFocus(e);
        }
    }, [setFocused, onFocus]);

    const handleBlur = useCallback<React.FocusEventHandler<HTMLInputElement>>((e) => {
        setFocused(false);

        if (isDefined(onBlur)) {
            onBlur(e);
        }
    }, [setFocused, onBlur]);

    const handleChange = useCallback(
        (e: React.FormEvent<HTMLInputElement>) => {
            const {
                currentTarget: {
                    value: v,
                },
            } = e;

            if (onChange) {
                onChange(
                    v === '' ? undefined : v,
                    name,
                    e,
                );
            }
        },
        [name, onChange],
    );

    return (
        <input
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(className, styles.rawInput)}
            onChange={handleChange}
            name={typeof name === 'string' ? name : undefined}
            value={value ?? ''}
            disabled={disabled || readOnly}
            readOnly={readOnly}
            ref={elementRef}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
}

export default RawInput;
