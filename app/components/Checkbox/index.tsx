import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import ButtonLayout from '#components/ButtonLayout';
import DefaultCheckmark, { Props as CheckmarkProps } from '#components/Checkmark';

import styles from './styles.module.css';

export interface Props<NAME> {
    className?: string;
    labelClassName?: string;
    checkmark?: (p: CheckmarkProps) => React.ReactElement;
    checkmarkClassName?: string;
    label?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    indeterminate?: boolean;
    tooltip?: string;
    value: boolean | undefined | null;
    onChange: (value: boolean, name: NAME) => void;
    name: NAME;
}

function Checkbox<const NAME>(props: Props<NAME>) {
    const {
        label,
        tooltip,
        checkmark: Checkmark = DefaultCheckmark,
        className: classNameFromProps,
        value,
        disabled,
        readOnly,
        onChange,
        checkmarkClassName,
        labelClassName,
        indeterminate,
        name,
        ...otherProps
    } = props;

    const handleChange = useCallback(
        (e: React.FormEvent<HTMLInputElement>) => {
            const v = e.currentTarget.checked;
            onChange(v, name);
        },
        [name, onChange],
    );

    const className = _cs(
        classNameFromProps,
        indeterminate && styles.indeterminate,
        !indeterminate && value && styles.checked,
        readOnly && styles.readOnly,
    );

    return (
        <label // eslint-disable-line jsx-a11y/label-has-associated-control
            className={styles.checkbox}
            title={tooltip}
        >
            <ButtonLayout
                className={className}
                start={(
                    <Checkmark
                        className={_cs(checkmarkClassName, styles.checkmark)}
                        value={value ?? false}
                        indeterminate={indeterminate}
                    />
                )}
                spacingOffset={-2}
                withoutPadding
                disabled={disabled}
                styleVariant="transparent"
            >
                <input
                    onChange={handleChange}
                    className={styles.input}
                    type="checkbox"
                    checked={value ?? false}
                    disabled={disabled || readOnly}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                />
                <div
                    className={_cs(
                        // styles.label,
                        labelClassName,
                    )}
                >
                    { label }
                </div>
            </ButtonLayout>
        </label>
    );
}

export default Checkbox;
