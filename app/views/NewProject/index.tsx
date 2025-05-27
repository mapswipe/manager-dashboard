import {
    useCallback,
    useMemo,
} from 'react';
import { MdArrowForward } from 'react-icons/md';
import {
    generatePath,
    useNavigate,
} from 'react-router';
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
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import routes from '#base/configs/routes';
import Button from '#components/Button';
import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import PageLayout from '#components/PageLayout';
import ProjectStatusOutput from '#components/ProjectStatusOutput';
import ProjectTypeIcon from '#components/ProjectTypeIcon';
import SegmentInput from '#components/SegmentInput';
import OrganizationSelectInput from '#components/selections/OrganizationSelectInput';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';
import {
    AppEnumCollectionProjectTypeEnum,
    NewProjectEnumsQuery,
    NewProjectEnumsQueryVariables,
    NewProjectMutation,
    NewProjectMutationVariables,
    ProjectCreateInput,
    ProjectTypeEnum,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import { keySelector } from '#utils/common';
import {
    alertApolloError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';

const ENUM_QUERY = gql`
query NewProjectEnums {
    enums {
        ProjectTypeEnum {
            key
            label
        }
    }
}
`;

const CREATE_PROJECT_MUTATION = gql`
mutation NewProject($data: ProjectCreateInput!) {
    createProject(data: $data) {
        ... on ProjectTypeMutationResponseType {
            errors
            ok
            result {
                id
            }
        }
    }
}
`;

type PartialProjectCreateInputFields = PartialForm<ProjectCreateInput>;
type ProjectCreateFormSchema = ObjectSchema<PartialProjectCreateInputFields>;

const projectCreateFormSchema: ProjectCreateFormSchema = {
    fields: (): ReturnType<ProjectCreateFormSchema['fields']> => ({
        clientId: {},
        projectType: {
            required: true,
        },
        requestingOrganization: {
        },
        lookFor: {
            required: true,
        },
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
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
        createNewProject,
        { loading: createNewProjectPending },
    ] = useMutation<NewProjectMutation, NewProjectMutationVariables>(CREATE_PROJECT_MUTATION);

    const {
        data: newProjectEnumsResponse,
    } = useQuery<NewProjectEnumsQuery, NewProjectEnumsQueryVariables>(ENUM_QUERY);

    const defaultBaseProjectFormValue = useMemo<PartialProjectCreateInputFields>(() => ({
        clientId: ulid(),
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
                    variables: {
                        data: finalValues,
                    },
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
                alertApolloError(apolloError, alert);
            }
        },
        [createNewProject, navigate, setError, alert],
    );

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    return (
        <PageLayout
            className={className}
            heading="Create a New Project"
            headerDescription="Let's get started with adding basic information for the project. You can later add more project type specific details."
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleSubmitButtonClick}
                    disabled={createNewProjectPending}
                    colorVariant="accent"
                    styleVariant="filled"
                    end={<MdArrowForward />}
                >
                    Save Draft
                </Button>
            )}
            aside={(
                <ProjectStatusOutput
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
                    options={newProjectEnumsResponse?.enums.ProjectTypeEnum ?? []}
                    keySelector={keySelector}
                    labelSelector={projectTypeLabelSelector}
                    error={error?.projectType}
                />
                {isDefined(value.projectType) && (
                    <div>
                        {projectTypeDescriptions[value.projectType]}
                    </div>
                )}
            </Container>
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
                />
                <TextArea
                    label="Project description"
                    name="description"
                    value={value.description}
                    onChange={setFieldValue}
                    error={error?.description}
                    rows={4}
                />
                <OrganizationSelectInput
                    label="Requesting organization"
                    name="requestingOrganization"
                    value={value.requestingOrganization}
                    onChange={setFieldValue}
                    error={error?.requestingOrganization}
                />
                <TextInput
                    label="Look for"
                    name="lookFor"
                    value={value.lookFor}
                    onChange={setFieldValue}
                    error={error?.lookFor}
                />
                <TextInput
                    label="Additional info URL"
                    name="additionalInfoUrl"
                    value={value.additionalInfoUrl}
                    onChange={setFieldValue}
                    error={error?.additionalInfoUrl}
                />
            </Container>
        </PageLayout>
    );
}

export default NewProject;
