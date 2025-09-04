import {
    useCallback,
    useContext,
    useEffect,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import AlertContext from '#base/context/AlertContext';
import Alert from '#components/Alert';
import ListLayout from '#components/ListLayout';
import Portal from '#components/Portal';
import { DEFAULT_ALERT_DISMISS_DURATION } from '#utils/common';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
}

function AlertContainer(props: Props) {
    const {
        className,
        children,
    } = props;

    const {
        alerts,
        removeAlert,
    } = useContext(AlertContext);

    const dismissTimeout = useRef<Record<string, number>>({});

    useEffect(
        () => {
            alerts.filter((alert) => !alert.nonDismissable).forEach((alert) => {
                // NOTE: skip if there is already a timeout
                if (dismissTimeout.current[alert.name]) {
                    return;
                }
                dismissTimeout.current[alert.name] = window.setTimeout(
                    () => {
                        removeAlert(alert.name);
                        delete dismissTimeout.current[alert.name];
                    },
                    alert.duration ?? DEFAULT_ALERT_DISMISS_DURATION,
                );
            });
        },
        [alerts, removeAlert],
    );

    const handleAlertCloseButtonClick = useCallback(
        (name: string) => {
            const timeout = dismissTimeout.current[name];
            window.clearTimeout(timeout);

            removeAlert(name);
            delete dismissTimeout.current[name];
        },
        [removeAlert],
    );

    return (
        <Portal>
            <ListLayout
                className={_cs(styles.alertContainer, className)}
                layout="block"
                spacing="sm"
            >
                {alerts.map((alert) => (
                    <Alert
                        key={alert.name}
                        name={alert.name}
                        className={styles.alert}
                        nonDismissable={alert.nonDismissable}
                        type={alert.variant}
                        onCloseButtonClick={handleAlertCloseButtonClick}
                        debugMessage={alert.debugMessage}
                        title={alert.title}
                        description={alert.description}
                    />
                ))}
                {children}
            </ListLayout>
        </Portal>
    );
}

export default AlertContainer;
