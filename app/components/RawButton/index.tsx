import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props<NAME> extends Omit<React.HTMLProps<HTMLButtonElement>, 'ref' | 'onClick' | 'name'>{
    className?: string;
    onClick?: (name: NAME, e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
    name: NAME;
    elementRef?: React.Ref<HTMLButtonElement>;
}

/**
 * The most basic button component (without styles)
 */
function RawButton<NAME>(props: Props<NAME>) {
    const {
        className,
        onClick,
        children,
        disabled,
        elementRef,
        name,
        type = 'button',
        ...otherProps
    } = props;

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            if (onClick) {
                onClick(name, e);
            }
        },
        [onClick, name],
    );

    return (
        <button
            ref={elementRef}
            // eslint-disable-next-line react/button-has-type
            type={type}
            className={_cs(className, styles.rawButton)}
            disabled={disabled}
            onClick={onClick ? handleClick : undefined}
            name={typeof name === 'string' ? name : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            { children }
        </button>
    );
}

export default RawButton;
