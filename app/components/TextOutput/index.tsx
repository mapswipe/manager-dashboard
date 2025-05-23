import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    icon?: React.ReactNode
    label: React.ReactNode;
    value: React.ReactNode;
    description?: React.ReactNode;
    withoutLabelColon?: boolean;
}

function TextOutput(props: Props) {
    const {
        className,
        icon,
        label,
        value,
        description,
        withoutLabelColon,
    } = props;

    return (
        <div
            className={_cs(
                styles.textOutput,
                className,
            )}
        >
            {icon && (
                <div>
                    {icon}
                </div>
            )}
            <div
                className={_cs(
                    styles.label,
                    !withoutLabelColon && styles.withColon,
                )}
            >
                {label}
            </div>
            <div className={styles.value}>
                {value}
            </div>
            {description && (
                <div>
                    {description}
                </div>
            )}
        </div>
    );
}

export default TextOutput;
