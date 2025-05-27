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
    gql,
    useMutation,
    useQuery,
} from '@apollo/client';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    removeNull,
    useForm,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container/index.tsx';
import InputError from '#components/InputError/index.tsx';
import ListLayout from '#components/ListLayout/index.tsx';
import NonFieldError from '#components/NonFieldError';
import NumberInput from '#components/NumberInput';
import PageLayout from '#components/PageLayout';
import ProjectStatusOutput from '#components/ProjectStatusOutput';
import OrganizationSelectInput from '#components/selections/OrganizationSelectInput';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';
import {
    ProjectDetailsQuery,
    ProjectStatusEnum,
    ProjectTypeEnum,
    ProjectTypeSpecificInput,
    ProjectUpdateInput,
    UpdateProjectMutation,
    UpdateProjectMutationVariables,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert.ts';
import useOptions from '#hooks/useOptions';
import {
    alertApolloError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';

import AssetInput from '../AssetInput/index.tsx';
import {
    defaultCompareSpecificFormValue,
    PartialCompareSpecificFields,
} from './CompareProjectSpecifics/schema';
import {
    defaultCompletenessSpecificFormValue,
    PartialCompletenessSpecificFields,
} from './CompletenessProjectSpecifics/schema.ts';
import {
    defaultFindSpecificFormValue,
    PartialFindSpecificFields,
} from './FindProjectSpecifics/schema';
import ValidateProjectSpecifics from './ValidateProjectSpecifics/index.tsx';
import {
    defaultValidateSpecificFormValue,
    PartialValidateSpecificFields,
} from './ValidateProjectSpecifics/schema.ts';
import CompareProjectSpecifics from './CompareProjectSpecifics';
import CompletenessProjectSpecifics from './CompletenessProjectSpecifics';
import FindProjectSpecifics from './FindProjectSpecifics';
import projectUpdateFormSchema, {
    PartialProjectTypeSpecificInput,
    type PartialProjectUpdateInput,
} from './schema.ts';

const PROJECT_STATUS_QUERY = gql`
query ProjectStatus($projectId: ID!) {
    project(id: $projectId) {
        id
        status
    }
}
`;

// FIXME: Check why fragment does not work here
const UPDATE_PROJECT_MUTATION = gql`
mutation UpdateProject($id: ID!, $data: ProjectUpdateInput!) {
    updateProject(data: $data, pk: $id) {
        ... on ProjectTypeMutationResponseType {
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
                    ... on CompareProjectPropertyType {
                        aoiGeometry
                        zoomLevel
                        tileServerProperty {
                            bing {
                                credits
                            }
                            custom {
                                credits
                                url
                            }
                            esri {
                                credits
                            }
                            esriBeta {
                                credits
                            }
                            mapbox {
                                credits
                            }
                            maxarPremium {
                                credits
                            }
                            maxarStandard {
                                credits
                            }
                            name
                        }
                        tileServerBProperty {
                            bing {
                                credits
                            }
                            custom {
                                credits
                                url
                            }
                            esri {
                                credits
                            }
                            esriBeta {
                                credits
                            }
                            mapbox {
                                credits
                            }
                            maxarPremium {
                                credits
                            }
                            maxarStandard {
                                credits
                            }
                            name
                        }
                    }
                    ... on FindProjectPropertyType {
                        aoiGeometry
                        tileServerProperty {
                            bing {
                                credits
                            }
                            custom {
                                credits
                                url
                            }
                            esri {
                                credits
                            }
                            esriBeta {
                                credits
                            }
                            mapbox {
                                credits
                            }
                            maxarPremium {
                                credits
                            }
                            maxarStandard {
                                credits
                            }
                            name
                        }
                        zoomLevel
                    }
                    ... on CompletenessProjectPropertyType {
                        __typename
                        aoiGeometry
                        tileServerBProperty {
                            bing {
                                credits
                            }
                            custom {
                                credits
                                url
                            }
                            esri {
                                credits
                            }
                            esriBeta {
                                credits
                            }
                            mapbox {
                                credits
                            }
                            maxarPremium {
                                credits
                            }
                            maxarStandard {
                                credits
                            }
                            name
                        }
                        tileServerProperty {
                            bing {
                                credits
                            }
                            custom {
                                credits
                                url
                            }
                            esri {
                                credits
                            }
                            esriBeta {
                                credits
                            }
                            mapbox {
                                credits
                            }
                            maxarPremium {
                                credits
                            }
                            maxarStandard {
                                credits
                            }
                            name
                        }
                        zoomLevel
                    }
                    ... on ValidateProjectPropertyType {
                        __typename
                        objectSource {
                            aoiGeometry
                            objectGeojsonUrl
                            ohsomeFilter
                            sourceType
                            taskingManagerProjectId
                        }
                        tileServerProperty {
                            bing {
                                credits
                            }
                            custom {
                                credits
                                url
                            }
                            esri {
                                credits
                            }
                            esriBeta {
                                credits
                            }
                            mapbox {
                                credits
                            }
                            maxarPremium {
                                credits
                            }
                            maxarStandard {
                                credits
                            }
                            name
                        }
                    }
                }
                requestingOrganization {
                    id
                    name
                }
                tutorial {
                    id
                    name
                }
                status
                verificationNumber
            }
        }
    }
}
`;

const projectTypeToKeyMap: Record<ProjectTypeEnum, keyof(ProjectTypeSpecificInput)> = {
    [ProjectTypeEnum.Find]: 'find',
    [ProjectTypeEnum.Compare]: 'compare',
    [ProjectTypeEnum.Completeness]: 'completeness',
    [ProjectTypeEnum.Validate]: 'validate',
};

interface Props {
    className?: string;
    projectData: ProjectDetailsQuery;
}

function UpdateProjectForm(props: Props) {
    const {
        className,
        projectData,
    } = props;

    const alert = useAlert();
    const [, setOrganizationOptions] = useOptions('organization');
    const [, setTutorialOptions] = useOptions('tutorial');

    useQuery(
        PROJECT_STATUS_QUERY,
        {
            variables: {
                projectId: projectData.project.id,
            },
            skip: projectData.project.status !== ProjectStatusEnum.MarkedAsReady,
            pollInterval: 3000,
        },
    );

    const [
        updateProject,
        { loading: updateProjectPending },
    ] = useMutation<UpdateProjectMutation, UpdateProjectMutationVariables>(UPDATE_PROJECT_MUTATION);

    const defaultProjectTypeSpecificsValue = useMemo<PartialProjectTypeSpecificInput>(() => {
        if (projectData.project.projectType === ProjectTypeEnum.Find) {
            return defaultFindSpecificFormValue;
        }

        if (projectData.project.projectType === ProjectTypeEnum.Compare) {
            return defaultCompareSpecificFormValue;
        }

        if (projectData.project.projectType === ProjectTypeEnum.Completeness) {
            return defaultCompletenessSpecificFormValue;
        }

        if (projectData.project.projectType === ProjectTypeEnum.Validate) {
            return defaultValidateSpecificFormValue;
        }

        return {};
    }, [projectData.project.projectType]);

    const defaultBaseProjectFormValue = useMemo<PartialProjectUpdateInput>(() => ({
        clientId: ulid(),
    }), []);

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
    } = useForm(projectUpdateFormSchema, {
        value: defaultBaseProjectFormValue,
    }, projectContext);

    useEffect(() => {
        if (isNotDefined(projectData)) {
            return;
        }

        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            id,
            projectType,
            requestingOrganization,
            projectTypeSpecifics,
            image,
            tutorial,
            ...other
        } = removeNull(projectData.project);

        if (isDefined(tutorial)) {
            setTutorialOptions([tutorial]);
        }
        setOrganizationOptions([requestingOrganization]);

        setValue({
            ...other,
            requestingOrganization: requestingOrganization.id,
            image: image?.id,
            tutorial: tutorial?.id,
            projectTypeSpecifics: {
                // TODO: replace with the default value
                [projectTypeToKeyMap[projectType]]: projectTypeSpecifics
                    ?? defaultProjectTypeSpecificsValue,
            },
        });
    }, [
        projectData,
        setValue,
        setTutorialOptions,
        setOrganizationOptions,
        defaultProjectTypeSpecificsValue,
    ]);

    const error = getErrorObject(formError);

    const submitUpdateForm = useCallback(async (
        finalValues: ProjectUpdateInput,
    ) => {
        try {
            const result = await updateProject({
                variables: {
                    id: projectData.project.id,
                    data: finalValues,
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
                errors,
                // result,
            } = result.data.updateProject;

            if (!ok) {
                alert.show(
                    'Failed to update the Project!',
                    {
                        description: 'Please fix the errors and try again!',
                        variant: 'danger',
                    },
                );
                setError(transformErrors(errors));

                return;
            }

            alert.show(
                'Project updated successfully!',
                { variant: 'success' },
            );
        } catch (apolloError) {
            alertApolloError(apolloError, alert);
        }
    }, [projectData.project.id, updateProject, setError, alert]);

    const handleUpdateDraft = useCallback(async (
        submittedFormValues: PartialProjectUpdateInput,
    ) => {
        const finalValues = submittedFormValues as ProjectUpdateInput;
        submitUpdateForm(finalValues);
    }, [submitUpdateForm]);

    const handleUpdateDraftButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleUpdateDraft),
        [validate, setError, handleUpdateDraft],
    );

    const handleStartProcessing = useCallback((
        submittedFormValues: PartialProjectUpdateInput,
    ) => {
        const finalValues = { ...submittedFormValues } as ProjectUpdateInput;
        finalValues.status = ProjectStatusEnum.MarkedAsReady;

        submitUpdateForm(finalValues);
    }, [submitUpdateForm]);

    const handleStartProcessingButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleStartProcessing),
        [validate, setError, handleStartProcessing],
    );

    const setProjectSpecificFieldValue = useFormObject<'projectTypeSpecifics', PartialProjectTypeSpecificInput>(
        'projectTypeSpecifics',
        setFieldValue,
        defaultProjectTypeSpecificsValue,
    );

    const setFindProjectSpecificsFieldValue = useFormObject<'find', PartialFindSpecificFields>(
        'find',
        setProjectSpecificFieldValue,
        defaultFindSpecificFormValue,
    );

    const setCompareProjectSpecificsFieldValue = useFormObject<'compare', PartialCompareSpecificFields>(
        'compare',
        setProjectSpecificFieldValue,
        defaultCompareSpecificFormValue,
    );

    const setValidateProjectSpecificsFieldValue = useFormObject<'validate', PartialValidateSpecificFields>(
        'validate',
        setProjectSpecificFieldValue,
        defaultValidateSpecificFormValue,
    );

    const setCompletenessProjectSpecificsFieldValue = useFormObject<'completeness', PartialCompletenessSpecificFields>(
        'completeness',
        setProjectSpecificFieldValue,
        defaultCompareSpecificFormValue,
    );

    const pending = updateProjectPending;
    const baseInputsEditable = isDefined(projectData) && (
        projectData.project.status === ProjectStatusEnum.Draft
        || projectData.project.status === ProjectStatusEnum.Failed
        || projectData.project.status === ProjectStatusEnum.Ready
    );
    const projectTypeSpecificInputsEditable = isDefined(projectData) && (
        projectData.project.status === ProjectStatusEnum.Draft
        || projectData.project.status === ProjectStatusEnum.Failed
    );

    const baseInputsDisabled = pending || !baseInputsEditable;
    const projectTypeSpecificInputsDisabled = pending || !projectTypeSpecificInputsEditable;

    return (
        <PageLayout
            heading="Update project"
            className={className}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={handleUpdateDraftButtonClick}
                        disabled={baseInputsDisabled}
                        start={<MdSave />}
                    >
                        Save Project
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleStartProcessingButtonClick}
                        disabled={baseInputsDisabled}
                        colorVariant="accent"
                        styleVariant="filled"
                        end={<MdArrowForward />}
                    >
                        Save & Process Project
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
            <Container
                heading="General"
                withContentBackgroundAndPadding
                withHeaderBorder
                spacing="lg"
            >
                <TextInput
                    label="Project title"
                    name="name"
                    value={value.name}
                    onChange={setFieldValue}
                    error={error?.name}
                    disabled={baseInputsDisabled}
                />
                <TextArea
                    label="Project description"
                    name="description"
                    value={value.description}
                    onChange={setFieldValue}
                    error={error?.description}
                    disabled={baseInputsDisabled}
                    rows={4}
                />
                <ListLayout layout="grid">
                    <ListLayout
                        layout="block"
                    >
                        <TextInput
                            label="Look for"
                            name="lookFor"
                            value={value.lookFor}
                            onChange={setFieldValue}
                            error={error?.lookFor}
                            disabled={baseInputsDisabled}
                        />
                        <OrganizationSelectInput
                            label="Requesting organization"
                            name="requestingOrganization"
                            value={value.requestingOrganization}
                            onChange={setFieldValue}
                            error={error?.requestingOrganization}
                            disabled={baseInputsDisabled}
                        />
                        <TextInput
                            label="Additional info URL"
                            name="additionalInfoUrl"
                            value={value.additionalInfoUrl}
                            onChange={setFieldValue}
                            error={error?.additionalInfoUrl}
                            disabled={baseInputsDisabled}
                        />
                        <NumberInput
                            label="Verification number"
                            name="verificationNumber"
                            value={value.verificationNumber}
                            onChange={setFieldValue}
                            error={error?.verificationNumber}
                            disabled={baseInputsDisabled}
                        />
                        <NumberInput
                            label="Group size"
                            name="groupSize"
                            value={value.groupSize}
                            onChange={setFieldValue}
                            error={error?.groupSize}
                            disabled={baseInputsDisabled}
                        />
                        <NumberInput
                            label="Max tasks per user"
                            name="maxTasksPerUser"
                            value={value.maxTasksPerUser}
                            onChange={setFieldValue}
                            error={error?.maxTasksPerUser}
                            disabled={baseInputsDisabled}
                        />
                    </ListLayout>
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
            <Container
                withContentBackgroundAndPadding
                withHeaderBorder
                spacing="lg"
                heading={projectContext.projectType}
                headerDescription={(
                    <NonFieldError
                        error={error?.projectTypeSpecifics}
                    />
                )}
            >
                {projectContext.projectType === ProjectTypeEnum.Find && (
                    <FindProjectSpecifics
                        projectId={projectData.project.id}
                        value={value.projectTypeSpecifics?.find}
                        setFieldValue={setFindProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.find}
                        disabled={projectTypeSpecificInputsDisabled}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Compare && (
                    <CompareProjectSpecifics
                        projectId={projectData.project.id}
                        value={value.projectTypeSpecifics?.compare}
                        setFieldValue={setCompareProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.compare}
                        disabled={projectTypeSpecificInputsDisabled}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Validate && (
                    <ValidateProjectSpecifics
                        projectId={projectData.project.id}
                        value={value.projectTypeSpecifics?.validate}
                        setFieldValue={setValidateProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.validate}
                        disabled={projectTypeSpecificInputsDisabled}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Completeness && (
                    <CompletenessProjectSpecifics
                        projectId={projectData.project.id}
                        value={value.projectTypeSpecifics?.completeness}
                        setFieldValue={setCompletenessProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.completeness}
                        disabled={projectTypeSpecificInputsDisabled}
                    />
                )}
            </Container>
        </PageLayout>
    );
}

export default UpdateProjectForm;
