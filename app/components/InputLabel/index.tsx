import { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';

import InputInteractivityContext from '#contexts/InputInteractivityContext';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children: React.ReactNode;
    inputId: string;
}

function InputLabel(props: Props) {
    const {
        className,
        children,
        inputId,
    } = props;

    const { focused } = useContext(InputInteractivityContext);

    return (
        <label
            htmlFor={inputId}
            className={_cs(
                styles.inputLabel,
                focused && styles.focused,
                className,
            )}
        >
            {children}
        </label>
    );
}

export default InputLabel;
