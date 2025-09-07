import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    value: string | undefined | null;
    rounded?: boolean;
    compact?: boolean;
}

function ColorPreview(props: Props) {
    const {
        className,
        value,
        rounded,
        compact,
    } = props;

    return (
        <span
            className={_cs(
                styles.colorPreview,
                rounded && styles.rounded,
                compact && styles.compact,
                className,
            )}
            style={{
                backgroundColor: value ?? undefined,
            }}
        />
    );
}

export default ColorPreview;
