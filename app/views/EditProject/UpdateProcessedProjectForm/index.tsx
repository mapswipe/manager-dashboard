import {
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    MdArrowForward,
    MdSave,
} from 'react-icons/md';
import { useParams } from 'react-router';
import {
    gql,
    useMutation,
} from '@apollo/client';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    removeNull,
    useForm,
} from '@togglecorp/toggle-form';

import Button from '#components/Button';
import PageLayout from '#components/PageLayout';
import ProjectStatusOutput from '#components/ProjectStatusOutput';
import TextInput from '#components/TextInput';
import {
    ProcessedProjectUpdateInput,
    ProjectDetailsQuery,
    ProjectStatusEnum,
    UpdateProcessedProjectMutation,
    UpdateProcessedProjectMutationVariables,
} from '#generated/types/graphql';
import { transformErrors } from '#utils/error';

import processedProjectUpdateFormSchema, { type PartialProcessedProjectUpdateInput } from './schema';

import styles from './styles.module.css';

const UPDATE_PROCESSED_PROJECT_MUTATION = gql`
mutation UpdateProcessedProject($id: ID!, $data: ProcessedProjectUpdateInput!) {
    updateProcessedProject(data: $data, pk: $id) {
        ... on ProjectTypeMutationResponseType {
            errors
            ok
            result {
                id
                status
            }
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
    const { id: projectIdFromParams } = useParams<{ id: string }>();

    const {
        className,
        projectData,
    } = props;

    const [
        updateProcessedProject,
        { loading: updateProcessedProjectPending },
    ] = useMutation<UpdateProcessedProjectMutation, UpdateProcessedProjectMutationVariables>(
        UPDATE_PROCESSED_PROJECT_MUTATION,
    );

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
    } = useForm(processedProjectUpdateFormSchema, {
        value: defaultProcessedProjectFormValue,
    }, projectContext);

    useEffect(() => {
        if (isNotDefined(projectData)) {
            return;
        }

        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            id,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            projectType,
            requestingOrganization,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            projectTypeSpecifics,
            ...other
        } = removeNull(projectData.project);

        setValue({
            ...other,
            requestingOrganization: requestingOrganization.id,
        });
    }, [projectData, setValue]);

    const error = getErrorObject(formError);

    const submitUpdateProcessedForm = useCallback(async (
        finalValues: ProcessedProjectUpdateInput,
    ) => {
        if (isDefined(projectIdFromParams)) {
            const results = await updateProcessedProject({
                variables: {
                    id: projectIdFromParams,
                    data: finalValues,
                },
            });

            if (isDefined(results.data)
                // eslint-disable-next-line no-underscore-dangle
                && results.data.updateProcessedProject.__typename === 'ProjectTypeMutationResponseType'
            ) {
                const {
                    ok,
                    errors,
                    // result,
                } = results.data.updateProcessedProject;

                if (!ok) {
                    setError(transformErrors(errors));
                }
            }
        }
    }, [projectIdFromParams, updateProcessedProject, setError]);

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
            className={_cs(styles.updateProcessedProjectForm, className)}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handlePublishButtonClick}
                    disabled={baseInputsDisabled}
                    variant="primary"
                    actions={<MdArrowForward />}
                >
                    Publish
                </Button>
            )}
            headerActions={(
                <Button
                    name={undefined}
                    onClick={handleUpdateBasicDetailsButtonClick}
                    disabled={baseInputsDisabled}
                    icons={<MdSave />}
                >
                    Update basic details
                </Button>
            )}
            aside={(
                <ProjectStatusOutput
                    value={projectData?.project.status}
                />
            )}
            mainContentClassName={styles.mainContent}
        >
            {projectData?.project.status === ProjectStatusEnum.Failed && (
                <div className={styles.processingsFailedMessage}>
                    There was an error while processing the project.
                    Please make the necessary changes before proceeding!
                </div>
            )}
            <div className={styles.baseInputs}>
                <TextInput
                    label="Project title"
                    name="name"
                    value={value.name}
                    onChange={setFieldValue}
                    error={error?.name}
                    disabled={baseInputsDisabled}
                />
                <TextInput
                    label="Project description"
                    name="description"
                    value={value.description}
                    onChange={setFieldValue}
                    error={error?.description}
                    disabled={baseInputsDisabled}
                />
                <TextInput
                    label="Look for"
                    name="lookFor"
                    value={value.lookFor}
                    onChange={setFieldValue}
                    error={error?.lookFor}
                    disabled={baseInputsDisabled}
                />
                <TextInput
                    label="Organization"
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
            </div>
        </PageLayout>
    );
}

export default UpdateProcessedProjectForm;
