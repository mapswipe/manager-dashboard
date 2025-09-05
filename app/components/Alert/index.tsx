import { useCallback } from 'react';
import { IoCopyOutline } from 'react-icons/io5';
import { PiCross } from 'react-icons/pi';
import {
    RiCheckboxCircleLine,
    RiErrorWarningLine,
    RiInformationLine,
    RiQuestionLine,
} from 'react-icons/ri';
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

export interface Props<N> {
    name: N;
    className?: string;
    type?: AlertType;
    title?: React.ReactNode;
    description?: React.ReactNode;
    nonDismissable?: boolean;
    onCloseButtonClick?: (name: N) => void;
    debugMessage?: string;
}

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
    success: <RiCheckboxCircleLine className={styles.icon} />,
    danger: <RiErrorWarningLine className={styles.icon} />,
    info: <RiInformationLine className={styles.icon} />,
    warning: <RiQuestionLine className={styles.icon} />,
};

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
                className,
            )}
            start={(
                <InlineLayout
                    start={icon[type]}
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
                                colorVariant="text-on-dark"
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
