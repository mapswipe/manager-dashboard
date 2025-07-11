import {
    useCallback,
    useContext,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import InputInteractivityContext from '#base/context/InputInteractivityContext';

import styles from './styles.module.css';

export interface Props<NAME> extends Omit<React.HTMLProps<HTMLTextAreaElement>, 'ref' | 'onChange' | 'value' | 'name'> {
    className?: string;
    name: NAME;
    value: string | undefined | null;
    onChange?: (
        value: string | undefined,
        name: NAME,
        e: React.FormEvent<HTMLTextAreaElement> | undefined,
    ) => void;
    elementRef?: React.Ref<HTMLTextAreaElement>;
}

function RawTextArea<const NAME>(props: Props<NAME>) {
    const {
        className,
        onChange,
        elementRef,
        value,
        name,
        disabled,
        readOnly,
        ...otherProps
    } = props;

    const { setFocused } = useContext(InputInteractivityContext);

    const handleFocus = useCallback(() => {
        setFocused(true);
    }, [setFocused]);

    const handleBlur = useCallback(() => {
        setFocused(false);
    }, [setFocused]);

    const handleChange = useCallback(
        (e: React.FormEvent<HTMLTextAreaElement>) => {
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
        <textarea
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            ref={elementRef}
            className={_cs(className, styles.rawTextArea)}
            onChange={handleChange}
            name={typeof name === 'string' ? name : undefined}
            value={value ?? ''}
            disabled={disabled || readOnly}
            readOnly={readOnly}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
}

export default RawTextArea;
