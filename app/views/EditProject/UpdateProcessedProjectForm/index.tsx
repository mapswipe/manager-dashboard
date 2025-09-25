import {
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { PiFloppyDisk } from 'react-icons/pi';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    removeNull,
    useForm,
} from '@togglecorp/toggle-form';
import { gql } from 'urql';

import Alert from '#components/Alert';
import BlockLayout from '#components/BlockLayout';
import Button from '#components/Button';
import Container from '#components/Container';
import AssetInput from '#components/domain/AssetInput';
import ProjectSpecificDetails from '#components/domain/ProjectSpecificDetails';
import ProjectStatusTimeline from '#components/domain/ProjectStatusTimeline';
import ProjectTaskDetails from '#components/domain/ProjectTaskDetails';
import ListLayout from '#components/ListLayout';
import Message from '#components/Message';
import NonFieldError from '#components/NonFieldError';
import PageLayout from '#components/PageLayout';
import TutorialSelectInput from '#components/selections/TutorialSelectInput';
import {
    ProcessedProjectUpdateInput,
    ProjectAssetInputTypeEnum,
    ProjectDetailsQuery,
    ProjectStatusEnum,
    useProjectStatusQuery,
    useUpdateProcessedProjectMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useOptions from '#hooks/useOptions';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';
import {
    OPERATION_INFO_FRAGMENT,
    PROJECT_DETAILS_FRAGMENT,
} from '#utils/query';
import ProjectGeneralInputs from '#views/NewProject/ProjectGeneralInputs';

import ProjectActions from '../ProjectActions';
import processedProjectUpdateFormSchema, { type PartialProcessedProjectUpdateInput } from './schema';

const DEFAULT_POLL_DURATION = 3000;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UPDATE_PROCESSED_PROJECT_MUTATION = gql`
mutation UpdateProcessedProject($id: ID!, $data: ProcessedProjectUpdateInput!) {
    ${PROJECT_DETAILS_FRAGMENT}
    ${OPERATION_INFO_FRAGMENT}
    updateProcessedProject(data: $data, pk: $id) {
        ... on ProjectTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                ...ProjectDetailFields
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

const defaultProcessedProjectFormValue: PartialProcessedProjectUpdateInput = {
};

interface Props {
    className?: string;
    projectData: ProjectDetailsQuery;
}

function UpdateProcessedProjectForm(props: Props) {
    const {
        className,
        projectData,
    } = props;

    const alert = useAlert();
    const [, setOrganizationOptions] = useOptions('organization');
    const [, setTutorialOptions] = useOptions('tutorial');
    const [, setTeamOptions] = useOptions('project');

    const [, execProjectStatusQuery] = useProjectStatusQuery({
        variables: {
            projectId: projectData.project.id,
        },
        pause: true,
    });

    useEffect(() => {
        if (projectData.project.status !== ProjectStatusEnum.ReadyToPublish) {
            return undefined;
        }

        const intervalId = setInterval(() => {
            execProjectStatusQuery({ requestPolicy: 'cache-and-network' });
        }, DEFAULT_POLL_DURATION);

        return () => {
            clearInterval(intervalId);
        };
    }, [
        projectData.project.status,
        execProjectStatusQuery,
    ]);

    const [
        { fetching: updateProcessedProjectPending },
        updateProcessedProject,
    ] = useUpdateProcessedProjectMutation();

    const projectContext = useMemo(() => ({
        projectType: projectData?.project.projectType,
    }), [projectData]);

    const {
        value,
        error: formError,
        setFieldValue,
        validate,
        setError,
        setValue,
        pristine,
        setPristine,
    } = useForm(
        processedProjectUpdateFormSchema,
        { value: defaultProcessedProjectFormValue },
        projectContext,
    );

    useEffect(() => {
        if (isNotDefined(projectData)) {
            return;
        }

        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            id,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            projectType,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            status,
            image,
            team,
            requestingOrganization,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            projectTypeSpecifics,
            tutorial,
            ...other
        } = removeNull(projectData.project);

        if (isDefined(tutorial)) {
            setTutorialOptions([tutorial]);
        }
        if (isDefined(team)) {
            setTeamOptions([team]);
        }

        setOrganizationOptions([requestingOrganization]);

        setValue({
            ...other,
            image: image?.id,
            tutorial: tutorial?.id,
            team: team?.id,
            requestingOrganization: requestingOrganization.id,
        });
    }, [
        projectData,
        setTutorialOptions,
        setOrganizationOptions,
        setValue,
        setTeamOptions,
    ]);

    const error = getErrorObject(formError);

    const submitUpdateProcessedForm = useCallback(async (
        finalValues: ProcessedProjectUpdateInput,
    ) => {
        try {
            const result = await updateProcessedProject({
                id: projectData.project.id,
                data: finalValues,
            });

            if (checkAndAlertGraphQLResultError(result, alert)) {
                return;
            }

            if (isNotDefined(result.data)
                // eslint-disable-next-line no-underscore-dangle
                || result.data.updateProcessedProject.__typename !== 'ProjectTypeMutationResponseType'
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
                errors,
                // result,
            } = result.data.updateProcessedProject;

            if (!ok) {
                alert.show(
                    'Failed to update the Project!',
                    {
                        description: 'Please fix the errors and try again!',
                        variant: 'danger',
                    },
                );
                const formErrors = transformErrors(errors);
                setError(formErrors);
                return;
            }

            alert.show(
                'Project updated successfully!',
                { variant: 'success' },
            );
            setPristine(true);
        } catch (combinedError) {
            alertCombinedError(combinedError, alert);
        }
    }, [projectData.project.id, updateProcessedProject, setError, alert, setPristine]);

    const handleUpdateBasicDetails = useCallback((
        submittedValue: PartialProcessedProjectUpdateInput,
    ) => {
        const finalValues = { ...submittedValue } as ProcessedProjectUpdateInput;
        submitUpdateProcessedForm(finalValues);
    }, [submitUpdateProcessedForm]);

    const handleUpdateBasicDetailsButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleUpdateBasicDetails),
        [validate, setError, handleUpdateBasicDetails],
    );

    const pending = updateProcessedProjectPending;
    const baseInputsEditable = isDefined(projectData) && (
        projectData.project.status === ProjectStatusEnum.ProcessingFailed
        || projectData.project.status === ProjectStatusEnum.Processed
    );

    const readOnly = isDefined(projectData.project.oldId);
    const baseInputsDisabled = pending || !baseInputsEditable;

    return (
        <PageLayout
            heading="Update project"
            confirmNavigationChange={!pristine}
            className={className}
            headerActions={(isDefined(projectData) && isNotDefined(projectData.project.oldId) && (
                <ProjectActions
                    clientId={projectData.project.clientId}
                    projectId={projectData.project.id}
                    status={projectData.project.status}
                />
            ))}
            headerDescription={isDefined(projectData.project.oldId) && (
                <Alert
                    name="old-system-alert"
                    title="Read-only mode enabled for old project"
                    description="This project was migrated over from old system and cannot be edited here"
                    fullWidth
                    withoutShadow
                    type="warning"
                />
            )}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleUpdateBasicDetailsButtonClick}
                    colorVariant="accent"
                    styleVariant="filled"
                    disabled={baseInputsDisabled || readOnly}
                    start={<PiFloppyDisk />}
                >
                    Update project
                </Button>
            )}
            aside={(
                <>
                    {projectData.project.status === ProjectStatusEnum.ReadyToPublish && (
                        <BlockLayout withEndSeparator>
                            <Message
                                pending
                                pendingMessage="Publishing Project"
                            />
                        </BlockLayout>
                    )}
                    <ProjectStatusTimeline
                        value={projectData?.project.status}
                    />
                </>
            )}
        >
            {projectData?.project.status === ProjectStatusEnum.PublishingFailed && (
                <Alert
                    name="processing-error"
                    title="Processing failed!"
                    description="There was an error while publising the project!"
                    fullWidth
                    type="danger"
                    withoutShadow
                />
            )}
            <NonFieldError error={error} />
            <ProjectGeneralInputs
                name={projectData.project.name}
                projectType={projectData.project.projectType}
                value={value}
                setFieldValue={setFieldValue}
                error={error}
                disabled={baseInputsDisabled || readOnly}
            />
            <Container
                heading="Additional"
                withContentBackgroundAndPadding
                spacing="lg"
            >
                <ListLayout layout="grid">
                    <AssetInput
                        projectId={projectData.project.id}
                        label="Project cover image"
                        name="image"
                        inputType={ProjectAssetInputTypeEnum.CoverImage}
                        value={value.image}
                        onChange={setFieldValue}
                        error={error?.image}
                        disabled={baseInputsDisabled || readOnly}
                        hint="Make sure you have the rights to use the image. It should end with .jpg or .png."
                    />
                </ListLayout>
                <ProjectTaskDetails
                    value={projectData.project}
                />
            </Container>
            <ProjectSpecificDetails
                projectId={projectData.project.id}
                headingLevel={3}
                withContentBackgroundAndPadding
            />
            <Container
                heading="Tutorial"
                withContentBackgroundAndPadding
            >
                <TutorialSelectInput
                    label="Select a tutorial for this project"
                    name="tutorial"
                    value={value.tutorial}
                    onChange={setFieldValue}
                    error={error?.tutorial}
                    disabled={baseInputsDisabled || readOnly}
                    projectType={projectData.project.projectType}
                    hint="Please note that you'll only be able to select the tutorial of same project type"
                />
            </Container>
        </PageLayout>
    );
}

export default UpdateProcessedProjectForm;
