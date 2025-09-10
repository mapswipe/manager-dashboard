import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    compact?: boolean;
}

function Description(props: Props) {
    const {
        className,
        children,
        compact,
    } = props;

    return (
        <div
            className={_cs(
                styles.description,
                compact && styles.compact,
                className,
            )}
        >
            {children}
        </div>
    );
}

export default Description;
