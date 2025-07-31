import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { CgArrowTopRightR } from 'react-icons/cg';
import { IoAdd } from 'react-icons/io5';
import { MdDownload } from 'react-icons/md';
import { useParams } from 'react-router';
import {
    _cs,
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    unique,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    removeNull,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container';
import GeoJsonFileInput from '#components/domain/GeoJsonFileInput';
import ProjectSpecificDetails from '#components/domain/ProjectSpecificDetails';
import InlineLayout from '#components/InlineLayout';
import NonFieldError from '#components/NonFieldError';
import PageLayout from '#components/PageLayout';
import TextInput from '#components/TextInput';
import TextOutput from '#components/TextOutput';
import {
    AssetMimetypeEnum,
    ProjectTypeEnum,
    TutorialUpdateInput,
    useProjectOutputAssetsQuery,
    useTutorialDetailsQuery,
    useTutorialProjectDetailQuery,
    useUpdateTutorialMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import { projectTypeToKeyMap } from '#utils/common';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';

import { PartialInformationPageInputFields } from './InformationPageInput/schema';
import InformationPageInput from './InformationPageInput';
import ScenarioPageInput from './ScenarioPageInput';
import tutorialUpdate, {
    PartialTutorialUpdateInputFields,
    TutorialFormContext,
} from './schema';
import { validateFindTutorialGeoJson } from './utils';

import styles from './styles.module.css';

function createMapping<T extends { clientId: string }>(items: T[]) {
    return listToMap(items, ({ clientId }) => clientId);
}

function createCud<
    CURRENT_ITEM extends { clientId: string },
    PREV_ITEM extends { clientId: string, id: string },
    TRANSFORMED_UPDATED_VALUE,
>(
    currentValues: CURRENT_ITEM[],
    prevValues: PREV_ITEM[],
    transformUpdateValue: (
        current: CURRENT_ITEM & { id: string },
        previous: PREV_ITEM
    ) => TRANSFORMED_UPDATED_VALUE = (current) => current as unknown as TRANSFORMED_UPDATED_VALUE,
) {
    const prevValueMapping = createMapping(prevValues);
    const newValueMapping = createMapping(currentValues);

    const createdValues = currentValues.filter(
        ({ clientId }) => !prevValueMapping[clientId],
    );

    // FIXME: create diffing algorithm to check if values are actually updated
    const updatedValues = currentValues.filter(
        ({ clientId }) => !!prevValueMapping[clientId],
    ).map((updatedValue) => {
        const prevValue = prevValueMapping[updatedValue.clientId];
        return transformUpdateValue(
            {
                ...updatedValue,
                id: prevValue.id,
            },
            prevValue,
        );
    });
    const deletedValues = prevValues.filter(
        ({ clientId }) => !newValueMapping[clientId],
    );

    return [
        ...createdValues.map((createValue) => ({ create: createValue })),
        ...updatedValues.map((updateValue) => ({ update: updateValue })),
        ...deletedValues.map(({ id }) => ({ delete: { id } })),
    ];
}

interface Props {
    className?: string;
}

function NewTutorial(props: Props) {
    const { className } = props;
    const { id: tutorialIdFromParams } = useParams<{ id: string }>();
    const [tutorialFormContext, setTutorialFormContext] = useState<TutorialFormContext>();

    const alert = useAlert();

    const [
        { fetching: updateTutorialPending },
        updateTutorial,
    ] = useUpdateTutorialMutation();

    const [{
        // fetching: tutorialDataPending,
        data: tutorialData,
    }] = useTutorialDetailsQuery({
        variables: { id: tutorialIdFromParams ?? '' },
        pause: isNotDefined(tutorialIdFromParams),
    });

    const defaultTutorialCreateFormValue = useMemo<PartialTutorialUpdateInputFields>(() => ({
        clientId: ulid(),
    }), []);

    const tutorialResponseRef = useRef<PartialTutorialUpdateInputFields>();

    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        validate,
        setError,
    } = useForm(
        tutorialUpdate,
        { value: defaultTutorialCreateFormValue },
        tutorialFormContext,
    );

    useEffect(() => {
        if (isNotDefined(tutorialData)) {
            return;
        }

        const { tutorial } = tutorialData;
        const {
            projectId,
            scenarios,
            ...other
        } = removeNull(tutorial, []);

        const transformedTutorial = {
            project: projectId,
            scenarios: scenarios.map((scenario) => ({
                ...scenario,
                tasks: scenario.tasks.map((task) => {
                    // eslint-disable-next-line no-underscore-dangle
                    if (task.projectTypeSpecifics?.__typename === 'FindTutorialTaskPropertyType') {
                        return {
                            ...task,
                            projectTypeSpecifics: {
                                find: task.projectTypeSpecifics,
                            },
                        };
                    }

                    // eslint-disable-next-line no-underscore-dangle
                    if (task.projectTypeSpecifics?.__typename === 'CompareTutorialTaskPropertyType') {
                        return {
                            ...task,
                            projectTypeSpecifics: {
                                compare: task.projectTypeSpecifics,
                            },
                        };
                    }

                    // eslint-disable-next-line no-underscore-dangle
                    if (task.projectTypeSpecifics?.__typename === 'ValidateTutorialTaskPropertyType') {
                        return {
                            ...task,
                            projectTypeSpecifics: {
                                validate: task.projectTypeSpecifics,
                            },
                        };
                    }

                    // eslint-disable-next-line no-underscore-dangle
                    if (task.projectTypeSpecifics?.__typename === 'CompletenessTutorialTaskPropertyType') {
                        return {
                            ...task,
                            projectTypeSpecifics: {
                                completeness: task.projectTypeSpecifics,
                            },
                        };
                    }

                    // eslint-disable-next-line no-underscore-dangle
                    if (task.projectTypeSpecifics?.__typename === 'ValidateImageTutorialTaskPropertyType') {
                        return {
                            ...task,
                            projectTypeSpecifics: {
                                validateImage: task.projectTypeSpecifics,
                            },
                        };
                    }

                    return { ...task };
                }),
            })),
            ...other,
        };

        tutorialResponseRef.current = transformedTutorial;

        // FIXME: need to add clientId and fix the structure
        setValue(transformedTutorial);
    }, [tutorialData, setValue]);

    const error = getErrorObject(formError);

    const {
        setValue: setInformationPageFieldValue,
        // removeValue: removeInformationPage,
    } = useFormArray(
        'informationPages' as const,
        setFieldValue,
    );

    const [{
        data: projectAssetsResponse,
    }] = useProjectOutputAssetsQuery({
        variables: {
            projectId: tutorialData?.tutorial.projectId ?? '',
            pagination: {
                offset: 0,
                limit: 10,
            },
        },
        pause: isNotDefined(tutorialData?.tutorial.projectId),
    });

    const [{
        data: projectDetailResponse,
    }] = useTutorialProjectDetailQuery({
        variables: {
            projectId: tutorialData?.tutorial.projectId ?? '',
        },
        pause: isNotDefined(tutorialData?.tutorial.projectId),
    });

    useEffect(() => {
        if (isNotDefined(projectDetailResponse)) {
            return;
        }

        setTutorialFormContext({
            projectType: projectDetailResponse.project.projectType,
        });
    }, [projectDetailResponse]);

    const removeInformationPage = useCallback(
        (indexToRemove: number) => {
            setFieldValue(
                (oldValue: PartialInformationPageInputFields[] | undefined) => {
                    if (
                        isNotDefined(oldValue)
                            || oldValue.length === 0
                            || isNotDefined(oldValue[indexToRemove])
                    ) {
                        return oldValue;
                    }

                    const newValue = oldValue.toSpliced(indexToRemove, 1).map(
                        (item, pageIndex) => ({
                            ...item,
                            pageNumber: pageIndex + 1,
                        }),
                    );

                    return newValue;
                },
                'informationPages',
            );
        },
        [setFieldValue],
    );

    const informationPageErrors = useMemo(
        () => getErrorObject(error?.informationPages),
        [error],
    );

    const addInformationPage = useCallback(
        (newValueIndex: number) => {
            const newInformationPage: PartialInformationPageInputFields = {
                clientId: ulid(),
                pageNumber: newValueIndex + 1,
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

    const handleFormSubmission = useCallback(
        async (submittedValues: PartialTutorialUpdateInputFields) => {
            if (isNotDefined(tutorialIdFromParams) || isNotDefined(tutorialData)) {
                // eslint-disable-next-line no-console
                console.error('tutorial not loaded properly', tutorialIdFromParams, tutorialData);
                return;
            }

            const {
                informationPages: responseInformationPages,
                scenarios: responseScenarios,
            } = tutorialData.tutorial;

            const {
                informationPages: formInformationPages,
                scenarios: formScenarios,
                ...otherValues
            } = submittedValues;

            const informationPages = createCud(
                formInformationPages ?? [],
                responseInformationPages,
                (formInformationPage, responseInformationPage) => ({
                    ...formInformationPage,
                    id: responseInformationPage.id,
                    blocks: createCud(
                        formInformationPage.blocks ?? [],
                        responseInformationPage.blocks,
                    ),
                }),
            );

            const scenarios = createCud(
                formScenarios ?? [],
                responseScenarios,
                (formScenario, responseScenario) => ({
                    ...formScenario,
                    id: responseScenario.id,
                    tasks: createCud(
                        formScenario.tasks ?? [],
                        responseScenario.tasks ?? [],
                    ),
                }),
            );

            const finalValues: TutorialUpdateInput = {
                ...otherValues,
                informationPages,
                scenarios,
            } as TutorialUpdateInput; // FIXME: try to remove this typecast

            try {
                const result = await updateTutorial({
                    data: finalValues,
                    id: tutorialIdFromParams,
                });

                if (checkAndAlertGraphQLResultError(result, alert)) {
                    return;
                }

                if (isNotDefined(result.data)
                    // eslint-disable-next-line no-underscore-dangle
                    || result.data.updateTutorial.__typename !== 'TutorialTypeMutationResponseType'
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
                    result: updateTutorialResult,
                } = result.data.updateTutorial;

                if (!ok || !updateTutorialResult) {
                    alert.show(
                        'Failed to update the Tutorial!',
                        {
                            description: 'Please fix the errors and try again!',
                            variant: 'danger',
                        },
                    );
                    setError(transformErrors(errors));
                    return;
                }

                alert.show(
                    'Tutorial updated successfully!',
                    {
                        // description: 'Navigating to edit page of the created tutorial.',
                        variant: 'success',
                    },
                );
            } catch (apolloError) {
                alertCombinedError(apolloError, alert);
            }
        },
        [
            tutorialIdFromParams,
            tutorialData,
            updateTutorial,
            alert,
            setError,
        ],
    );

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const handleGeoJsonFileChange = useCallback((geoJson: GeoJSON.GeoJSON | undefined) => {
        if (
            isNotDefined(projectDetailResponse)
                || isNotDefined(geoJson)
                || !validateFindTutorialGeoJson(geoJson)
        ) {
            return;
        }

        if (projectDetailResponse.project.projectType === ProjectTypeEnum.Validate) {
            const scenarioPages = geoJson.features.map((feature, i) => ({
                clientId: ulid(),
                scenarioPageNumber: isDefined(feature.properties.screen)
                    ? feature.properties.screen
                    : i + 1,
                tasks: [
                    {
                        clientId: ulid(),
                        reference: feature.properties.reference,
                        projectTypeSpecifics: {
                            validate: {
                                objectGeometry: JSON.stringify(feature.geometry, null, 4),
                            },
                        },
                    },
                ],
            }));

            setFieldValue(scenarioPages, 'scenarios');
            return;
        }

        const featuresByScreen = listToGroupList(
            geoJson.features,
            (feature) => feature.properties.screen,
        );

        const projectTypeKey = projectTypeToKeyMap[projectDetailResponse.project.projectType];

        const scenarioPages = unique(
            geoJson.features,
            (feature) => feature.properties.screen,
        ).toSorted(
            (a, b) => compareNumber(a.properties.screen, b.properties.screen),
        ).map(({ properties }) => ({
            clientId: ulid(),
            scenarioPageNumber: properties.screen,
            tasks: featuresByScreen[properties.screen].map((feature) => ({
                clientId: ulid(),
                reference: feature.properties.reference,
                projectTypeSpecifics: {
                    [projectTypeKey]: {
                        tileX: feature.properties.tile_x,
                        tileY: feature.properties.tile_y,
                        tileZ: feature.properties.tile_z,
                        objectGeometry: JSON.stringify(feature.geometry),
                    },
                },
            })),
        }));

        setFieldValue(scenarioPages, 'scenarios');
    }, [setFieldValue, projectDetailResponse]);

    const inputsDisabled = updateTutorialPending;
    const actionsDisabled = inputsDisabled;

    return (
        <PageLayout
            className={_cs(styles.newTutorial, className)}
            heading={isDefined(tutorialIdFromParams) ? 'Update Tutorial' : 'Create a New Tutorial'}
            footerActions={(
                <Button
                    name={undefined}
                    colorVariant="accent"
                    styleVariant="filled"
                    onClick={handleSubmitButtonClick}
                    disabled={actionsDisabled}
                >
                    Update
                </Button>
            )}
        >
            <Container
                heading="General"
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
            >
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
                                    className={styles.assetCard}
                                    withPadding
                                    spacing="sm"
                                    end={(
                                        <>
                                            {/* eslint-disable-next-line max-len */}
                                            {projectAsset.mimetype === AssetMimetypeEnum.Geojson && (
                                                <a
                                                    className={styles.projectAssetDownloadLink}
                                                    href={`https://geojson.io/#data=data:text/x-url,${encodeURIComponent(projectAsset.file.url)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title="Preview in geojson.io"
                                                >
                                                    <CgArrowTopRightR />
                                                </a>
                                            )}
                                            <a
                                                className={styles.projectAssetDownloadLink}
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
            <Container
                withContentBackgroundAndPadding={value.informationPages?.length === 0}
                heading="Information Pages"
                headerDescription={(
                    <NonFieldError
                        error={error?.informationPages}
                    />
                )}
                withHeaderBorder
                headerActions={(
                    <Button
                        className={styles.addPageButton}
                        name={value.informationPages?.length ?? 0}
                        onClick={addInformationPage}
                        start={<IoAdd />}
                        styleVariant="transparent"
                        withoutPadding
                    >
                        New page
                    </Button>
                )}
                empty={isNotDefined(value.informationPages)
                    || value.informationPages.length === 0}
                spacing="lg"
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
                        lookForValue={projectDetailResponse?.project.lookFor}
                    />
                ))}
            </Container>
            <Container
                withContentBackgroundAndPadding={!value.scenarios?.length}
                heading="Scenario Pages"
                withHeaderBorder
                headerDescription={(
                    <>
                        {isNotDefined(projectDetailResponse?.project.projectType) && (
                            <div>
                                Please select a project first!
                            </div>
                        )}
                        <NonFieldError
                            error={error?.scenarios}
                        />
                    </>
                )}
                empty={isNotDefined(value.scenarios)
                    || value.scenarios.length === 0}
                emptyMessage={(
                    <GeoJsonFileInput
                        name={undefined}
                        label="Upload Scenarios as GeoJSON"
                        onChange={handleGeoJsonFileChange}
                        hint="It should end with .geojson or .geo.json"
                        disabled={isNotDefined(projectDetailResponse?.project.projectType)}
                    />
                )}
                spacing="lg"
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
                        projectData={projectDetailResponse?.project}
                    />
                ))}
            </Container>
        </PageLayout>
    );
}

export default NewTutorial;
