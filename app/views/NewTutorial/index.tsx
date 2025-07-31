import {
    useCallback,
    useMemo,
} from 'react';
import { CgArrowTopRightR } from 'react-icons/cg';
import { MdDownload } from 'react-icons/md';
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
import ProjectSpecificDetails from '#components/domain/ProjectSpecificDetails';
import InlineLayout from '#components/InlineLayout';
import PageLayout from '#components/PageLayout';
import SelectInput from '#components/SelectInput';
import TextInput from '#components/TextInput';
import TextOutput from '#components/TextOutput';
import {
    AssetMimetypeEnum,
    TutorialCreateInput,
    useNewTutorialMutation,
    useProjectOptionsQuery,
    useProjectOutputAssetsQuery,
    useTutorialProjectDetailQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    idSelector,
    nameSelector,
} from '#utils/common';
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

interface Props {
    className?: string;
}

function NewTutorial(props: Props) {
    const { className } = props;

    const navigate = useNavigate();
    const alert = useAlert();

    const defaultTutorialCreateFormValue = useMemo<PartialTutorialCreateInputFields>(() => ({
        clientId: ulid(),
    }), []);

    const [{ data: projectOptionsResponse }] = useProjectOptionsQuery();
    const {
        value,
        setFieldValue,
        error: formError,
        validate,
        setError,
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

    const [{
        data: projectAssetsResponse,
    }] = useProjectOutputAssetsQuery({
        variables: {
            projectId: value.project ?? '',
            pagination: {
                offset: 0,
                limit: 10,
            },
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

                navigate(
                    generatePath(
                        routes.editTutorial.originalPath,
                        { id: createTutorialResult.id },
                    ),
                );
            } catch (combinedError) {
                alertCombinedError(combinedError, alert);
            }
        },
        [navigate, createNewTutorial, setError, alert],
    );
    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const inputsDisabled = createNewTutorialPending;
    const actionsDisabled = inputsDisabled;

    return (
        <PageLayout
            className={className}
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
                heading="Project"
                withHeaderBorder
                withContentBackgroundAndPadding
                spacing="lg"
                headerDescription="Informations like zoom level, tile server, etc will be inherited from the reference project"
            >
                <SelectInput
                    label="Select a project"
                    name="project"
                    options={projectOptionsResponse?.projects.results}
                    keySelector={idSelector}
                    labelSelector={nameSelector}
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
                                label="Look for"
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
                        <Container
                            heading="Project Assets"
                            headingLevel={4}
                            contentLayout="inline"
                        >
                            {projectAssetsResponse?.projectAssets.results.map((projectAsset) => (
                                <InlineLayout
                                    key={projectAsset.id}
                                    // className={styles.assetCard}
                                    withPadding
                                    spacing="sm"
                                    end={(
                                        <>
                                            {/* eslint-disable-next-line max-len */}
                                            {projectAsset.mimetype === AssetMimetypeEnum.Geojson && (
                                                <a
                                                    // className={styles.projectAssetDownloadLink}
                                                    href={`https://geojson.io/#data=data:text/x-url,${encodeURIComponent(projectAsset.file.url)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title="Preview in geojson.io"
                                                >
                                                    <CgArrowTopRightR />
                                                </a>
                                            )}
                                            <a
                                                // className={styles.projectAssetDownloadLink}
                                                href={projectAsset.file.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Download"
                                                download
                                            >
                                                <MdDownload />
                                            </a>
                                        </>
                                    )}
                                >
                                    {projectAsset.file.name.replace(/^.*[\\/]/, '')}
                                </InlineLayout>
                            ))}
                        </Container>
                    </>
                )}
            </Container>
        </PageLayout>
    );
}

export default NewTutorial;
