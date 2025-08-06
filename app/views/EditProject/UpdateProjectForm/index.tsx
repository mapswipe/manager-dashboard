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
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';
import { gql } from 'urql';

import Button from '#components/Button';
import Container from '#components/Container/index.tsx';
import ProjectStatusOutput from '#components/domain/ProjectStatusOutput';
import InputError from '#components/InputError/index.tsx';
import NonFieldError from '#components/NonFieldError';
import PageLayout from '#components/PageLayout';
import {
    ProjectDetailsQuery,
    ProjectStatusEnum,
    ProjectTypeEnum,
    ProjectUpdateInput,
    useDefaultCustomOptionsQuery,
    useProjectStatusQuery,
    useUpdateProjectMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert.ts';
import useOptions from '#hooks/useOptions';
import { projectTypeToKeyMap } from '#utils/common.ts';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';
import ProjectGeneralInputs from '#views/NewProject/ProjectGeneralInputs/index.tsx';

import ProjectActions from '../ProjectActions/index.tsx';
import ProjectAdditionalInputs from '../ProjectAdditionalInputs/index.tsx';
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
import ValidateImageProjectSpecifics from './ValidateImageProjectSpecifics/index.tsx';
import {
    defaultValidateImageSpecificFormValue,
    PartialValidateImageSpecificFields,
} from './ValidateImageProjectSpecifics/schema.ts';
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

const DEFAULT_POLL_DURATION = 3000;

interface Props {
    className?: string;
    projectData: ProjectDetailsQuery;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_CUSTOM_OPTIONS = gql`
query DefaultCustomOptions($projectType: ProjectTypeEnum!) {
    defaultCustomOptions(projectType: $projectType) {
        value
        title
        iconColor
        icon
        description
    }
}
`;

function UpdateProjectForm(props: Props) {
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

    const [{ data: customOptionResponse }] = useDefaultCustomOptionsQuery({
        variables: {
            projectType: projectData.project.projectType,
        },
    });

    useEffect(() => {
        if (projectData.project.status !== ProjectStatusEnum.MarkedAsReady) {
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
        { fetching: updateProjectPending },
        updateProject,
    ] = useUpdateProjectMutation();

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
            const baseValue = projectData.project.projectType === ProjectTypeEnum.Validate
                ? defaultValidateSpecificFormValue
                : defaultValidateImageSpecificFormValue;

            const customOptionsFromQuery = customOptionResponse?.defaultCustomOptions?.map(
                (opt) => ({
                    clientId: ulid(),
                    icon: opt.icon,
                    iconColor: opt.iconColor,
                    title: opt.title,
                    description: opt.description,
                    value: opt.value,
                }),
            ) ?? [];

            return {
                ...baseValue,
                customOptions: customOptionsFromQuery,
            };
        }
        if (projectData.project.projectType === ProjectTypeEnum.ValidateImage) {
            const baseValue = projectData.project.projectType === ProjectTypeEnum.ValidateImage
                ? defaultValidateSpecificFormValue
                : defaultValidateImageSpecificFormValue;

            const customOptionsFromQuery = customOptionResponse?.defaultCustomOptions?.map(
                (opt) => ({
                    clientId: ulid(),
                    icon: opt.icon,
                    iconColor: opt.iconColor,
                    title: opt.title,
                    description: opt.description,
                    value: opt.value,
                }),
            ) ?? [];

            return {
                ...baseValue,
                customOptions: customOptionsFromQuery,
            };
        }

        return {};
    }, [projectData.project.projectType, customOptionResponse?.defaultCustomOptions]);

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
            status,
            team,
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
            requestingOrganization: requestingOrganization.id,
            image: image?.id,
            team: team?.id,
            tutorial: tutorial?.id,
            status,
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
        setTeamOptions,
        setOrganizationOptions,
        defaultProjectTypeSpecificsValue,
    ]);

    const error = getErrorObject(formError);

    const submitUpdateForm = useCallback(async (
        finalValues: ProjectUpdateInput,
    ) => {
        try {
            const result = await updateProject({
                id: projectData.project.id,
                data: finalValues,
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
            alertCombinedError(apolloError, alert);
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

    const setValidateImageProjectSpecificsFieldValue = useFormObject<'validateImage', PartialValidateImageSpecificFields>(
        'validateImage',
        setProjectSpecificFieldValue,
        defaultValidateSpecificFormValue,
    );

    const setCompletenessProjectSpecificsFieldValue = useFormObject<'completeness', PartialCompletenessSpecificFields>(
        'completeness',
        setProjectSpecificFieldValue,
        defaultCompletenessSpecificFormValue,
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

    const findProjectTypeSpecifics = value.projectTypeSpecifics
        ?.find as PartialFindSpecificFields | undefined;
    const compareProjectTypeSpecifics = value.projectTypeSpecifics
        ?.compare as PartialCompareSpecificFields | undefined;
    const validateProjectTypeSpecifics = value.projectTypeSpecifics
        ?.validate as PartialValidateSpecificFields | undefined;
    const completenessProjectTypeSpecifics = value.projectTypeSpecifics
        ?.completeness as PartialCompletenessSpecificFields | undefined;
    const validateImageProjectTypeSpecifics = value.projectTypeSpecifics
        ?.validateImage as PartialValidateSpecificFields | undefined;

    return (
        <PageLayout
            heading="Update project"
            className={className}
            headerActions={(isDefined(projectData) && (
                <ProjectActions
                    projectId={projectData.project.id}
                    clientId={projectData.project.clientId}
                    status={projectData.project.status}
                />
            ))}
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
            <ProjectGeneralInputs
                value={value}
                setFieldValue={setFieldValue}
                error={error}
                disabled={baseInputsDisabled}
            />
            <ProjectAdditionalInputs
                projectId={projectData.project.id}
                value={value}
                setFieldValue={setFieldValue}
                error={error}
                disabled={baseInputsDisabled}
            />
            <Container
                withHeaderBorder
                spacing="lg"
                heading={`${projectContext.projectType.replace('_', ' ')} specific details`}
                headerDescription={(
                    <NonFieldError
                        error={error?.projectTypeSpecifics}
                    />
                )}
            >
                {projectContext.projectType === ProjectTypeEnum.Find && (
                    <FindProjectSpecifics
                        projectId={projectData.project.id}
                        value={findProjectTypeSpecifics}
                        setFieldValue={setFindProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.find}
                        disabled={projectTypeSpecificInputsDisabled}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Compare && (
                    <CompareProjectSpecifics
                        projectId={projectData.project.id}
                        value={compareProjectTypeSpecifics}
                        setFieldValue={setCompareProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.compare}
                        disabled={projectTypeSpecificInputsDisabled}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Validate && (
                    <ValidateProjectSpecifics
                        projectId={projectData.project.id}
                        value={validateProjectTypeSpecifics}
                        setFieldValue={setValidateProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.validate}
                        disabled={projectTypeSpecificInputsDisabled}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Completeness && (
                    <CompletenessProjectSpecifics
                        projectId={projectData.project.id}
                        value={completenessProjectTypeSpecifics}
                        setFieldValue={setCompletenessProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.completeness}
                        disabled={projectTypeSpecificInputsDisabled}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.ValidateImage && (
                    <ValidateImageProjectSpecifics
                        projectId={projectData.project.id}
                        value={validateImageProjectTypeSpecifics}
                        setFieldValue={setValidateImageProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.validateImage}
                        disabled={projectTypeSpecificInputsDisabled}
                    />
                )}
            </Container>
        </PageLayout>
    );
}

export default UpdateProjectForm;
