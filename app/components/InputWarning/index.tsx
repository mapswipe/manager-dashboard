import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children: React.ReactNode;
}

function InputWarning(props: Props) {
    const {
        className,
        children,
    } = props;

    return (
        <div className={_cs(styles.inputWarning, className)}>
            {children}
        </div>
    );
}

export default InputWarning;
