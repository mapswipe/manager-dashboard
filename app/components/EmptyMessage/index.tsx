import { isDefined } from '@togglecorp/fujs';
import styles from './styles.module.css';

interface Props {
    icon?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
}

function EmptyMessage(props: Props) {
    const {
        icon,
        title,
        description,
    } = props;

    return (
        <div className={styles.emptyMessage}>
            {isDefined(icon) && (
                <div className={styles.icon}>
                    {icon}
                </div>
            )}
            <div className={styles.emptyMessageTitle}>
                {title}
            </div>
            {isDefined(description) && (
                <div className={styles.emptyMessageDescription}>
                    {description}
                </div>
            )}
        </div>
    );
}

export default EmptyMessage;
