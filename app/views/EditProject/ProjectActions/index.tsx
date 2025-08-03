import {
    useCallback,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Button from '#components/Button';
import Modal from '#components/Modal';
import {
    ProjectStatusEnum,
    useUpdateProcessedProjectMutation,
    useUpdateProjectMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
} from '#utils/error';

interface Props {
    clientId: string;
    projectId: string;
    status: ProjectStatusEnum;
}

function ProjectActions(props: Props) {
    const {
        clientId,
        projectId,
        status,
        // onChange,
    } = props;

    const alert = useAlert();

    const [
        { fetching: updateProjectPending },
        updateProject,
    ] = useUpdateProjectMutation();

    const [
        { fetching: updateProcessedProjectPending },
        updateProcessedProject,
    ] = useUpdateProcessedProjectMutation();

    const [newStatus, setNewStatus] = useState<ProjectStatusEnum | undefined>();

    const handleCancel = useCallback(() => {
        setNewStatus(undefined);
    }, []);
    const handleConfirm = useCallback(async () => {
        if (status === ProjectStatusEnum.Draft
            || status === ProjectStatusEnum.MarkedAsReady
            || status === ProjectStatusEnum.Failed) {
            try {
                const result = await updateProject({
                    id: projectId,
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
                    || result.data.updateProject.__typename !== 'ProjectTypeMutationResponseType'
                ) {
                    alert.show(
                        'Failed to update the Project!',
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
                } = result.data.updateProject;

                if (!ok) {
                    alert.show(
                        'Failed to update the Project status!',
                        {
                            // description: 'Please fix the errors and try again!',
                            variant: 'danger',
                        },
                    );
                    // setError(transformErrors(errors));

                    return;
                }

                alert.show(
                    'Project status updated successfully!',
                    { variant: 'success' },
                );
            } catch (apolloError) {
                alertCombinedError(apolloError, alert);
            }
        } else {
            try {
                const result = await updateProcessedProject({
                    id: projectId,
                    data: {
                        clientId,
                        status: newStatus,
                    },
                });

                if (checkAndAlertGraphQLResultError(result, alert)) {
                    return;
                }

                if (isNotDefined(result.data)
                    // eslint-disable-next-line no-underscore-dangle
                    || result.data.updateProcessedProject.__typename !== 'ProjectTypeMutationResponseType'
                ) {
                    alert.show(
                        'Failed to update the Project status!',
                        {
                            description: 'Unexpectected response from the server!',
                            variant: 'danger',
                        },
                    );

                    return;
                }

                const { ok } = result.data.updateProcessedProject;

                if (!ok) {
                    alert.show(
                        'Failed to update the Project status!',
                        {
                            // description: 'Please fix the errors and try again!',
                            variant: 'danger',
                        },
                    );
                    return;
                }

                alert.show(
                    'Project updated successfully!',
                    { variant: 'success' },
                );
            } catch (apolloError) {
                alertCombinedError(apolloError, alert);
            }
        }

        setNewStatus(undefined);
    }, [alert, clientId, newStatus, projectId, status, updateProcessedProject, updateProject]);

    const actionsDisabled = updateProjectPending || updateProcessedProjectPending;

    return (
        <>
            {status === ProjectStatusEnum.Published && (
                <Button
                    name={ProjectStatusEnum.Archived}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                >
                    Archive
                </Button>
            )}
            {(status === ProjectStatusEnum.Ready
                || status === ProjectStatusEnum.Paused
                || status === ProjectStatusEnum.Draft
            ) && (
                <Button
                    name={ProjectStatusEnum.Discarded}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                >
                    Discard
                </Button>
            )}
            {status === ProjectStatusEnum.Published && (
                <Button
                    name={ProjectStatusEnum.Paused}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                >
                    Pause
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
                                styleVariant="transparent"
                                withoutPadding
                                disabled={actionsDisabled}
                            >
                                Cancel
                            </Button>
                            <Button
                                name="confirm"
                                onClick={handleConfirm}
                                styleVariant="transparent"
                                colorVariant="accent"
                                withoutPadding
                                disabled={actionsDisabled}
                            >
                                Confirm
                            </Button>
                        </>
                    )}
                    onClose={handleCancel}
                >
                    {`Are you sure you want to change the status to ${newStatus} ?`}
                    {(newStatus === ProjectStatusEnum.Archived
                        || newStatus === ProjectStatusEnum.Discarded
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

export default ProjectActions;
