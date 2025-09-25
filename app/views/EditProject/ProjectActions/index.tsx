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
import Container from '#components/Container';
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
    transformErrors,
} from '#utils/error';

interface Props {
    clientId: string;
    projectId: string;
    status: ProjectStatusEnum;
    buttonStyleVariant?: ButtonStyleVariant;
    withFullWidth?: boolean;
}

function ProjectActions(props: Props) {
    const {
        clientId,
        projectId,
        status,
        buttonStyleVariant = 'translucent',
        withFullWidth,
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
                errors,
                // result,
            } = result.data.updateProjectStatus;

            if (!ok) {
                const formErrors = transformErrors(errors);
                const errorMessage = isDefined(formErrors)
                    ? Object.values(formErrors).join(', ')
                    : 'Unknown error occured';

                alert.show(
                    'Failed to update the Project status!',
                    {
                        description: errorMessage,
                        variant: 'danger',
                    },
                );

                setNewStatus(undefined);
                return;
            }

            setNewStatus(undefined);
            alert.show(
                'Project status updated successfully!',
                { variant: 'success' },
            );
        } catch (combinedError) {
            alertCombinedError(combinedError, alert);
        }

        setNewStatus(undefined);
    }, [alert, clientId, newStatus, projectId, updateProjectStatus]);

    const actionsDisabled = updateProjectStatusPending;

    return (
        <>
            {(status === ProjectStatusEnum.Draft
                || status === ProjectStatusEnum.ProcessingFailed
            ) && (
                <Button
                    name={ProjectStatusEnum.ReadyToProcess}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.ReadyToProcess} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    styleVariant={buttonStyleVariant}
                    colorVariant="accent"
                    withFullWidth={withFullWidth}
                >
                    Process
                </Button>
            )}
            {status === ProjectStatusEnum.Processed && (
                <Button
                    name={ProjectStatusEnum.ReadyToPublish}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.Published} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    styleVariant={buttonStyleVariant}
                    withFullWidth={withFullWidth}
                    colorVariant="accent"
                >
                    Publish
                </Button>
            )}
            {status === ProjectStatusEnum.Published && (
                <Button
                    name={ProjectStatusEnum.Withdrawn}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.Withdrawn} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    colorVariant="danger"
                    styleVariant={buttonStyleVariant}
                    withFullWidth={withFullWidth}
                >
                    Archive
                </Button>
            )}
            {status === ProjectStatusEnum.Published && (
                <Button
                    name={ProjectStatusEnum.Finished}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.Finished} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    styleVariant={buttonStyleVariant}
                    withFullWidth={withFullWidth}
                    colorVariant="danger"
                >
                    Finish
                </Button>
            )}
            {(status === ProjectStatusEnum.ReadyToProcess
                || status === ProjectStatusEnum.Processed
                || status === ProjectStatusEnum.Draft
                || status === ProjectStatusEnum.ProcessingFailed
            ) && (
                <Button
                    name={ProjectStatusEnum.Discarded}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.Discarded} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    colorVariant="danger"
                    styleVariant={buttonStyleVariant}
                    withFullWidth={withFullWidth}
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
                    withFullWidth={withFullWidth}
                >
                    Resume
                </Button>
            )}
            {status === ProjectStatusEnum.Published && (
                <Button
                    name={ProjectStatusEnum.Paused}
                    start={<ProjectStatusIcon value={ProjectStatusEnum.Paused} />}
                    onClick={setNewStatus}
                    disabled={actionsDisabled}
                    styleVariant={buttonStyleVariant}
                    withFullWidth={withFullWidth}
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
                    <Container withWelledContent>
                        <ListLayout layout="inline">
                            <ProjectStatusOutput value={status} />
                            <PiArrowRight />
                            <ProjectStatusOutput value={newStatus} />
                        </ListLayout>
                    </Container>
                    <p>
                        Please make sure you have saved all the changes before continuing
                    </p>
                    {(newStatus === ProjectStatusEnum.Withdrawn
                        || newStatus === ProjectStatusEnum.Discarded
                        || newStatus === ProjectStatusEnum.Finished
                    ) && (
                        <p>
                            NOTE: This action is irreversable!
                        </p>
                    )}
                </Modal>
            )}
        </>
    );
}

export default ProjectActions;
