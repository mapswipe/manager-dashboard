import {
    useCallback,
    useState,
} from 'react';
import { PiArrowRight } from 'react-icons/pi';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Button from '#components/Button';
import { ButtonStyleVariant } from '#components/ButtonLayout';
import TutorialStatusIcon from '#components/domain/TutorialStatusIcon';
import TutorialStatusOutput from '#components/domain/TutorialStatusOutput';
import ListLayout from '#components/ListLayout';
import Modal from '#components/Modal';
import {
    TutorialStatusEnum,
    useUpdateTutorialStatusMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
} from '#utils/error';

interface Props {
    clientId: string;
    tutorialId: string;
    status: TutorialStatusEnum;
    buttonStyleVariant?: ButtonStyleVariant;
}

function TutorialActions(props: Props) {
    const {
        clientId,
        tutorialId,
        status,
        buttonStyleVariant = 'translucent',
    } = props;

    const alert = useAlert();

    const [
        { fetching: updateTutorialStatusPending },
        updateTutorialStatus,
    ] = useUpdateTutorialStatusMutation();

    const [newStatus, setNewStatus] = useState<TutorialStatusEnum | undefined>();

    const handleCancel = useCallback(() => {
        setNewStatus(undefined);
    }, []);
    const handleConfirm = useCallback(async () => {
        try {
            const result = await updateTutorialStatus({
                id: tutorialId,
                data: {
                    clientId,
                    status: newStatus,
                },
            });

            if (checkAndAlertGraphQLResultError(result, alert)) {
                return;
            }

            if (
                isNotDefined(result.data)
                // eslint-disable-next-line no-underscore-dangle
                || result.data.updateTutorialStatus.__typename !== 'TutorialTypeMutationResponseType'
            ) {
                alert.show(
                    'Failed to update the Tutorial status!',
                    {
                        description: 'Unexpectected response from the server!',
                        variant: 'danger',
                    },
                );

                return;
            }

            const {
                ok,
                // errors,
                // result,
            } = result.data.updateTutorialStatus;

            if (!ok) {
                alert.show(
                    'Failed to update the Tutorial status!',
                    {
                        // description: 'Please fix the errors and try again!',
                        variant: 'danger',
                    },
                );
                // setError(transformErrors(errors));

                return;
            }

            alert.show(
                'Tutorial status updated successfully!',
                { variant: 'success' },
            );
        } catch (apolloError) {
            alertCombinedError(apolloError, alert);
        }

        setNewStatus(undefined);
    }, [alert, clientId, newStatus, tutorialId, updateTutorialStatus]);

    const actionsDisabled = updateTutorialStatusPending;

    return (
        <>
            {(status === TutorialStatusEnum.Draft || status === TutorialStatusEnum.Archived) && (
                <Button
                    name={TutorialStatusEnum.ReadyToPublish}
                    start={<TutorialStatusIcon value={TutorialStatusEnum.Published} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    styleVariant={buttonStyleVariant}
                    colorVariant="accent"
                >
                    Publish
                </Button>
            )}
            {status === TutorialStatusEnum.Published && (
                <Button
                    name={TutorialStatusEnum.Archived}
                    start={<TutorialStatusIcon value={TutorialStatusEnum.Archived} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    colorVariant="danger"
                    styleVariant={buttonStyleVariant}
                >
                    Withdraw
                </Button>
            )}
            {status === TutorialStatusEnum.Draft && (
                <Button
                    name={TutorialStatusEnum.Discarded}
                    start={<TutorialStatusIcon value={TutorialStatusEnum.Discarded} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    colorVariant="danger"
                    styleVariant={buttonStyleVariant}
                >
                    Discard
                </Button>
            )}
            {isDefined(newStatus) && (
                <Modal
                    heading="Confirm status update!"
                    size="sm"
                    footerActions={(
                        <>
                            <Button
                                name="cancel"
                                onClick={handleCancel}
                                styleVariant="translucent"
                                disabled={actionsDisabled}
                            >
                                Cancel
                            </Button>
                            <Button
                                name="confirm"
                                onClick={handleConfirm}
                                styleVariant="filled"
                                colorVariant="accent"
                                disabled={actionsDisabled}
                            >
                                Confirm
                            </Button>
                        </>
                    )}
                    onClose={handleCancel}
                    withAutoHeight
                    headingLevel={4}
                >
                    Are you sure you want to change the status of the tutorial?
                    <ListLayout layout="inline">
                        <TutorialStatusOutput value={status} />
                        <PiArrowRight />
                        <TutorialStatusOutput value={newStatus} />
                    </ListLayout>
                    {(newStatus === TutorialStatusEnum.Archived
                        || newStatus === TutorialStatusEnum.Discarded
                    ) && (
                        <p>
                            Please note that this action is irreversable!
                        </p>
                    )}
                </Modal>
            )}
        </>
    );
}

export default TutorialActions;
