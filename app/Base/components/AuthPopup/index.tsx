import useAuthSync from '#base/hooks/useAuthSync';
import Button from '#components/Button';
import Modal from '#components/Modal';

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
            heading="Invalid Session"
            onClose={onCancel}
            size="sm"
            withAutoHeight
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={onCancel}
                    >
                        Ignore
                    </Button>
                    <Button
                        name={undefined}
                        onClick={onConfirm}
                        styleVariant="filled"
                        colorVariant="accent"
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
