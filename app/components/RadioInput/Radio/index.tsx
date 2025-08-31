import { useCallback } from 'react';
import {
    IoRadioButtonOff,
    IoRadioButtonOn,
} from 'react-icons/io5';
import { _cs } from '@togglecorp/fujs';

import ButtonLayout from '#components/ButtonLayout';
import { SpacingType } from '#utils/styles';

import styles from './styles.module.css';

export interface Props<N> {
    className?: string;
    inputName?: string;
    label?: React.ReactNode;
    name: N;
    onClick: (name: N) => void;
    value: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    spacing?: SpacingType;
}

function Radio<N>(props: Props<N>) {
    const {
        name,
        label,
        className,
        value,
        inputName,
        onClick,
        disabled,
        readOnly,
        spacing,
    } = props;

    const handleClick = useCallback(() => {
        if (onClick) {
            onClick(name);
        }
    }, [name, onClick]);

    return (
        // eslint-disable-next-line jsx-a11y/label-has-associated-control
        <label className={styles.radio}>
            <ButtonLayout
                className={_cs(
                    styles.radioContent,
                    value && styles.active,
                    className,
                    readOnly && styles.readOnly,
                )}
                start={value ? (
                    <IoRadioButtonOn className={styles.icon} />
                ) : (
                    <IoRadioButtonOff className={styles.icon} />
                )}
                spacingOffset={-2}
                withoutPadding
                disabled={disabled}
                styleVariant="transparent"
                spacing={spacing}
            >
                {label}
                <input
                    className={styles.input}
                    type="radio"
                    name={inputName}
                    defaultChecked={value}
                    onClick={handleClick}
                    disabled={disabled}
                />
            </ButtonLayout>
        </label>
    );
}

export default Radio;
