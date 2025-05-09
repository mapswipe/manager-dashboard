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
            {icon && (
                <div className={styles.icon}>
                    {icon}
                </div>
            )}
            <div className={styles.emptyMessageTitle}>
                {title}
            </div>
            <div className={styles.emptyMessageDescription}>
                {description}
            </div>
        </div>
    );
}

export default EmptyMessage;
