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
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import routes from '#base/configs/routes';
import Button from '#components/Button';
import PageLayout from '#components/PageLayout';
import ProjectStatusOutput from '#components/ProjectStatusOutput';
import ProjectTypeIcon from '#components/ProjectTypeIcon';
import SegmentInput from '#components/SegmentInput';
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
import { keySelector } from '#utils/common';

import styles from './styles.module.css';

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

const defaultBaseProjectFormValue: PartialProjectCreateInputFields = {
    projectType: ProjectTypeEnum.Find,
    requestingOrganization: '1',
    lookFor: 'Bugs',
    name: 'Test project',
    description: 'This is just a test project',
    additionalInfoUrl: 'https://togglecorp.com',
};

function projectTypeLabelSelector(value: AppEnumCollectionProjectTypeEnum) {
    return (
        <div className={styles.projectTypeLabel}>
            <ProjectTypeIcon type={value.key} />
            <span>
                {value.label}
            </span>
        </div>
    );
}

const projectTypeDescriptions: Record<ProjectTypeEnum, string> = {
    [ProjectTypeEnum.Find]: 'Swipe through satellite images to identify & select those that contain the requested features such as buildings, roadways, waterways and more.',
    [ProjectTypeEnum.Compare]: 'Review before and after satellite images to detect changes in the environment that help inform damage assessment, climate change, or inaccurate data.',
    // FIXME this is description for validate
    [ProjectTypeEnum.Completeness]: 'Assess building footprints for accuracy where buildings have been previously traced by remote mappers or through AI to identify where remapping is needed.',
};

interface Props {
    className?: string;
}

function NewProject(props: Props) {
    const { className } = props;
    const navigate = useNavigate();

    const [
        createNewProject,
        { loading: createNewProjectPending },
    ] = useMutation<NewProjectMutation, NewProjectMutationVariables>(CREATE_PROJECT_MUTATION);

    const {
        data: newProjectEnumsResponse,
    } = useQuery<NewProjectEnumsQuery, NewProjectEnumsQueryVariables>(ENUM_QUERY);

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

    const handleFormSubmission = useCallback(async (
        submittedFormValues: PartialProjectCreateInputFields,
    ) => {
        const finalValues = submittedFormValues as ProjectCreateInput;
        const result = await createNewProject({
            variables: {
                data: finalValues,
            },
        });

        if (
            // eslint-disable-next-line no-underscore-dangle
            result.data?.createProject.__typename === 'ProjectTypeMutationResponseType'
            && result.data.createProject.ok
            && result.data.createProject.result
        ) {
            navigate(
                generatePath(
                    routes.editProject.originalPath,
                    { id: result.data.createProject.result.id },
                ),
            );
        }
    }, [createNewProject, navigate]);

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    return (
        <PageLayout
            className={_cs(styles.newProject, className)}
            heading="Create a New Project"
            headerDescription="Let's get started with adding basic information for the project. You can later add more project type specific details"
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleSubmitButtonClick}
                    disabled={createNewProjectPending}
                    variant="primary"
                    actions={<MdArrowForward />}
                >
                    Save and Continue
                </Button>
            )}
            aside={(
                <ProjectStatusOutput
                    value={undefined}
                />
            )}
            mainContentClassName={styles.mainContent}
        >
            <div className={styles.projectTypeSelection}>
                <SegmentInput
                    name="projectType"
                    onChange={setFieldValue}
                    value={value.projectType}
                    label="Project Type"
                    hint="Select the type of your project. Please note that you won't be able to change it later"
                    options={newProjectEnumsResponse?.enums.ProjectTypeEnum ?? []}
                    keySelector={keySelector}
                    labelSelector={projectTypeLabelSelector}
                    error={error?.projectType}
                />
                {isDefined(value.projectType) && (
                    <div className={styles.projectTypeDescription}>
                        {projectTypeDescriptions[value.projectType]}
                    </div>
                )}
            </div>
            <div className={styles.form}>
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
                <TextInput
                    label="Requesting organization"
                    name="requestingOrganization"
                    value={value.requestingOrganization}
                    onChange={setFieldValue}
                    error={error?.requestingOrganization}
                    disabled
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
            </div>
        </PageLayout>
    );
}

export default NewProject;
