import {
    _cs,
    compareNumber,
    isDefined,
    isFalsyString,
} from '@togglecorp/fujs';

import { type PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema';
import Icon from '#components/domain/Icon';
import ListLayout from '#components/ListLayout';

import styles from './styles.module.css';

interface Props {
    className?: string;
    value: PartialCustomOptionInputFields[] | undefined;
    variant?: 'action' | 'info' | 'tile';
}

function CustomOptionPreview(props: Props) {
    const {
        value,
        className,
        variant = 'action',
    } = props;

    // For the tile variant (Locate Objects), options are displayed ordered by
    // their value; other variants preserve the order they are given.
    const orderedValue = variant === 'tile' && isDefined(value)
        ? [...value].sort((a, b) => compareNumber(a.value, b.value))
        : value;

    // TODO(frozenhelium): implement sub-option
    return (
        <div
            className={_cs(
                styles.customOptionsPreview,
                variant === 'action' && styles.actionVariant,
                variant === 'info' && styles.infoVariant,
                variant === 'tile' && styles.tileVariant,
                className,
            )}
        >
            {orderedValue?.map((option) => {
                const isTransparent = isFalsyString(option.iconColor)
                    || option.iconColor === 'transparent';

                return (
                    <div
                        key={option.clientId}
                        className={styles.option}
                    >
                        {variant === 'tile' ? (
                            <div
                                className={_cs(
                                    styles.tile,
                                    isTransparent && styles.transparent,
                                )}
                                style={isTransparent
                                    ? undefined
                                    : { backgroundColor: option.iconColor }}
                            />
                        ) : (
                            <div
                                className={styles.icon}
                                style={{
                                    backgroundColor: option.iconColor,
                                }}
                            >
                                <Icon value={option.icon} />
                            </div>
                        )}
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
                );
            })}
        </div>
    );
}

export default CustomOptionPreview;
