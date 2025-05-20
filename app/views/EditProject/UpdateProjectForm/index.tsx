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
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Heading from '#components/Heading';
import NonFieldError from '#components/NonFieldError';
import NumberInput from '#components/NumberInput';
import PageLayout from '#components/PageLayout';
import ProjectStatusOutput from '#components/ProjectStatusOutput';
import SelectInput from '#components/SelectInput/index.tsx';
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
import useOrganizationListQuery from '#hooks/useOrganizationListQuery.ts';
import {
    idSelector,
    nameSelector,
} from '#utils/common';
import { transformErrors } from '#utils/error';

import AssetInput from '../AssetInput/index.tsx';
import {
    defaultCompareSpecificFormValue,
    PartialCompareSpecificFields,
} from './CompareProjectSpecifics/schema';
import {
    defaultFindSpecificFormValue,
    PartialFindSpecificFields,
} from './FindProjectSpecifics/schema';
import CompareProjectSpecifics from './CompareProjectSpecifics';
import FindProjectSpecifics from './FindProjectSpecifics';
import projectUpdateFormSchema, {
    PartialProjectTypeSpecificInput,
    type PartialProjectUpdateInput,
} from './schema.ts';

import styles from './styles.module.css';

const UPDATE_PROJECT_MUTATION = gql`
mutation UpdateProject($id: ID!, $data: ProjectUpdateInput!) {
    updateProject(data: $data, pk: $id) {
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

const projectTypeToKeyMap: Record<ProjectTypeEnum, keyof(ProjectTypeSpecificInput)> = {
    [ProjectTypeEnum.Find]: 'find',
    [ProjectTypeEnum.Compare]: 'compare',
    [ProjectTypeEnum.Completeness]: 'completeness',
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

    const {
        data: organizationListResponse,
    } = useOrganizationListQuery({
        limit: 20,
        offset: 0,
    });

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
            ...other
        } = removeNull(projectData.project);

        setValue({
            ...other,
            requestingOrganization: requestingOrganization.id,
            image: image?.id,
            projectTypeSpecifics: {
                // TODO: replace with the default value
                [projectTypeToKeyMap[projectType]]: projectTypeSpecifics
                    ?? defaultProjectTypeSpecificsValue,
            },
        });
    }, [projectData, setValue, defaultProjectTypeSpecificsValue]);

    const error = getErrorObject(formError);

    const submitUpdateForm = useCallback(async (
        finalValues: ProjectUpdateInput,
    ) => {
        const results = await updateProject({
            variables: {
                id: projectData.project.id,
                data: finalValues,
            },
        });

        if (isDefined(results.data)
            // eslint-disable-next-line no-underscore-dangle
            && results.data.updateProject.__typename === 'ProjectTypeMutationResponseType'
        ) {
            const {
                ok,
                errors,
                // result,
            } = results.data.updateProject;

            if (!ok) {
                setError(transformErrors(errors));
            }
        }
    }, [projectData.project.id, updateProject, setError]);

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
            className={_cs(styles.updateProjectForm, className)}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleStartProcessingButtonClick}
                    disabled={baseInputsDisabled}
                    colorVariant="primary"
                    styleVariant="filled"
                    end={<MdArrowForward />}
                >
                    Save and Start processing
                </Button>
            )}
            headerActions={(
                <Button
                    name={undefined}
                    onClick={handleUpdateDraftButtonClick}
                    disabled={baseInputsDisabled}
                    start={<MdSave />}
                >
                    Update draft
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
                <TextArea
                    label="Project description"
                    name="description"
                    value={value.description}
                    onChange={setFieldValue}
                    error={error?.description}
                    disabled={baseInputsDisabled}
                    rows={4}
                />
                <TextInput
                    label="Look for"
                    name="lookFor"
                    value={value.lookFor}
                    onChange={setFieldValue}
                    error={error?.lookFor}
                    disabled={baseInputsDisabled}
                />
                <SelectInput
                    label="Requesting organization"
                    name="requestingOrganization"
                    value={value.requestingOrganization}
                    options={organizationListResponse?.organizations.results}
                    onChange={setFieldValue}
                    error={error?.requestingOrganization}
                    keySelector={idSelector}
                    labelSelector={nameSelector}
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
            </div>
            <div className={styles.projectTypeSpecificInputs}>
                <Heading level={3}>
                    {`ProjectType: ${projectContext.projectType}`}
                </Heading>
                <NonFieldError
                    error={error?.projectTypeSpecifics}
                />
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
                        value={value.projectTypeSpecifics?.compare}
                        setFieldValue={setCompareProjectSpecificsFieldValue}
                        error={getErrorObject(error?.projectTypeSpecifics)?.compare}
                        disabled={projectTypeSpecificInputsDisabled}
                    />
                )}
            </div>
        </PageLayout>
    );
}

export default UpdateProjectForm;
