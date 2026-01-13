import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import ButtonLayout from '#components/ButtonLayout';
import DefaultCheckmark, { Props as CheckmarkProps } from '#components/Checkmark';
import InputError from '#components/InputError';
import InputHint from '#components/InputHint';
import ListLayout from '#components/ListLayout';
import { SpacingType } from '#utils/styles';

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
    hint?: React.ReactNode;
    error?: React.ReactNode;
    spacing?: SpacingType;
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
        hint,
        error,
        spacing,
        ...otherProps
    } = props;

    const handleChange = useCallback(
        (e: React.FormEvent<HTMLInputElement>) => {
            const v = e.currentTarget.checked;
            onChange(v, name);
        },
        [name, onChange],
    );

    return (
        <label // eslint-disable-line jsx-a11y/label-has-associated-control
            className={styles.checkbox}
            title={tooltip}
        >
            <ListLayout
                className={classNameFromProps}
                spacing={spacing}
                spacingOffset={-1}
                layout="block"
            >
                <ButtonLayout
                    className={_cs(
                        indeterminate && styles.indeterminate,
                        !indeterminate && value && styles.checked,
                        readOnly && styles.readOnly,
                    )}
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
                {/* FIXME: Style these */}
                {error && (
                    <InputError>
                        {error}
                    </InputError>
                )}
                {!error && hint && (
                    <InputHint>
                        {hint}
                    </InputHint>
                )}
            </ListLayout>
        </label>
    );
}

export default Checkbox;
