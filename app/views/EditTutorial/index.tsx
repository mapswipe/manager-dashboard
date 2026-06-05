import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    PiFloppyDisk,
    PiPlus,
} from 'react-icons/pi';
import { useParams } from 'react-router';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    nonFieldError,
    removeNull,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';
import { type } from 'arktype';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container';
import GeoJsonFileInput from '#components/domain/GeoJsonFileInput';
import ProjectAssetsList from '#components/domain/ProjectAssetsList';
import ProjectSpecificDetails from '#components/domain/ProjectSpecificDetails';
import FileInput from '#components/FileInput';
import NonFieldError from '#components/NonFieldError';
import PageLayout from '#components/PageLayout';
import TextInput from '#components/TextInput';
import TextOutput from '#components/TextOutput';
import {
    ProjectTypeEnum,
    TutorialUpdateInput,
    useTutorialDetailsQuery,
    useTutorialProjectDetailQuery,
    useUpdateTutorialMutation,
    ValidateImageTutorialTaskPropertyInput,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import { readFileAsText } from '#utils/common';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';
import { CocoType } from '#utils/validation';

import { PartialInformationPageInputFields } from './InformationPageInput/schema';
import InformationPageInput from './InformationPageInput';
import ScenarioPageInput from './ScenarioPageInput';
import tutorialUpdateSchema, {
    PartialTutorialUpdateInputFields,
    TutorialFormContext,
} from './schema';
import TutorialActions from './TutorialActions';
import {
    getValidReferenceValues,
    transformCompareGeoJson,
    transformCompletenessGeoJson,
    transformFindGeoJson,
    transformLocateGeoJson,
    transformStreetGeoJson,
    transformValidateGeoJson,
    TutorialGeoJsonTransformResult,
} from './utils';

import styles from './styles.module.css';

// FIXME: move this to utils
function stringifyId(value: undefined): undefined
function stringifyId(value: number): string
function stringifyId(value: number | undefined): string | undefined
function stringifyId(value: number | undefined) {
    if (isNotDefined(value)) {
        return value;
    }
    return String(value);
}

const ValidateImageJsonType = CocoType;

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

function NewTutorial() {
    const { id: tutorialIdFromParams } = useParams<{ id: string }>();
    const [tutorialFormContext, setTutorialFormContext] = useState<TutorialFormContext>();
    const inputId = useId();

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
        pristine,
        setPristine,
    } = useForm(
        tutorialUpdateSchema,
        { value: defaultTutorialCreateFormValue },
        tutorialFormContext,
    );

    useEffect(() => {
        if (isNotDefined(tutorialData)) {
            return;
        }

        const { tutorial } = tutorialData;
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            projectId,
            scenarios,
            informationPages,
            ...other
        } = removeNull(tutorial, []);

        const transformedTutorial: PartialTutorialUpdateInputFields = {
            // project: projectId,
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

                    // eslint-disable-next-line no-underscore-dangle
                    if (task.projectTypeSpecifics?.__typename === 'StreetTutorialTaskPropertyType') {
                        return {
                            ...task,
                            projectTypeSpecifics: {
                                street: task.projectTypeSpecifics,
                            },
                        };
                    }

                    // eslint-disable-next-line no-underscore-dangle
                    if (task.projectTypeSpecifics?.__typename === 'LocateTutorialTaskPropertyType') {
                        return {
                            ...task,
                            projectTypeSpecifics: {
                                locate: task.projectTypeSpecifics,
                            },
                        };
                    }

                    task.projectTypeSpecifics satisfies undefined;

                    return { ...task };
                }),
            })),
            informationPages: informationPages.map((informationPage) => ({
                ...informationPage,
                blocks: informationPage.blocks.map((block) => {
                    const {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        image,
                        imageId,
                        ...blockProperties
                    } = block;

                    return {
                        ...blockProperties,
                        image: imageId,
                    };
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
                setPristine(false);
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
            setPristine,
        ],
    );

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const handleGeoJsonFileChange = useCallback((geoJson: GeoJSON.GeoJSON | undefined) => {
        if (isNotDefined(projectDetailResponse) || isNotDefined(geoJson)) {
            return;
        }

        const {
            projectType,
            projectTypeSpecifics,
        } = projectDetailResponse.project;

        if (projectType === ProjectTypeEnum.ValidateImage) {
            return;
        }

        let result: TutorialGeoJsonTransformResult | undefined;

        if (projectType === ProjectTypeEnum.Validate) {
            // eslint-disable-next-line no-underscore-dangle
            const validReferenceValues = projectTypeSpecifics?.__typename === 'ValidateProjectPropertyType'
                ? getValidReferenceValues(projectTypeSpecifics.customOptions)
                : [];

            result = transformValidateGeoJson(geoJson, validReferenceValues);
        } else if (projectType === ProjectTypeEnum.Find) {
            result = transformFindGeoJson(geoJson);
        } else if (projectType === ProjectTypeEnum.Compare) {
            result = transformCompareGeoJson(geoJson);
        } else if (projectType === ProjectTypeEnum.Completeness) {
            result = transformCompletenessGeoJson(geoJson);
        } else if (projectType === ProjectTypeEnum.Street) {
            // eslint-disable-next-line no-underscore-dangle
            const validReferenceValues = projectTypeSpecifics?.__typename === 'StreetProjectPropertyType'
                ? getValidReferenceValues(projectTypeSpecifics.customOptions)
                : [];

            result = transformStreetGeoJson(geoJson, validReferenceValues);
        } else if (projectType === ProjectTypeEnum.Locate) {
            // eslint-disable-next-line no-underscore-dangle
            const isLocateProperty = projectTypeSpecifics?.__typename === 'LocateProjectPropertyType';
            const subgridSize = isLocateProperty
                ? projectTypeSpecifics.subGridSize
                : undefined;
            const validReferenceValues = isLocateProperty
                ? getValidReferenceValues(projectTypeSpecifics.customOptions)
                : [];

            result = transformLocateGeoJson(geoJson, subgridSize, validReferenceValues);
        } else {
            projectType satisfies never;
        }

        if (isNotDefined(result)) {
            return;
        }

        if (!result.ok) {
            setError({
                scenarios: {
                    [nonFieldError]: result.error,
                },
            });
            return;
        }

        setFieldValue(result.scenarioPages, 'scenarios');
    }, [projectDetailResponse, setError, setFieldValue]);

    const handleDatasetFileSelect = useCallback(async (file: File | undefined) => {
        if (isDefined(file)) {
            try {
                const fileContentText = await readFileAsText(file);
                const jsonContent = JSON.parse(fileContentText);

                const result = ValidateImageJsonType(jsonContent);

                if (result instanceof type.errors) {
                    alert.show('Failed to validate the dataset', {
                        variant: 'danger',
                        description: result.summary,
                    });
                } else {
                    const annotationsMapping = listToGroupList(
                        result.annotations ?? [],
                        ({ image_id }) => image_id,
                    );

                    let scenarioPageNumber = 0;

                    const scenarioPages = result.images.flatMap((image) => {
                        const url = image.coco_url ?? image.flickr_url;
                        if (isNotDefined(url)) {
                            return undefined;
                        }

                        const annotations = annotationsMapping[image.id];

                        if (isNotDefined(annotations)) {
                            scenarioPageNumber += 1;

                            return [{
                                clientId: ulid(),
                                scenarioPageNumber,
                                tasks: [{
                                    clientId: ulid(),
                                    reference: 1,
                                    projectTypeSpecifics: {
                                        validateImage: {
                                            imageId: stringifyId(image.id),
                                            fileName: image.file_name,
                                            url,
                                            width: image.width,
                                            height: image.height,
                                        } satisfies ValidateImageTutorialTaskPropertyInput,
                                    },
                                }],
                            }];
                        }

                        return annotations.map((annotation) => {
                            scenarioPageNumber += 1;

                            return {
                                clientId: ulid(),
                                scenarioPageNumber,
                                tasks: [{
                                    clientId: ulid(),
                                    // FIXME: This is not always correct
                                    reference: 1,
                                    projectTypeSpecifics: {
                                        validateImage: {
                                            imageId: stringifyId(image.id),
                                            fileName: image.file_name,
                                            url,
                                            width: image.width,
                                            height: image.height,
                                            annotation: {
                                                id: stringifyId(annotation.id),
                                                bbox: annotation.bbox,
                                                imageId: stringifyId(annotation.image_id),
                                                // area: annotation.area,
                                                // categoryId: annotation.category_id,
                                                // iscrowd: annotation.iscrowd,
                                            },
                                        } satisfies ValidateImageTutorialTaskPropertyInput,
                                    },
                                }],
                            };
                        });
                    }).filter(isDefined);

                    setFieldValue(scenarioPages, 'scenarios');
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                alert.show('Failed to read the file', {
                    variant: 'danger',
                });
            }
        }
    }, [alert, setFieldValue]);

    const inputsDisabled = updateTutorialPending;
    const actionsDisabled = inputsDisabled;

    if (isNotDefined(tutorialIdFromParams)) {
        // eslint-disable-next-line no-console
        console.error('Tutorial id not defined in params');
        return null;
    }

    return (
        <PageLayout
            className={styles.newTutorial}
            heading={isDefined(tutorialIdFromParams) ? 'Update Tutorial' : 'Create a New Tutorial'}
            headerActions={tutorialData && (
                <TutorialActions
                    tutorialId={tutorialData.tutorial.id}
                    clientId={tutorialData.tutorial.clientId}
                    status={tutorialData.tutorial.status}
                />
            )}
            footerActions={(
                <Button
                    name={undefined}
                    colorVariant="accent"
                    styleVariant="filled"
                    onClick={handleSubmitButtonClick}
                    disabled={actionsDisabled}
                    start={<PiFloppyDisk />}
                >
                    Update tutorial
                </Button>
            )}
            confirmNavigationChange={!pristine}
        >
            <Container
                heading="General"
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
                withContentBackgroundAndPadding
                spacing="lg"
            >
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
                            projectDetail={projectDetailResponse}
                        />
                    </>
                )}
            </Container>
            <Container
                withContentBackgroundAndPadding
                heading="Information Pages"
                headerDescription={(
                    <NonFieldError
                        error={error?.informationPages}
                    />
                )}
                headerActions={(
                    <Button
                        className={styles.addPageButton}
                        name={value.informationPages?.length ?? 0}
                        onClick={addInformationPage}
                        start={<PiPlus />}
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
                        projectInstruction={projectDetailResponse?.project.projectInstruction}
                        tutorialId={tutorialIdFromParams}
                    />
                ))}
            </Container>
            <Container
                heading="Scenario Pages"
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
                withContentBackgroundAndPadding={isNotDefined(value.scenarios)
                    || value.scenarios.length === 0}
                empty={isNotDefined(value.scenarios)
                    || value.scenarios.length === 0}
                // eslint-disable-next-line max-len
                emptyMessage={projectDetailResponse?.project.projectType === ProjectTypeEnum.ValidateImage
                    ? (
                        <FileInput
                            inputId={inputId}
                            name={undefined}
                            value={undefined}
                            onChange={handleDatasetFileSelect}
                            selectButtonLabel="Select a COCO file"
                            withoutStatus
                            accept=".json"
                        />
                    ) : (
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
