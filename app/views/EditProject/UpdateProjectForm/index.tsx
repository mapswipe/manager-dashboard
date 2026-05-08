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
    nonFieldError,
    removeNull,
    useForm,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Alert from '#components/Alert/index.tsx';
import BlockLayout from '#components/BlockLayout/index.tsx';
import Button from '#components/Button';
import Container from '#components/Container/index.tsx';
import ProjectStatusTimeline from '#components/domain/ProjectStatusTimeline';
import ProjectTypeOutput from '#components/domain/ProjectTypeOutput/index.tsx';
import Message from '#components/Message/index.tsx';
import NonFieldError from '#components/NonFieldError';
import PageLayout from '#components/PageLayout';
import {
    ProjectDetailsQuery,
    ProjectStatusEnum,
    ProjectTypeEnum,
    ProjectUpdateInput,
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
import LocateFeaturesProjectSpecifics from './LocateFeaturesProjectSpecifics/index.tsx';
import {
    defaultLocateFeaturesSpecificFormValue,
    PartialLocateFeaturesSpecificFields,
} from './LocateFeaturesProjectSpecifics/schema.ts';
import StreetProjectSpecifics from './StreetProjectSpecifics/index.tsx';
import {
    defaultStreetSpecificFormValue,
    PartialStreetSpecificFields,
} from './StreetProjectSpecifics/schema.ts';
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

    useEffect(() => {
        if (projectData.project.status !== ProjectStatusEnum.ReadyToProcess) {
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
            return {
                ...defaultValidateSpecificFormValue,
                customOptions: projectData.defaultValidateCustomOptions.map((customOption) => ({
                    clientId: ulid(),
                    ...customOption,
                })),
            };
        }
        if (projectData.project.projectType === ProjectTypeEnum.ValidateImage) {
            return {
                ...defaultValidateImageSpecificFormValue,
                customOptions: projectData.defaultValidateImageCustomOptions.map(
                    (customOption) => ({
                        clientId: ulid(),
                        ...customOption,
                    }),
                ),
            };
        }
        if (projectData.project.projectType === ProjectTypeEnum.Street) {
            return {
                ...defaultStreetSpecificFormValue,
                customOptions: projectData.defaultStreetCustomOptions.map((customOption) => ({
                    clientId: ulid(),
                    ...customOption,
                })),
            };
        }
        if (projectData.project.projectType === ProjectTypeEnum.Locate) {
            return {
                ...defaultLocateFeaturesSpecificFormValue,
                customOptions: projectData.defaultLocateFeaturesCustomOptions.map(
                    (customOption) => ({
                        clientId: ulid(),
                        ...customOption,
                    }),
                ),
            };
        }

        projectData.project.projectType satisfies never;

        return {};
    }, [projectData]);

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
        pristine,
        setPristine,
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            status,

            projectType,
            requestingOrganization,
            projectTypeSpecifics,
            image,
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
            // status,
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

                const transformedErrors = transformErrors(errors);

                if ('status' in transformedErrors) {
                    transformedErrors[nonFieldError] = String(transformedErrors.status);
                }

                if ('projectTypeSpecifics' in transformedErrors) {
                    const projectTypeKey = projectTypeToKeyMap[projectData.project.projectType];

                    setError({
                        ...transformErrors,
                        projectTypeSpecifics: {
                            [projectTypeKey]: transformedErrors.projectTypeSpecifics,
                        },
                    });
                } else {
                    setError(transformedErrors);
                }

                return;
            }

            alert.show(
                'Project updated successfully!',
                { variant: 'success' },
            );
            setPristine(false);
        } catch (apolloError) {
            alertCombinedError(apolloError, alert);
        }
    }, [
        projectData.project.id,
        projectData.project.projectType,
        updateProject,
        setError,
        alert,
        setPristine,
    ]);

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

    const setStreetProjectSpecificsFieldValue = useFormObject<'street', PartialStreetSpecificFields>(
        'street',
        setProjectSpecificFieldValue,
        defaultStreetSpecificFormValue,
    );

    const setLocateFeaturesProjectSpecificsFieldValue = useFormObject<'locate', PartialLocateFeaturesSpecificFields>(
        'locate',
        setProjectSpecificFieldValue,
        defaultLocateFeaturesSpecificFormValue,
    );

    const pending = updateProjectPending;
    const baseInputsEditable = isDefined(projectData) && (
        projectData.project.status === ProjectStatusEnum.Draft
        || projectData.project.status === ProjectStatusEnum.ProcessingFailed
        || projectData.project.status === ProjectStatusEnum.Processed
    );
    const projectTypeSpecificInputsEditable = isDefined(projectData) && (
        projectData.project.status === ProjectStatusEnum.Draft
        || projectData.project.status === ProjectStatusEnum.ProcessingFailed
    );

    const readOnly = isDefined(projectData.project.oldId);

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
    const streetProjectTypeSpecifics = value.projectTypeSpecifics
        ?.street as PartialStreetSpecificFields | undefined;
    const locateFeaturesProjectTypeSpecifics = value.projectTypeSpecifics
        ?.locate as PartialLocateFeaturesSpecificFields | undefined;

    return (
        <PageLayout
            heading="Update project"
            className={className}
            headerActions={(isDefined(projectData) && isNotDefined(projectData.project.oldId) && (
                <ProjectActions
                    projectId={projectData.project.id}
                    clientId={projectData.project.clientId}
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
                />
            )}
            footerActions={(
                <Button
                    name={undefined}
                    colorVariant="accent"
                    styleVariant="filled"
                    onClick={handleUpdateDraftButtonClick}
                    disabled={baseInputsDisabled || readOnly}
                    start={<PiFloppyDisk />}
                >
                    Save project
                </Button>
            )}
            aside={(
                <>
                    {projectData.project.status === ProjectStatusEnum.ReadyToProcess && (
                        <BlockLayout withEndSeparator>
                            <Message
                                pending
                                pendingMessage="Processing Project"
                                description={projectData.project.processingStatus}
                            />
                        </BlockLayout>
                    )}
                    <ProjectStatusTimeline
                        value={projectData?.project.status}
                    />
                </>
            )}
            confirmNavigationChange={!pristine}
        >
            {projectData?.project.status === ProjectStatusEnum.ProcessingFailed && (
                <Alert
                    name="processing-error"
                    title="Processing failed!"
                    description={(
                        <>
                            <p>
                                There was an error while processing the project.
                                Please make the necessary changes before proceeding!
                            </p>
                            {!!projectData.project.statusMessage && (
                                <p>{projectData.project.statusMessage}</p>
                            )}
                        </>
                    )}
                    fullWidth
                    type="danger"
                    withoutShadow
                />
            )}
            <NonFieldError error={error} />
            <ProjectGeneralInputs
                projectType={projectData.project.projectType}
                value={value}
                setFieldValue={setFieldValue}
                error={error}
                disabled={baseInputsDisabled || readOnly}
            />
            <ProjectAdditionalInputs
                projectId={projectData.project.id}
                value={value}
                setFieldValue={setFieldValue}
                error={error}
                disabled={baseInputsDisabled || readOnly}
            />
            <Container
                spacing="lg"
                heading={<ProjectTypeOutput value={projectData.project.projectType} />}
                headerDescription={(
                    <NonFieldError
                        error={error?.projectTypeSpecifics}
                    />
                )}
                withContentBackgroundAndPadding
            >
                {projectContext.projectType === ProjectTypeEnum.Find && (
                    <FindProjectSpecifics
                        projectId={projectData.project.id}
                        value={findProjectTypeSpecifics}
                        setFieldValue={setFindProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.find}
                        disabled={projectTypeSpecificInputsDisabled || readOnly}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Compare && (
                    <CompareProjectSpecifics
                        projectId={projectData.project.id}
                        value={compareProjectTypeSpecifics}
                        setFieldValue={setCompareProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.compare}
                        disabled={projectTypeSpecificInputsDisabled || readOnly}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Validate && (
                    <ValidateProjectSpecifics
                        projectId={projectData.project.id}
                        value={validateProjectTypeSpecifics}
                        setFieldValue={setValidateProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.validate}
                        disabled={projectTypeSpecificInputsDisabled || readOnly}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Completeness && (
                    <CompletenessProjectSpecifics
                        projectId={projectData.project.id}
                        value={completenessProjectTypeSpecifics}
                        setFieldValue={setCompletenessProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.completeness}
                        disabled={projectTypeSpecificInputsDisabled || readOnly}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.ValidateImage && (
                    <ValidateImageProjectSpecifics
                        projectId={projectData.project.id}
                        value={validateImageProjectTypeSpecifics}
                        setFieldValue={setValidateImageProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.validateImage}
                        disabled={projectTypeSpecificInputsDisabled || readOnly}
                        // eslint-disable-next-line no-underscore-dangle
                        sourceTypeSaved={projectData.project.projectTypeSpecifics
                            ?.__typename === 'ValidateImageProjectPropertyType'
                                && !!projectData.project.projectTypeSpecifics}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Street && (
                    <StreetProjectSpecifics
                        projectId={projectData.project.id}
                        value={streetProjectTypeSpecifics}
                        setFieldValue={setStreetProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.street}
                        disabled={projectTypeSpecificInputsDisabled || readOnly}
                    />
                )}
                {projectContext.projectType === ProjectTypeEnum.Locate && (
                    <LocateFeaturesProjectSpecifics
                        projectId={projectData.project.id}
                        value={locateFeaturesProjectTypeSpecifics}
                        setFieldValue={setLocateFeaturesProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.locate}
                        disabled={projectTypeSpecificInputsDisabled || readOnly}
                    />
                )}
            </Container>
        </PageLayout>
    );
}

export default UpdateProjectForm;
