import { useCallback } from 'react';
import { IoCopyOutline } from 'react-icons/io5';
import {
    PiCheckCircle,
    PiCross,
    PiInfo,
    PiQuestion,
    PiWarningCircle,
} from 'react-icons/pi';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import { AlertType } from '#base/context/AlertContext';
import BlockLayout from '#components/BlockLayout';
import Button from '#components/Button';
import Heading from '#components/Heading';
import InlineLayout from '#components/InlineLayout';

import styles from './styles.module.css';

const alertTypeToClassNameMap: {
    [key in AlertType]: string;
} = {
    success: styles.success,
    warning: styles.warning,
    danger: styles.danger,
    info: styles.info,
};

const icon: {
    [key in AlertType]: React.ReactNode;
} = {
    success: <PiCheckCircle className={styles.icon} />,
    danger: <PiWarningCircle className={styles.icon} />,
    info: <PiInfo className={styles.icon} />,
    warning: <PiQuestion className={styles.icon} />,
};
export interface Props<N> {
    name: N;
    className?: string;
    type?: AlertType;
    title?: React.ReactNode;
    description?: React.ReactNode;
    nonDismissable?: boolean;
    onCloseButtonClick?: (name: N) => void;
    debugMessage?: string;
    withoutShadow?: boolean;
    fullWidth?: boolean;
}

function Alert<N extends string>(props: Props<N>) {
    const {
        name,
        className,
        type = 'info',
        title,
        description,
        onCloseButtonClick,
        nonDismissable,
        debugMessage,
        withoutShadow,
        fullWidth,
    } = props;

    const handleCloseButtonClick = useCallback(
        () => {
            if (onCloseButtonClick) {
                onCloseButtonClick(name);
            }
        },
        [onCloseButtonClick, name],
    );

    const handleCopyDebugMessageButtonClick = useCallback(
        () => {
            if (debugMessage) {
                navigator.clipboard.writeText(debugMessage);
            }
        },
        [debugMessage],
    );

    return (
        <BlockLayout
            className={_cs(
                styles.alert,
                alertTypeToClassNameMap[type],
                fullWidth && styles.fullWidth,
                withoutShadow && styles.withoutShadow,
                className,
            )}
            start={(
                <InlineLayout
                    start={icon[type]}
                    withCenterAlign
                    end={nonDismissable && (
                        <Button
                            name={undefined}
                            onClick={handleCloseButtonClick}
                            styleVariant="action"
                            title="Close"
                        >
                            <PiCross />
                        </Button>
                    )}
                >
                    <Heading
                        className={styles.title}
                        level={5}
                    >
                        {title}
                    </Heading>
                </InlineLayout>
            )}
            end={isTruthyString(debugMessage) && (
                <InlineLayout
                    end={(
                        <div className={styles.actions}>
                            <Button
                                name={undefined}
                                onClick={handleCopyDebugMessageButtonClick}
                                styleVariant="transparent"
                                withoutPadding
                                start={<IoCopyOutline />}
                            >
                                Copy Error
                            </Button>
                        </div>
                    )}
                />
            )}
            withPadding
        >
            {description}
        </BlockLayout>
    );
}

export default Alert;
