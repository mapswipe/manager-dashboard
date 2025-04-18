import React from 'react';

import useAuthSync from '#base/hooks/useAuthSync';
import Button from '#components/Button';
import Modal from '#components/Modal';

import styles from './styles.module.css';

function AuthPopup() {
    const {
        modalShown,
        modalMessage,
        onCancel,
        onConfirm,
    } = useAuthSync();

    if (!modalShown) {
        return null;
    }

    return (
        <Modal
            className={styles.authPopup}
            heading="Invalid Session"
            onCloseButtonClick={onCancel}
            footerClassName={styles.actionButtonsRow}
            footer={(
                <>
                    <Button
                        name={undefined}
                        onClick={onCancel}
                        className={styles.actionButton}
                    >
                        Ignore
                    </Button>
                    <Button
                        name={undefined}
                        onClick={onConfirm}
                        className={styles.actionButton}
                        variant="primary"
                        autoFocus
                    >
                        Reload
                    </Button>
                </>
            )}
        >
            {modalMessage}
        </Modal>
    );
}
export default AuthPopup;
