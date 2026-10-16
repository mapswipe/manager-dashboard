import { useState } from 'react';
import { PiX } from 'react-icons/pi';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import { getBannerStorageKey } from '#utils/common';
import {
    getFromStorage,
    setToStorage,
} from '#utils/storage';

import styles from './styles.module.css';

interface Props {
    className?: string;
    storageKey: string;
    children: React.ReactNode;
    expiryDate?: Date;
}

function DismissibleBanner(props: Props) {
    const {
        className,
        storageKey,
        children,
        expiryDate,
    } = props;

    const [dismissed, setDismissed] = useState(
        () => !!getFromStorage<boolean>(getBannerStorageKey(storageKey)),
    );

    const expired = !!expiryDate && new Date() > expiryDate;

    const handleDismiss = () => {
        setDismissed(true);
        setToStorage(getBannerStorageKey(storageKey), true);
    };

    if (dismissed || expired) {
        return null;
    }

    return (
        <Container
            className={_cs(styles.dismissibleBanner, className)}
        >
            <InlineLayout
                withCenterAlign
                end={(
                    <Button
                        name={undefined}
                        onClick={handleDismiss}
                        styleVariant="action"
                        title="Dismiss"
                    >
                        <PiX />
                    </Button>
                )}
            >
                <div>
                    {children}
                </div>
            </InlineLayout>
        </Container>
    );
}

export default DismissibleBanner;
