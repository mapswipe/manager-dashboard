import {
    useCallback,
    useMemo,
} from 'react';
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
    useForm,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';
import { gql } from 'urql';

import routes from '#base/configs/routes';
import Button from '#components/Button';
import Container from '#components/Container';
import ProjectAssetsList from '#components/domain/ProjectAssetsList';
import ProjectSpecificDetails from '#components/domain/ProjectSpecificDetails';
import PageLayout from '#components/PageLayout';
import ProjectSelectInput from '#components/selections/ProjectSelectInput';
import TextInput from '#components/TextInput';
import TextOutput from '#components/TextOutput';
import {
    TutorialCreateInput,
    useNewTutorialMutation,
    useTutorialProjectDetailQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';
import { OPERATION_INFO_FRAGMENT } from '#utils/query';
import { PartialTutorialUpdateInputFields } from '#views/EditTutorial/schema';

import tutorialCreateFormSchema, { PartialTutorialCreateInputFields } from './schema';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CREATE_TUTORIAL_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation NewTutorial($data: TutorialCreateInput!) {
    createTutorial(data: $data) {
        ... on TutorialTypeMutationResponseType {
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

function NewTutorial() {
    const navigate = useNavigate();
    const alert = useAlert();

    const defaultTutorialCreateFormValue = useMemo<PartialTutorialCreateInputFields>(() => ({
        clientId: ulid(),
    }), []);

    const {
        value,
        setFieldValue,
        error: formError,
        validate,
        setError,
        pristine,
        setPristine,
    } = useForm(
        tutorialCreateFormSchema,
        { value: defaultTutorialCreateFormValue },
        // tutorialFormContext,
    );

    const error = getErrorObject(formError);

    const [{
        data: projectDetailResponse,
    }] = useTutorialProjectDetailQuery({
        variables: {
            projectId: value.project ?? '',
        },
        pause: isNotDefined(value.project),
    });

    const [
        { fetching: createNewTutorialPending },
        createNewTutorial,
    ] = useNewTutorialMutation();

    const handleFormSubmission = useCallback(
        async (submittedValues: PartialTutorialUpdateInputFields) => {
            const finalValues = submittedValues as TutorialCreateInput;

            try {
                const result = await createNewTutorial({
                    data: finalValues,
                });

                if (checkAndAlertGraphQLResultError(result, alert)) {
                    return;
                }

                if (isNotDefined(result.data)
                    // eslint-disable-next-line no-underscore-dangle
                    || result.data.createTutorial.__typename !== 'TutorialTypeMutationResponseType'
                ) {
                    alert.show(
                        'Failed to create the Tutorial!',
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
                    result: createTutorialResult,
                } = result.data.createTutorial;

                if (!ok || !createTutorialResult) {
                    alert.show(
                        'Failed to create the Tutorial!',
                        {
                            description: 'Please fix the errors and try again!',
                            variant: 'danger',
                        },
                    );
                    setError(transformErrors(errors));
                    return;
                }

                alert.show(
                    'Tutorial created successfully!',
                    {
                        description: 'Navigating to edit page of the created tutorial.',
                        variant: 'success',
                    },
                );

                setPristine(true);
                // NOTE: pristine needs to be set first before navigation
                setTimeout(() => {
                    if (routes.editTutorial.path) {
                        navigate(
                            generatePath(
                                routes.editTutorial.path,
                                { id: createTutorialResult.id },
                            ),
                        );
                    }
                }, 200);
            } catch (combinedError) {
                alertCombinedError(combinedError, alert);
            }
        },
        [navigate, createNewTutorial, setError, alert, setPristine],
    );
    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const inputsDisabled = createNewTutorialPending;
    const actionsDisabled = inputsDisabled;

    return (
        <PageLayout
            heading="Create a New Tutorial"
            footerActions={(
                <Button
                    name={undefined}
                    colorVariant="accent"
                    styleVariant="filled"
                    onClick={handleSubmitButtonClick}
                    disabled={actionsDisabled}
                >
                    Submit
                </Button>
            )}
            confirmNavigationChange={!pristine}
        >
            <Container
                heading="Title"
                withHeaderBorder
                withContentBackgroundAndPadding
                spacing="lg"
            >
                <TextInput
                    label="Tutorial title"
                    name="name"
                    value={value.name}
                    onChange={setFieldValue}
                    error={error?.name}
                    disabled={inputsDisabled}
                />
            </Container>
            <Container
                heading="Reference Project"
                withHeaderBorder
                withContentBackgroundAndPadding
                spacing="lg"
                headerDescription="Some information will be inherited from from the selected project"
            >
                <ProjectSelectInput
                    label="Select a reference project"
                    name="project"
                    value={value.project}
                    onChange={setFieldValue}
                    error={error?.project}
                    disabled={inputsDisabled}
                />
                {isDefined(projectDetailResponse) && (
                    <>
                        <Container
                            spacing="sm"
                        >
                            <TextOutput
                                label="Instruction"
                                value={projectDetailResponse.project.projectInstruction}
                            />
                            <TextOutput
                                label="Look for (legacy)"
                                value={projectDetailResponse.project.lookFor}
                            />
                            <TextOutput
                                label="Requesting organization"
                                value={projectDetailResponse.project.requestingOrganization.name}
                            />
                        </Container>
                        <ProjectSpecificDetails
                            projectId={projectDetailResponse.project.id}
                        />
                        <ProjectAssetsList
                            projectId={projectDetailResponse.project.id}
                        />
                    </>
                )}
            </Container>
        </PageLayout>
    );
}

export default NewTutorial;
