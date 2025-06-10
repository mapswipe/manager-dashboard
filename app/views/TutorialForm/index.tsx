import {
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { CgArrowTopRightR } from 'react-icons/cg';
import { IoAdd } from 'react-icons/io5';
import { MdDownload } from 'react-icons/md';
import {
    generatePath,
    useNavigate,
    useParams,
} from 'react-router';
import {
    _cs,
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
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

import routes from '#base/configs/routes';
import Button from '#components/Button';
import Container from '#components/Container';
import GeoJsonFileInput from '#components/GeoJsonFileInput';
import InlineLayout from '#components/InlineLayout';
import NonFieldError from '#components/NonFieldError';
import PageLayout from '#components/PageLayout';
import SelectInput from '#components/SelectInput';
import TextInput from '#components/TextInput';
import TextOutput from '#components/TextOutput';
import {
    ProjectAssetMimetypeEnum,
    ProjectTypeEnum,
    TutorialCreateInput,
    useNewTutorialMutation,
    useProjectOptionsQuery,
    useProjectOutputAssetsQuery,
    useTutorialDetailsQuery,
    useTutorialProjectDetailQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    idSelector,
    nameSelector,
    projectTypeToKeyMap,
} from '#utils/common';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';

import { PartialInformationPageInputFields } from './InformationPageInput/schema';
import InformationPageInput from './InformationPageInput';
import ScenarioPageInput from './ScenarioPageInput';
import tutorialCreateFormSchema, {
    defaultTutorialCreateFormValue,
    PartialTutorialCreateInputFields,
} from './schema';
import { validateFindTutorialGeoJson } from './utils';

import styles from './styles.module.css';

interface Props {
    className?: string;
}

function NewTutorial(props: Props) {
    const { className } = props;
    const { id: tutorialIdFromParams } = useParams<{ id: string }>();

    const navigate = useNavigate();
    const alert = useAlert();

    const [
        { fetching: createNewTutorialPending },
        createNewTutorial,
    ] = useNewTutorialMutation();

    const [{
        data: projectOptionsResponse,
    }] = useProjectOptionsQuery();

    const [{
        // fetching: tutorialDataPending,
        data: tutorialData,
    }] = useTutorialDetailsQuery({
        variables: { id: tutorialIdFromParams ?? '' },
        pause: isNotDefined(tutorialIdFromParams),
    });

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
        const {
            projectId,
            scenarios,
            ...other
        } = removeNull(tutorial);

        // FIXME: need to add clientId and fix the structure
        setValue({
            project: projectId,
            scenarios: scenarios.map((scenario) => ({
                ...scenario,
                tasks: scenario.tasks.map((task) => ({
                    ...task,
                    projectTypeSpecifics: {
                        find: task.projectTypeSpecifics,
                    },
                })),
            })),
            ...other,
        });
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
            projectId: value.project ?? '',
            pagination: {
                offset: 0,
                limit: 10,
            },
        },
        pause: isNotDefined(value.project),
    });

    const [{
        data: projectDetailResponse,
    }] = useTutorialProjectDetailQuery({
        variables: {
            projectId: value.project ?? '',
        },
        pause: isNotDefined(value.project),
    });

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
        async (submittedValues: PartialTutorialCreateInputFields) => {
            if (isDefined(tutorialIdFromParams)) {
                // eslint-disable-next-line no-console
                console.info('Edit not implemented yet!', submittedValues);
                return;
            }

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
            } catch (apolloError) {
                alertCombinedError(apolloError, alert);
            }
        },
        [navigate, tutorialIdFromParams, createNewTutorial, setError, alert],
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

    const inputsDisabled = createNewTutorialPending;
    const actionsDisabled = inputsDisabled || isDefined(tutorialIdFromParams);

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
                    Submit tutorial
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
                <SelectInput
                    label="Select a project"
                    name="project"
                    hint="Informations like zoom level, tile server, etc will be inherited from the reference project"
                    options={projectOptionsResponse?.projects.results}
                    keySelector={idSelector}
                    labelSelector={nameSelector}
                    value={value.project}
                    onChange={setFieldValue}
                    error={error?.project}
                    disabled={inputsDisabled || isDefined(tutorialIdFromParams)}
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
                            {/* eslint-disable-next-line no-underscore-dangle */}
                            {(projectDetailResponse.project.projectTypeSpecifics?.__typename === 'FindProjectPropertyType'
                                // eslint-disable-next-line no-underscore-dangle
                                || projectDetailResponse.project.projectTypeSpecifics?.__typename === 'CompareProjectPropertyType'
                                // eslint-disable-next-line no-underscore-dangle
                                || projectDetailResponse.project.projectTypeSpecifics?.__typename === 'CompletenessProjectPropertyType'
                            ) && (
                                <TextOutput
                                    label="Zoom level"
                                    value={projectDetailResponse
                                        .project.projectTypeSpecifics?.zoomLevel}
                                />
                            )}
                            <TextOutput
                                label="Tile server"
                                value={projectDetailResponse.project
                                    .projectTypeSpecifics?.tileServerProperty.name}
                            />
                            {/* eslint-disable-next-line no-underscore-dangle */}
                            {(projectDetailResponse.project.projectTypeSpecifics?.__typename === 'CompareProjectPropertyType') && (
                                <TextOutput
                                    label="Tile server B"
                                    value={projectDetailResponse
                                        .project.projectTypeSpecifics?.tileServerBProperty.name}
                                />
                            )}

                            {/* eslint-disable-next-line no-underscore-dangle */}
                            {projectDetailResponse.project.projectTypeSpecifics?.__typename === 'CompletenessProjectPropertyType' && (
                                <TextOutput
                                    label="Overlay Tile"
                                    value={projectDetailResponse
                                        .project.projectTypeSpecifics
                                        ?.overlayTileServerProperty.type}
                                />
                            )}
                        </Container>
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
                                            {projectAsset.mimetype === ProjectAssetMimetypeEnum.Geojson && (
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
