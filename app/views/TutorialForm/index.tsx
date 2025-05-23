import {
    useCallback,
    useEffect,
    useMemo,
    useState,
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
    useMutation,
    useQuery,
} from '@apollo/client';
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
    NewTutorialMutation,
    NewTutorialMutationVariables,
    ProjectOptionsQuery,
    ProjectOptionsQueryVariables,
    ProjectOutputAssetsQuery,
    ProjectOutputAssetsQueryVariables,
    TutorialCreateInput,
    TutorialDetailsQuery,
    TutorialDetailsQueryVariables,
    TutorialProjectDetailQuery,
    TutorialProjectDetailQueryVariables,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    idSelector,
    nameSelector,
} from '#utils/common';
import {
    alertApolloError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';

import { PartialInformationPageInputFields } from './InformationPageInput/schema';
import InformationPageInput from './InformationPageInput';
import {
    CREATE_TUTORIAL_MUTATION,
    PROJECT_ASSETS_QUERY,
    PROJECT_DETAIL_QUERY,
    PROJECT_OPTION_QUERY,
    TUTORIAL_QUERY,
} from './query';
import ScenarioPageInput from './ScenarioPageInput';
import tutorialCreateFormSchema, {
    defaultTutorialCreateFormValue,
    PartialTutorialCreateInputFields,
} from './schema';
import {
    FindTutorialGeoJson,
    validateFindTutorialGeoJson,
} from './utils';

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
        createNewTutorial,
        // { loading: createNewTutorialPending },
    ] = useMutation<NewTutorialMutation, NewTutorialMutationVariables>(CREATE_TUTORIAL_MUTATION);

    const {
        data: projectOptionsResponse,
    } = useQuery<ProjectOptionsQuery, ProjectOptionsQueryVariables>(PROJECT_OPTION_QUERY);

    const {
        data: tutorialData,
        // loading: tutorialDataPending,
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
        const {
            projectId,
            ...other
        } = removeNull(tutorial);

        // FIXME: need to add clientId and fix the structure
        setValue({
            project: projectId,
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

    const {
        data: projectAssetsResponse,
    } = useQuery<ProjectOutputAssetsQuery, ProjectOutputAssetsQueryVariables>(
        PROJECT_ASSETS_QUERY,
        {
            variables: isDefined(value.project) ? {
                projectId: value.project,
                pagination: {
                    offset: 0,
                    limit: 10,
                },
            } : undefined,
            skip: isNotDefined(value.project),
        },
    );

    const {
        data: projectDetailResponse,
    } = useQuery<TutorialProjectDetailQuery, TutorialProjectDetailQueryVariables>(
        PROJECT_DETAIL_QUERY,
        {
            variables: isDefined(value.project) ? {
                projectId: value.project,
            } : undefined,
            skip: isNotDefined(value.project),
        },
    );

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

    /*
    const addScenarioPage = useCallback(
        (newScreenId: number) => {
            const newScenarioPage: PartialScenarioPageInputFields = {
                clientId: ulid(),
                scenarioPageNumber: newScreenId,
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
    */

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
                    variables: {
                        data: finalValues,
                    },
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
                alertApolloError(apolloError, alert);
            }
        },
        [navigate, tutorialIdFromParams, createNewTutorial, setError, alert],
    );

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const [
        tutorialTasksGeojson,
        setTutorialTasksGeojson,
    ] = useState<FindTutorialGeoJson | undefined>();

    const handleGeoJsonFileChange = useCallback((geoJson: GeoJSON.GeoJSON | undefined) => {
        if (isNotDefined(geoJson) || !validateFindTutorialGeoJson(geoJson)) {
            setTutorialTasksGeojson(undefined);
            return;
        }

        setTutorialTasksGeojson(geoJson);

        const featuresByScreen = listToGroupList(
            geoJson.features,
            (feature) => feature.properties.screen,
        );

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
                    find: {
                        tileY: feature.properties.tile_y,
                        tileZ: feature.properties.tile_z,
                    },
                },
            })),
        }));

        setFieldValue(scenarioPages, 'scenarios');
    }, [setFieldValue]);

    const scenarioGeoJsonByClientId = useMemo(() => {
        if (isNotDefined(tutorialTasksGeojson)) {
            return undefined;
        }

        return listToMap(
            value.scenarios,
            (scenario) => scenario.clientId,
            (scenario) => ({
                type: 'FeatureCollection' as const,
                features: tutorialTasksGeojson.features.filter(
                    (feature) => feature.properties.screen === scenario.scenarioPageNumber,
                ),
            }),
        );
    }, [value.scenarios, tutorialTasksGeojson]);

    return (
        <PageLayout
            className={_cs(styles.newTutorial, className)}
            heading={isDefined(tutorialIdFromParams) ? 'Update Tutorial' : 'Create a New Tutorial'}
            mainContentClassName={styles.mainContent}
            footerActions={(
                <Button
                    name={undefined}
                    colorVariant="accent"
                    styleVariant="filled"
                    onClick={handleSubmitButtonClick}
                    disabled={isDefined(tutorialIdFromParams)}
                >
                    Submit tutorial
                </Button>
            )}
        >
            <div className={styles.projectSelection}>
                <SelectInput
                    label="Project"
                    name="project"
                    hint="Select a project to get started. Some informations like zoom level, tile server, etc will be inherited from the project"
                    options={projectOptionsResponse?.projects.results}
                    keySelector={idSelector}
                    labelSelector={nameSelector}
                    value={value.project}
                    onChange={setFieldValue}
                    error={error?.project}
                    disabled={isDefined(tutorialIdFromParams)}
                />
            </div>
            {isDefined(projectDetailResponse) && (
                <div className={styles.projectDetails}>
                    <Container
                        heading="Project details"
                        withHeaderBorder
                    >
                        <TextOutput
                            label="Look for"
                            value={projectDetailResponse.project.lookFor}
                        />
                        <TextOutput
                            label="Requesting organization"
                            value={projectDetailResponse.project.requestingOrganization.name}
                        />
                        <TextOutput
                            label="Zoom level"
                            value={projectDetailResponse.project.projectTypeSpecifics?.zoomLevel}
                        />
                        <TextOutput
                            label="Tile server"
                            value={projectDetailResponse.project
                                .projectTypeSpecifics?.tileServerProperty.name}
                        />
                    </Container>
                    <Container
                        heading="Project Assets"
                        withHeaderBorder
                    >
                        {projectAssetsResponse?.projectAssets.results.map((projectAsset) => (
                            <InlineLayout
                                start={(
                                    <a
                                        key={projectAsset.id}
                                        className={styles.projectAssetDownloadLink}
                                        href={`https://geojson.io/#data=data:text/x-url,${encodeURIComponent(projectAsset.file.url)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Preview in geojson.io"
                                    >
                                        <CgArrowTopRightR />
                                    </a>
                                )}
                                end={(
                                    <a
                                        key={projectAsset.id}
                                        className={styles.projectAssetDownloadLink}
                                        href={projectAsset.file.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Download"
                                    >
                                        <MdDownload />
                                    </a>
                                )}
                            >
                                {projectAsset.file.name.replace(/^.*[\\/]/, '')}
                            </InlineLayout>
                        ))}
                    </Container>
                </div>
            )}
            <TextInput
                label="Tutorail title"
                name="name"
                value={value.name}
                onChange={setFieldValue}
                error={error?.name}
            />
            <Container
                heading="Information Pages"
                headingLevel={2}
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
                heading="Scenario Pages"
                headingLevel={2}
                withHeaderBorder
                headerDescription={(
                    <NonFieldError
                        error={error?.scenarios}
                    />
                )}
                empty={isNotDefined(value.scenarios)
                    || value.scenarios.length === 0}
                emptyMessage={(
                    <GeoJsonFileInput
                        name={undefined}
                        label="Upload Scenarios as GeoJSON"
                        value={tutorialTasksGeojson}
                        onChange={handleGeoJsonFileChange}
                        hint="It should end with .geojson or .geo.json"
                    />
                )}
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
                        scenarioGeoJson={scenarioGeoJsonByClientId?.[scenarioPage.clientId]}
                        lookForValue={projectDetailResponse?.project.lookFor}
                        tileServerProperty={projectDetailResponse
                            ?.project.projectTypeSpecifics?.tileServerProperty}
                    />
                ))}
            </Container>
        </PageLayout>
    );
}

export default NewTutorial;
