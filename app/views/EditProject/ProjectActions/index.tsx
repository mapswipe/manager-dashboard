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
import ProjectStatusIcon from '#components/domain/ProjectStatusIcon';
import ProjectStatusOutput from '#components/domain/ProjectStatusOutput';
import ListLayout from '#components/ListLayout';
import Modal from '#components/Modal';
import {
    ProjectStatusEnum,
    useUpdateProjectStatusMutation,
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
    buttonStyleVariant?: ButtonStyleVariant;
}

function ProjectActions(props: Props) {
    const {
        clientId,
        projectId,
        status,
        buttonStyleVariant = 'translucent',
    } = props;

    const alert = useAlert();

    const [
        { fetching: updateProjectStatusPending },
        updateProjectStatus,
    ] = useUpdateProjectStatusMutation();

    const [newStatus, setNewStatus] = useState<ProjectStatusEnum | undefined>();

    const handleCancel = useCallback(() => {
        setNewStatus(undefined);
    }, []);
    const handleConfirm = useCallback(async () => {
        try {
            const result = await updateProjectStatus({
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
                    || result.data.updateProjectStatus.__typename !== 'ProjectTypeMutationResponseType'
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

            // FIXME(frozenhelium): show proper errors
            const {
                ok,
                // errors,
                // result,
            } = result.data.updateProjectStatus;

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

        setNewStatus(undefined);
    }, [alert, clientId, newStatus, projectId, updateProjectStatus]);

    const actionsDisabled = updateProjectStatusPending;

    return (
        <>
            {(status === ProjectStatusEnum.Draft || status === ProjectStatusEnum.Failed) && (
                <Button
                    name={ProjectStatusEnum.MarkedAsReady}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.MarkedAsReady} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    styleVariant={buttonStyleVariant}
                    colorVariant="accent"
                >
                    Process
                </Button>
            )}
            {status === ProjectStatusEnum.Ready && (
                <Button
                    name={ProjectStatusEnum.Published}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.Published} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    styleVariant={buttonStyleVariant}
                    colorVariant="accent"
                >
                    Publish
                </Button>
            )}
            {status === ProjectStatusEnum.Published && (
                <Button
                    name={ProjectStatusEnum.Archived}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.Archived} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    colorVariant="danger"
                    styleVariant={buttonStyleVariant}
                >
                    Archive
                </Button>
            )}
            {(status === ProjectStatusEnum.Ready
                || status === ProjectStatusEnum.Paused
                || status === ProjectStatusEnum.Draft
                || status === ProjectStatusEnum.Failed
            ) && (
                <Button
                    name={ProjectStatusEnum.Discarded}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.Discarded} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    colorVariant="danger"
                    styleVariant={buttonStyleVariant}
                >
                    Discard
                </Button>
            )}
            {status === ProjectStatusEnum.Paused && (
                <Button
                    name={ProjectStatusEnum.Published}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.Published} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    styleVariant={buttonStyleVariant}
                >
                    Un-pause
                </Button>
            )}
            {status === ProjectStatusEnum.Published && (
                <Button
                    name={ProjectStatusEnum.Paused}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.Paused} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    styleVariant={buttonStyleVariant}
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
                    <p>
                        Are you sure you want to change the status of the project?
                    </p>
                    <ListLayout layout="inline">
                        <ProjectStatusOutput value={status} />
                        <PiArrowRight />
                        <ProjectStatusOutput value={newStatus} />
                    </ListLayout>
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
