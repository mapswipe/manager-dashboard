import { useMemo } from 'react';
import {
    _cs,
    bound,
    isNotDefined,
} from '@togglecorp/fujs';

import { formatNumber } from '#utils/common';

import styles from './styles.module.css';

interface Props {
    className?: string;
    value: number | undefined | null;
    total: number | undefined | null;
}

function ProgressBar(props: Props) {
    const {
        className,
        value,
        total,
    } = props;

    const progress = useMemo(() => {
        if (isNotDefined(value) || isNotDefined(total)) {
            return 0;
        }

        return bound(100 * (value / total), 0, 100);
    }, [total, value]);

    return (
        <div className={_cs(styles.progressBar, className)}>
            <div className={styles.track} />
            <div
                className={styles.progress}
                style={{
                    width: `${progress}%`,
                }}
            />
            <div
                className={styles.label}
                style={{
                    left: `${progress}%`,
                    transform: progress > 50 ? 'translateX(-100%)' : undefined,
                }}
            >
                {formatNumber(Math.floor(progress), { suffix: '%' })}
            </div>
        </div>
    );
}

export default ProgressBar;
