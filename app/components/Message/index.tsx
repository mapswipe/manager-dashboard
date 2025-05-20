import { useMemo } from 'react';
import { ImSpinner } from 'react-icons/im';
import { MdSwipeLeft } from 'react-icons/md';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    pending?: boolean;
    overlayPending?: boolean;
    filtered?: boolean;
    empty?: boolean;
    errored?: boolean;

    icon?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;

    emptyMessage?: React.ReactNode;
    filteredEmptyMessage?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;

    withoutIcon?: boolean;
}

function Message(props: Props) {
    const {
        className,
        pending,
        overlayPending,
        filtered,
        empty,
        errored,

        icon = <MdSwipeLeft />,
        description,
        actions,
        emptyMessage,
        filteredEmptyMessage,
        pendingMessage,
        errorMessage,
        withoutIcon,
    } = props;

    const messageTitle = useMemo(
        () => {
            if (pending) {
                return pendingMessage ?? 'Fetching data...';
            }

            if (errored) {
                return errorMessage ?? 'Failed to fetch data!';
            }

            if (filtered) {
                return filteredEmptyMessage ?? 'Data is not available for selected filters!';
            }

            if (empty) {
                return emptyMessage ?? 'Data is not available';
            }

            return null;
        },
        [
            empty,
            pending,
            filtered,
            errored,
            emptyMessage,
            filteredEmptyMessage,
            pendingMessage,
            errorMessage,
        ],
    );

    if (!empty && !pending && !errored) {
        return null;
    }

    return (
        <div
            className={_cs(
                styles.message,
                overlayPending && pending && styles.overlaid,
                className,
            )}
        >
            {(pending || (icon && !withoutIcon)) && (
                <div className={styles.icon}>
                    {pending && <ImSpinner className={styles.spinner} />}
                    {!pending && !withoutIcon && icon}
                </div>
            )}
            {isDefined(messageTitle) && (
                <div className={styles.title}>
                    {messageTitle}
                </div>
            )}
            {isDefined(description) && (
                <div className={styles.description}>
                    {description}
                </div>
            )}
            {isDefined(actions) && (
                <div className={styles.actions}>
                    {actions}
                </div>
            )}
        </div>
    );
}

export default Message;
