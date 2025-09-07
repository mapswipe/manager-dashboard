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

import Button from '#components/Button';
import Container from '#components/Container';
import AssetInput from '#components/domain/AssetInput';
import ProjectSpecificDetails from '#components/domain/ProjectSpecificDetails';
import ProjectStatusTimeline from '#components/domain/ProjectStatusTimeline';
import InputError from '#components/InputError';
import ListLayout from '#components/ListLayout';
import NonFieldError from '#components/NonFieldError';
import PageLayout from '#components/PageLayout';
import TutorialSelectInput from '#components/selections/TutorialSelectInput';
import {
    ProcessedProjectUpdateInput,
    ProjectAssetInputTypeEnum,
    ProjectDetailsQuery,
    ProjectStatusEnum,
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
        } catch (apolloError) {
            alertCombinedError(apolloError, alert);
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
        projectData.project.status === ProjectStatusEnum.Draft
        || projectData.project.status === ProjectStatusEnum.Failed
        || projectData.project.status === ProjectStatusEnum.Ready
    );

    const baseInputsDisabled = pending || !baseInputsEditable;

    return (
        <PageLayout
            heading="Update project"
            confirmNavigationChange={!pristine}
            className={className}
            headerActions={isDefined(projectData) && (
                <ProjectActions
                    clientId={projectData.project.clientId}
                    projectId={projectData.project.id}
                    status={projectData.project.status}
                />
            )}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleUpdateBasicDetailsButtonClick}
                    colorVariant="accent"
                    styleVariant="filled"
                    disabled={baseInputsDisabled}
                    start={<PiFloppyDisk />}
                >
                    Update project
                </Button>
            )}
            aside={(
                <ProjectStatusTimeline
                    value={projectData?.project.status}
                />
            )}
        >
            <NonFieldError error={error} />
            {projectData?.project.status === ProjectStatusEnum.Failed && (
                <InputError>
                    There was an error while processing the project.
                    Please make the necessary changes before proceeding!
                </InputError>
            )}
            <ProjectGeneralInputs
                value={value}
                setFieldValue={setFieldValue}
                error={error}
                disabled={baseInputsDisabled}
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
                        disabled={baseInputsDisabled}
                    />
                </ListLayout>
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
                    disabled={baseInputsDisabled}
                    projectType={projectData.project.projectType}
                />
            </Container>
        </PageLayout>
    );
}

export default UpdateProcessedProjectForm;
