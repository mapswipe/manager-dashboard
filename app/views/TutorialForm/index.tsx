import {
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { generatePath, useNavigate, useParams } from 'react-router';
import {
    gql,
    useMutation,
    useQuery,
} from '@apollo/client';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container';
import NonFieldError from '#components/NonFieldError';
import PageLayout from '#components/PageLayout';
import SelectInput from '#components/SelectInput';
import {
    NewTutorialMutation,
    NewTutorialMutationVariables,
    ProjectOptionsQuery,
    ProjectOptionsQueryVariables,
    TutorialCreateInput,
    TutorialDetailsQuery,
    TutorialDetailsQueryVariables,
} from '#generated/types/graphql';
import {
    idSelector,
    nameSelector,
} from '#utils/common';
import { transformErrors } from '#utils/error';

import { PartialInformationPageInputFields } from './InformationPageInput/schema';
import { PartialScenarioPageInputFields } from './ScenarioPageInput/schema';
import InformationPageInput from './InformationPageInput';
import ScenarioPageInput from './ScenarioPageInput';
import tutorialCreateFormSchema, {
    defaultTutorialCreateFormValue,
    PartialTutorialCreateInputFields,
} from './schema';

import styles from './styles.module.css';
import routes from '#base/configs/routes';

const TUTORIAL_QUERY = gql`
query TutorialDetails($id: ID!) {
    tutorial(id: $id) {
        id
        isDraft
        informationPages {
            id
            pageNumber
            title
            tutorialId
            blocks {
                blockNumber
                blockType
                id
                pageId
                text
                image {
                    url
                    size
                    path
                    name
                    height
                    width
                }
            }
        }
        projectId
        scenarios {
            hintDescription
            hintIcon
            hintTitle
            id
            instructionsDescription
            instructionsIcon
            instructionsTitle
            scenarioId
            successDescription
            successIcon
            successTitle
            tutorialId
            tasks {
                id
                projectTypeSpecifics
                reference
                scenarioId
            }
        }
    }
}
`;

const PROJECT_OPTION_QUERY = gql`
query ProjectOptions {
    projects {
        results {
            id
            name
        }
    }
}
`;

const CREATE_TUTORIAL_MUTATION = gql`
mutation NewTutorial($data: TutorialCreateInput!) {
    createTutorial(data: $data) {
        ... on TutorialTypeMutationResponseType {
            errors
            ok
            result {
                id
            }
        }
    }
}
`;

interface Props {
    className?: string;
}

function NewTutorial(props: Props) {
    const { className } = props;
    const { id: tutorialIdFromParams } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const [
        createNewTutorial,
        { loading: createNewTutorialPending },
    ] = useMutation<NewTutorialMutation, NewTutorialMutationVariables>(CREATE_TUTORIAL_MUTATION);
    const {
        data: projectOptionsResponse,
    } = useQuery<ProjectOptionsQuery, ProjectOptionsQueryVariables>(PROJECT_OPTION_QUERY);

    const {
        data: tutorialData,
        loading: tutorialDataPending,
    } = useQuery<TutorialDetailsQuery, TutorialDetailsQueryVariables>(
        TUTORIAL_QUERY,
        {
            variables: { id: tutorialIdFromParams ?? '' },
            skip: isNotDefined(tutorialIdFromParams),
        },
    );

    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        validate,
        setError,
    } = useForm(tutorialCreateFormSchema, {
        value: defaultTutorialCreateFormValue,
    });

    useEffect(() => {
        if (isNotDefined(tutorialData)) {
            return;
        }

        const { tutorial } = tutorialData;

        // FIXME: need to add clientId and fix the structure
        setValue(tutorial);
    }, [tutorialData, setValue]);

    const error = getErrorObject(formError);

    const {
        setValue: setInformationPageFieldValue,
        removeValue: removeInformationPage,
    } = useFormArray(
        'informationPages' as const,
        setFieldValue,
    );

    const informationPageErrors = useMemo(
        () => getErrorObject(error?.informationPages),
        [error],
    );

    const addInformationPage = useCallback(
        () => {
            const newInformationPage: PartialInformationPageInputFields = {
                clientId: ulid(),
            };

            setFieldValue(
                (oldValue: PartialInformationPageInputFields[] | undefined) => (
                    [...(oldValue ?? []), newInformationPage]
                ),
                'informationPages' as const,
            );
        },
        [setFieldValue],
    );

    const {
        setValue: setScenarioPageFieldValue,
        removeValue: removeScenarioPage,
    } = useFormArray(
        'scenarios' as const,
        setFieldValue,
    );

    const scenarioPageErrors = useMemo(
        () => getErrorObject(error?.scenarios),
        [error],
    );

    const addScenarioPage = useCallback(
        () => {
            const newScenarioPage: PartialScenarioPageInputFields = {
                clientId: ulid(),
            };

            setFieldValue(
                (oldValue: PartialScenarioPageInputFields[] | undefined) => (
                    [...(oldValue ?? []), newScenarioPage]
                ),
                'scenarios' as const,
            );
        },
        [setFieldValue],
    );

    const handleFormSubmission = useCallback(
        async (submittedValues: PartialTutorialCreateInputFields) => {
            if (isDefined(tutorialIdFromParams)) {
                console.info('Edit not implemented yet!', submittedValues);
                return;
            }

            const finalValues = submittedValues as TutorialCreateInput;
            const result = await createNewTutorial({
                variables: {
                    data: {
                        ...finalValues,
                        isDraft: true,
                    },
                },
            });

            // eslint-disable-next-line no-underscore-dangle
            if (result.data?.createTutorial.__typename === 'TutorialTypeMutationResponseType') {
                const {
                    ok,
                    errors,
                    // result,
                } = result.data.createTutorial;

                if (!ok) {
                    setError(transformErrors(errors));
                }

                if (result.data.createTutorial.ok
                    && result.data.createTutorial.result
                ) {
                    navigate(
                        generatePath(
                            routes.editTutorial.originalPath,
                            { id: result.data.createTutorial.result.id },
                        ),
                    );
                }
            }
        },
        [navigate, tutorialIdFromParams, createNewTutorial, setError],
    );

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    return (
        <PageLayout
            className={_cs(styles.newTutorial, className)}
            heading="Create a New Tutorial"
            mainContentClassName={styles.mainContent}
            footerActions={(
                <Button
                    name={undefined}
                    variant="primary"
                    onClick={handleSubmitButtonClick}
                >
                    Submit
                </Button>
            )}
        >
            <SelectInput
                label="Project"
                name="project"
                options={projectOptionsResponse?.projects.results}
                keySelector={idSelector}
                labelSelector={nameSelector}
                value={value.project}
                onChange={setFieldValue}
                error={error?.project}
            />
            <Container
                heading="Information Pages"
                headingLevel={2}
                headerDescription={(
                    <NonFieldError
                        error={error?.informationPages}
                    />
                )}
                headerActions={(
                    <Button
                        name={undefined}
                        onClick={addInformationPage}
                    >
                        Add new info page
                    </Button>
                )}
                withHeaderBorder
                isEmpty={isNotDefined(value.informationPages)
                    || value.informationPages.length === 0}
            >
                {value.informationPages?.map((informationPage, informationPageIndex) => (
                    <InformationPageInput
                        key={informationPage.clientId}
                        className={styles.informationPage}
                        index={informationPageIndex}
                        value={informationPage}
                        onChange={setInformationPageFieldValue}
                        onRemove={removeInformationPage}
                        error={getErrorObject(informationPageErrors?.[informationPage.clientId])}
                    />
                ))}
            </Container>
            <Container
                heading="Scenario Pages"
                headingLevel={2}
                headerDescription={(
                    <NonFieldError
                        error={error?.scenarios}
                    />
                )}
                headerActions={(
                    <Button
                        name={undefined}
                        onClick={addScenarioPage}
                    >
                        Add new scenario page
                    </Button>
                )}
                withHeaderBorder
                isEmpty={isNotDefined(value.scenarios)
                    || value.scenarios.length === 0}
            >
                {value.scenarios?.map((scenarioPage, scenarioPageIndex) => (
                    <ScenarioPageInput
                        key={scenarioPage.clientId}
                        className={styles.scenarioPage}
                        index={scenarioPageIndex}
                        value={scenarioPage}
                        onChange={setScenarioPageFieldValue}
                        onRemove={removeScenarioPage}
                        error={getErrorObject(scenarioPageErrors?.[scenarioPage.clientId])}
                    />
                ))}
            </Container>
        </PageLayout>
    );
}

export default NewTutorial;
