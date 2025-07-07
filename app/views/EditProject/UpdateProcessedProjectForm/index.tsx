import {
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    MdArrowForward,
    MdSave,
} from 'react-icons/md';
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
import InputError from '#components/InputError';
import ListLayout from '#components/ListLayout';
import PageLayout from '#components/PageLayout';
import ProjectSpecificDetails from '#components/ProjectSpecificDetails';
import ProjectStatusOutput from '#components/ProjectStatusOutput';
import TutorialSelectInput from '#components/selections/TutorialSelectInput';
import {
    ProcessedProjectUpdateInput,
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
    PROJECT_TYPE_SPECIFIC_FRAGMENT,
} from '#utils/query';
import ProjectGeneralInputs from '#views/NewProject/ProjectGeneralInputs';

import AssetInput from '../AssetInput';
import processedProjectUpdateFormSchema, { type PartialProcessedProjectUpdateInput } from './schema';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UPDATE_PROCESSED_PROJECT_MUTATION = gql`
mutation UpdateProcessedProject($id: ID!, $data: ProcessedProjectUpdateInput!) {
    ${PROJECT_TYPE_SPECIFIC_FRAGMENT}
    ${OPERATION_INFO_FRAGMENT}
    updateProcessedProject(data: $data, pk: $id) {
        ... on ProjectTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                additionalInfoUrl
                clientId
                description
                groupSize
                id
                isFeatured
                lookFor
                maxTasksPerUser
                name
                processingStatus
                progress
                projectType
                image {
                    id
                    file {
                        url
                    }
                }
                projectTypeSpecifics {
                    ...ProjectTypeSpecificFields
                }
                requestingOrganization {
                    id
                    name
                }
                tutorial {
                    id
                    name
                }
                team {
                    id
                    name
                }
                status
                verificationNumber
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
            image,
            team,
            status,
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
            status,
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
        } catch (apolloError) {
            alertCombinedError(apolloError, alert);
        }
    }, [projectData.project.id, updateProcessedProject, setError, alert]);

    const handlePublish = useCallback((submittedValue: PartialProcessedProjectUpdateInput) => {
        const finalValues = { ...submittedValue } as ProcessedProjectUpdateInput;
        finalValues.status = ProjectStatusEnum.Published;
        submitUpdateProcessedForm(finalValues);
    }, [submitUpdateProcessedForm]);

    const handlePublishButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handlePublish),
        [validate, setError, handlePublish],
    );

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
            className={className}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={handleUpdateBasicDetailsButtonClick}
                        disabled={baseInputsDisabled}
                        start={<MdSave />}
                    >
                        Save Project
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handlePublishButtonClick}
                        disabled={baseInputsDisabled}
                        colorVariant="accent"
                        styleVariant="filled"
                        end={<MdArrowForward />}
                    >
                        Save & Publish Project
                    </Button>
                </>
            )}
            aside={(
                <ProjectStatusOutput
                    value={projectData?.project.status}
                />
            )}
        >
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
                withHeaderBorder
                spacing="lg"
            >
                <ListLayout layout="grid">
                    <AssetInput
                        projectId={projectData.project.id}
                        label="Project cover image"
                        name="image"
                        inputType="image"
                        value={value.image}
                        onChange={setFieldValue}
                        error={error?.image}
                        disabled={baseInputsDisabled}
                    />
                </ListLayout>
            </Container>
            <ProjectSpecificDetails
                projectId={projectData.project.id}
            />
            <Container
                heading="Tutorial"
            >
                <TutorialSelectInput
                    label="Select a tutorial for this project"
                    name="tutorial"
                    value={value.tutorial}
                    onChange={setFieldValue}
                    error={error?.tutorial}
                    disabled={baseInputsDisabled}
                />
            </Container>
        </PageLayout>
    );
}

export default UpdateProcessedProjectForm;
