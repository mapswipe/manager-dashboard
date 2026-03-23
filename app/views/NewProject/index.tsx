import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import { MdArrowForward } from 'react-icons/md';
import {
    generatePath,
    useNavigate,
} from 'react-router';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';
import { gql } from 'urql';

import routes from '#base/configs/routes';
import Alert from '#components/Alert';
import Button from '#components/Button';
import Container from '#components/Container';
import Description from '#components/Description';
import ProjectStatusTimeline from '#components/domain/ProjectStatusTimeline';
import ProjectTypeIcon from '#components/domain/ProjectTypeIcon';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import NonFieldError from '#components/NonFieldError';
import PageLayout from '#components/PageLayout';
import SegmentInput from '#components/SegmentInput';
import EnumsContext from '#contexts/EnumsContext';
import {
    AppEnumCollectionProjectTypeEnum,
    ProjectCreateInput,
    ProjectTypeEnum,
    useNewProjectMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import { keySelector } from '#utils/common';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';
import { OPERATION_INFO_FRAGMENT } from '#utils/query';
import { DeepNonNullable } from '#utils/types';

import ProjectGeneralInputs from './ProjectGeneralInputs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CREATE_PROJECT_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation NewProject($data: ProjectCreateInput!) {
    createProject(data: $data) {
        ... on ProjectTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                id
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

type PartialProjectCreateInputFields = PartialForm<DeepNonNullable<ProjectCreateInput>>;
type ProjectCreateFormSchema = ObjectSchema<PartialProjectCreateInputFields>;

const projectCreateFormSchema: ProjectCreateFormSchema = {
    fields: (): ReturnType<ProjectCreateFormSchema['fields']> => ({
        clientId: {},
        projectType: {
            required: true,
        },
        topic: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        projectNumber: {
            required: true,
            // FIXME: add positive integer validation
        },
        requestingOrganization: {
            required: true,
        },
        region: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        projectInstruction: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        lookFor: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {},
        team: {},
        additionalInfoUrl: {},
    }),
};

function projectTypeLabelSelector(value: AppEnumCollectionProjectTypeEnum) {
    return (
        <InlineLayout
            spacing="sm"
            start={<ProjectTypeIcon type={value.key} />}
        >
            {value.label}
        </InlineLayout>
    );
}

const projectTypeDescriptions: Record<ProjectTypeEnum, React.ReactNode> = {
    [ProjectTypeEnum.Find]: 'Swipe through satellite images to identify & select those that contain the requested features such as buildings, roadways, waterways and more.',
    [ProjectTypeEnum.Compare]: 'Review before and after satellite images to detect changes in the environment that help inform damage assessment, climate change, or inaccurate data.',
    [ProjectTypeEnum.Validate]: 'Assess building footprints for accuracy where buildings have been previously traced by remote mappers or through AI to identify where remapping is needed.',
    [ProjectTypeEnum.ValidateImage]: 'Assess how well machine learning detections match real-world features in images, flagging false or inaccurate results. This helps improve model accuracy and dataset quality, supporting better outcomes for social good applications.',
    [ProjectTypeEnum.Completeness]: (
        <ListLayout layout="block">
            <div>
                Assess how well OSM data represents buildings in satellite imagery,
                flagging areas where mapping is incomplete.
                This helps identify areas needing further mapping efforts to enhance
                OSM&apos;s accuracy, especially for disaster response and risk assessment.
            </div>
            <Alert
                name="street-alert"
                title="Vector overlay layer"
                type="warning"
                description="Please be aware that the vector overlay layer is only available in the MapSwipe web app."
                fullWidth
                withoutShadow
            />
        </ListLayout>
    ),
    [ProjectTypeEnum.Street]: (
        <ListLayout layout="block">
            <div>
                Explore ground-level images to find relevant features and
                capture more detailed information on communities.
            </div>
            <Alert
                name="street-alert"
                title="MapSwipe Web only"
                type="warning"
                description="Street projects are currently only available in the MapSwipe web app."
                fullWidth
                withoutShadow
            />
        </ListLayout>
    ),
    [ProjectTypeEnum.Conflation]: (
        <ListLayout layout="block">
            <div>
                Validate AI generated features and compare with
                existing features on OpenStreetMap.
            </div>
            <Alert
                name="street-alert"
                title="MapSwipe Web only"
                type="warning"
                description="Conflate feature projects are currently only available in the MapSwipe web app."
                fullWidth
                withoutShadow
            />
        </ListLayout>
    ),
};

function NewProject() {
    const navigate = useNavigate();
    const alert = useAlert();

    const [
        { fetching: createNewProjectPending },
        createNewProject,
    ] = useNewProjectMutation();

    const { projectTypeOptions } = useContext(EnumsContext);

    const defaultBaseProjectFormValue = useMemo<PartialProjectCreateInputFields>(() => ({
        clientId: ulid(),
        projectNumber: 1,
    }), []);

    const {
        value,
        error: formError,
        setFieldValue,
        validate,
        setError,
        pristine,
        setPristine,
    } = useForm(projectCreateFormSchema, {
        value: defaultBaseProjectFormValue,
    });

    const error = getErrorObject(formError);

    const handleFormSubmission = useCallback(
        async (submittedFormValues: PartialProjectCreateInputFields) => {
            const finalValues = submittedFormValues as ProjectCreateInput;

            try {
                const result = await createNewProject({
                    data: finalValues,
                });

                if (checkAndAlertGraphQLResultError(result, alert)) {
                    return;
                }

                if (isNotDefined(result.data)
                    // eslint-disable-next-line no-underscore-dangle
                    || result.data.createProject.__typename !== 'ProjectTypeMutationResponseType'
                ) {
                    alert.show(
                        'Failed to create the Project!',
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
                    result: createProjectResult,
                } = result.data.createProject;

                if (!ok || !createProjectResult) {
                    setError(transformErrors(errors));

                    alert.show(
                        'Failed to create the Project!',
                        {
                            description: 'Something unexpected occured.',
                            variant: 'danger',
                            debugMessage: JSON.stringify(errors, null, 2),
                        },
                    );

                    return;
                }

                alert.show(
                    'Project created successfully!',
                    {
                        description: 'Navigating to edit page of the created project.',
                        variant: 'success',
                    },
                );

                setPristine(true);
                // NOTE: pristine needs to be set first before navigation
                window.setTimeout(() => {
                    if (isDefined(routes.editProject.path)) {
                        navigate(
                            generatePath(
                                routes.editProject.path,
                                { id: createProjectResult.id },
                            ),
                        );
                    }
                }, 200);
            } catch (apolloError) {
                alertCombinedError(apolloError, alert);
            }
        },
        [createNewProject, navigate, setError, alert, setPristine],
    );

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const inputsDisabled = createNewProjectPending;
    const actionsDisabled = inputsDisabled;

    return (
        <PageLayout
            heading="Create a New Project"
            headerDescription="Let's get started with adding basic information for the project. You can later add more project type specific details."
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleSubmitButtonClick}
                    disabled={actionsDisabled}
                    colorVariant="accent"
                    styleVariant="filled"
                    end={<MdArrowForward />}
                >
                    Save Draft
                </Button>
            )}
            aside={(
                <ProjectStatusTimeline
                    value={undefined}
                />
            )}
            confirmNavigationChange={!pristine}
        >
            <NonFieldError error={error} />
            <Container
                withContentBackgroundAndPadding
                withHeaderBorder
                spacing="lg"
                heading="Project Type"
            >
                <SegmentInput
                    name="projectType"
                    onChange={setFieldValue}
                    value={value.projectType}
                    hint="Please note that you won't be able to change it later."
                    options={projectTypeOptions ?? []}
                    keySelector={keySelector}
                    labelSelector={projectTypeLabelSelector}
                    error={error?.projectType}
                    disabled={inputsDisabled}
                    spacing="lg"
                />
                {isDefined(value.projectType) && (
                    <Description>
                        {projectTypeDescriptions[value.projectType]}
                    </Description>
                )}
            </Container>
            <ProjectGeneralInputs
                projectType={value.projectType}
                value={value}
                error={error}
                setFieldValue={setFieldValue}
                disabled={inputsDisabled}
            />
        </PageLayout>
    );
}

export default NewProject;
