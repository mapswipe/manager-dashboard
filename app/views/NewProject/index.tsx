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
import EnumsContext from '#base/context/EnumsContext';
import Button from '#components/Button';
import Container from '#components/Container';
import ProjectStatusTimeline from '#components/domain/ProjectStatusTimeline';
import ProjectTypeIcon from '#components/domain/ProjectTypeIcon';
import InlineLayout from '#components/InlineLayout';
import PageLayout from '#components/PageLayout';
import SegmentInput from '#components/SegmentInput';
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
        requestingOrganization: {
        },
        projectInstruction: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        lookFor: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        projectNumber: {
            required: true,
            // FIXME: add positive integer validation
        },
        topic: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        region: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        team: {},
        description: {},
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

const projectTypeDescriptions: Record<ProjectTypeEnum, string> = {
    [ProjectTypeEnum.Find]: 'Swipe through satellite images to identify & select those that contain the requested features such as buildings, roadways, waterways and more.',
    [ProjectTypeEnum.Compare]: 'Review before and after satellite images to detect changes in the environment that help inform damage assessment, climate change, or inaccurate data.',
    [ProjectTypeEnum.Validate]: 'Assess building footprints for accuracy where buildings have been previously traced by remote mappers or through AI to identify where remapping is needed.',
    [ProjectTypeEnum.ValidateImage]: 'Assess how well machine learning detections match real-world features in images, flagging false or inaccurate results. This helps improve model accuracy and dataset quality, supporting better outcomes for social good applications.',
    [ProjectTypeEnum.Completeness]: 'Assess how well OSM data represents buildings in satellite imagery, flagging areas where mapping is incomplete. This helps identify areas needing further mapping efforts to enhance OSM\'s accuracy, especially for disaster response and risk assessment.',
};

interface Props {
    className?: string;
}

function NewProject(props: Props) {
    const { className } = props;
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
                    alert.show(
                        'Failed to create the Project!',
                        {
                            description: 'Please fix the errors and try again!',
                            variant: 'danger',
                        },
                    );

                    setError(transformErrors(errors));
                    return;
                }

                alert.show(
                    'Project created successfully!',
                    {
                        description: 'Navigating to edit page of the created project.',
                        variant: 'success',
                    },
                );
                navigate(
                    generatePath(
                        routes.editProject.originalPath,
                        { id: createProjectResult.id },
                    ),
                );
            } catch (apolloError) {
                alertCombinedError(apolloError, alert);
            }
        },
        [createNewProject, navigate, setError, alert],
    );

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const inputsDisabled = createNewProjectPending;
    const actionsDisabled = inputsDisabled;

    return (
        <PageLayout
            className={className}
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
        >
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
                />
                {isDefined(value.projectType) && (
                    <div>
                        {projectTypeDescriptions[value.projectType]}
                    </div>
                )}
            </Container>
            <ProjectGeneralInputs
                value={value}
                error={error}
                setFieldValue={setFieldValue}
                disabled={inputsDisabled}
            />
        </PageLayout>
    );
}

export default NewProject;
