import { _cs } from '@togglecorp/fujs';

import { type PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema';
import Icon from '#components/domain/Icon';
import ListLayout from '#components/ListLayout';

import styles from './styles.module.css';

interface Props {
    className?: string;
    value: PartialCustomOptionInputFields[] | undefined;
    variant?: 'action' | 'info';
}

function CustomOptionPreview(props: Props) {
    const {
        value,
        className,
        variant = 'action',
    } = props;

    // TODO(frozenhelium): implement sub-option
    return (
        <div
            className={_cs(
                styles.customOptionsPreview,
                variant === 'action' && styles.actionVariant,
                variant === 'info' && styles.infoVariant,
                className,
            )}
        >
            {value?.map((option) => (
                <div
                    key={option.clientId}
                    className={styles.option}
                >
                    <div
                        className={styles.icon}
                        style={{
                            backgroundColor: option.iconColor,
                        }}
                    >
                        <Icon value={option.icon} />
                    </div>
                    <ListLayout
                        layout="block"
                        spacing="none"
                    >
                        <div className={styles.label}>
                            {option.title}
                        </div>
                        {variant === 'info' && (
                            <div className={styles.description}>
                                {option.description}
                            </div>
                        )}
                    </ListLayout>
                </div>
            ))}
        </div>
    );
}

export default CustomOptionPreview;
