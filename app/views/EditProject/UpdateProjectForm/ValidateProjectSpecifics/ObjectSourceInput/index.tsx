import {
    useContext,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';
import { gql } from 'urql';

import Alert from '#components/Alert';
import Button from '#components/Button';
import Container from '#components/Container';
import AssetInput from '#components/domain/AssetInput';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import EnumsContext from '#contexts/EnumsContext';
import {
    ProjectAssetInputTypeEnum,
    useTestAoiObjectsQuery,
    useTestTaskingManagerProjectQuery,
    ValidateObjectSourceTypeEnum,
} from '#generated/types/graphql';
import {
    formatNumber,
    keySelector,
    labelSelector,
} from '#utils/common';

import { PartialValidateObjectSourceInputFields } from './schema';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_AOI_OBJECTS_QUERY = gql`
query TestAoiObjects($assetId: ID, $projectId: ID, $ohsomeFilter: String) {
    testAoiObjects(assetId: $assetId, projectId: $projectId, ohsomeFilter: $ohsomeFilter) {
        ok
        error
        objectCount
        assetId
        projectId
        ohsomeFilter
    }
}
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_TASKING_MANAGER_PROJECT_QUERY = gql`
query TestTaskingManagerProject($hotTmId: String, $ohsomeFilter: String) {
    testTaskingManagerProject(hotTmId: $hotTmId, ohsomeFilter: $ohsomeFilter) {
        ok
        error
        objectCount
        hotTmId
        ohsomeFilter
    }
}
`;

interface Props {
    value: PartialValidateObjectSourceInputFields | undefined,
    error: LeafError | ObjectError<PartialValidateObjectSourceInputFields>,
    setFieldValue: (...entries: EntriesAsList<PartialValidateObjectSourceInputFields>) => void;
    disabled?: boolean;
    projectId: string;
    // aoiGeoJsonAssetId?: string;
}

function ObjectSourceInput(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
        // aoiGeoJsonAssetId,
    } = props;

    const error = getErrorObject(formError);

    const [
        {
            data: testAoiObjectsResponse,
            fetching: testAoiObjectsPending,
            error: testAoiObjectsError,
        },
        triggerTestAoiObjects,
    ] = useTestAoiObjectsQuery({
        variables: {
            projectId,
            assetId: value?.aoiGeometry,
            ohsomeFilter: value?.ohsomeFilter,
        },
        pause: true,
    });

    const [
        {
            data: testTaskingManagerProjectResponse,
            fetching: testTaskingManagerProjectPending,
            error: testTaskingManagerProjectError,
        },
        triggerTestTaskingManagerProject,
    ] = useTestTaskingManagerProjectQuery({
        variables: {
            hotTmId: value?.taskingManagerProjectId,
            ohsomeFilter: value?.ohsomeFilter,
        },
        pause: true,
    });

    const {
        validateObjectSourceTypeOptions,
    } = useContext(EnumsContext);

    const {
        AoiGeojsonFile,
        ObjectGeojsonUrl,
        TaskingManager,
    } = ValidateObjectSourceTypeEnum;

    const headerDescription = useMemo(() => {
        if (isNotDefined(value?.sourceType)) {
            return null;
        }

        if (value.sourceType === AoiGeojsonFile) {
            if (isDefined(testAoiObjectsError)) {
                return (
                    <Alert
                        name="test-aoi-message"
                        type="danger"
                        title="Failed to validate AOI"
                        description={testAoiObjectsError.message}
                        fullWidth
                        withoutShadow
                    />
                );
            }

            if (isNotDefined(testAoiObjectsResponse)) {
                return null;
            }

            const {
                testAoiObjects: {
                    ok,
                    error: testError,
                    objectCount,
                    assetId,
                    ohsomeFilter,
                },
            } = testAoiObjectsResponse;

            if (assetId !== value.aoiGeometry || ohsomeFilter !== value.ohsomeFilter) {
                return null;
            }

            return (
                <Alert
                    name="test-aoi-message"
                    type={ok ? 'success' : 'danger'}
                    title={ok
                        ? `AOI is valid. It contains ${formatNumber(objectCount)} object(s)`
                        : 'Failed to validate AOI'}
                    description={testError}
                    fullWidth
                    withoutShadow
                />
            );
        }

        if (value.sourceType === TaskingManager) {
            if (isDefined(testTaskingManagerProjectError)) {
                return (
                    <Alert
                        name="test-tasking-manager-project-message"
                        type="danger"
                        title="Failed to validate project AOI"
                        description={testTaskingManagerProjectError.message}
                        fullWidth
                        withoutShadow
                    />
                );
            }
            if (isNotDefined(testTaskingManagerProjectResponse)) {
                return null;
            }

            const {
                testTaskingManagerProject: {
                    ok,
                    error: testError,
                    objectCount,
                    hotTmId,
                    ohsomeFilter,
                },
            } = testTaskingManagerProjectResponse;

            if (hotTmId !== value.taskingManagerProjectId || ohsomeFilter !== value.ohsomeFilter) {
                return null;
            }

            return (
                <Alert
                    name="test-tasking-manager-project-message"
                    type={ok ? 'success' : 'danger'}
                    title={ok
                        ? `Project is valid. It contains ${formatNumber(objectCount)} object(s)`
                        : 'Failed to validate project AOI'}
                    description={testError}
                    fullWidth
                    withoutShadow
                />
            );
        }

        return null;
    }, [
        AoiGeojsonFile,
        TaskingManager,
        testAoiObjectsResponse,
        testAoiObjectsError,
        testTaskingManagerProjectResponse,
        testTaskingManagerProjectError,
        value?.sourceType,
        value?.taskingManagerProjectId,
        value?.ohsomeFilter,
        value?.aoiGeometry,
    ]);

    const actions = useMemo(() => {
        if (isNotDefined(value?.sourceType)) {
            return null;
        }

        if (value.sourceType === AoiGeojsonFile) {
            if (isNotDefined(value?.aoiGeometry) || isNotDefined(value.ohsomeFilter)) {
                return null;
            }

            return (
                <Button
                    name={undefined}
                    onClick={triggerTestAoiObjects}
                    disabled={testAoiObjectsPending}
                >
                    {testAoiObjectsPending ? 'Testing AOI on ohsome...' : 'Test AOI on ohsome'}
                </Button>
            );
        }

        if (value.sourceType === TaskingManager) {
            if (isNotDefined(value.taskingManagerProjectId) || isNotDefined(value.ohsomeFilter)) {
                return null;
            }

            return (
                <Button
                    name={undefined}
                    onClick={triggerTestTaskingManagerProject}
                    disabled={testTaskingManagerProjectPending}
                >
                    {testTaskingManagerProjectPending
                        ? 'Testing Tasking Manager project AOI on ohsome...'
                        : 'Test Tasking Manager project AOI on ohsome'}
                </Button>
            );
        }

        return null;
    }, [
        AoiGeojsonFile,
        TaskingManager,
        testAoiObjectsPending,
        testTaskingManagerProjectPending,
        triggerTestAoiObjects,
        triggerTestTaskingManagerProject,
        value?.aoiGeometry,
        value?.ohsomeFilter,
        value?.sourceType,
        value?.taskingManagerProjectId,
    ]);

    return (
        <Container
            heading="Validation Object Source"
            headingLevel={4}
            headerDescription={headerDescription}
            footerActions={actions}
        >
            <RadioInput
                label="Source type"
                name="sourceType"
                options={validateObjectSourceTypeOptions}
                value={value?.sourceType}
                onChange={setFieldValue}
                keySelector={keySelector}
                labelSelector={labelSelector}
                error={error?.sourceType}
                disabled={disabled}
            />

            {value?.sourceType === AoiGeojsonFile && (
                <AssetInput
                    label="AOI geometry"
                    projectId={projectId}
                    name="aoiGeometry"
                    onChange={setFieldValue}
                    value={value.aoiGeometry}
                    error={error?.aoiGeometry}
                    inputType={ProjectAssetInputTypeEnum.AoiGeometry}
                    hint="Upload your project area as GeoJSON File (max. 1MB). Make sure that you provide a single polygon geometry."
                    disabled={disabled}
                    withoutPreview
                />
            )}
            {value?.sourceType === ObjectGeojsonUrl && (
                <TextInput
                    label="URL for geojson"
                    name="objectGeojsonUrl"
                    value={value.objectGeojsonUrl}
                    error={error?.objectGeojsonUrl}
                    onChange={setFieldValue}
                    hint="Provide a direct link to a GeoJSON file containing your building footprint geometries."
                />
            )}
            {value?.sourceType === TaskingManager && (
                <TextInput
                    label="HOT Tasking Manager Project ID"
                    name="taskingManagerProjectId"
                    value={value.taskingManagerProjectId}
                    error={error?.taskingManagerProjectId}
                    onChange={setFieldValue}
                    hint="Provide the ID of a HOT Tasking Manager Project (only numbers, e.g. 6526)."
                />
            )}
            {(value?.sourceType === AoiGeojsonFile || value?.sourceType === TaskingManager) && (
                <TextInput
                    label="Ohsome filter"
                    name="ohsomeFilter"
                    value={value.ohsomeFilter}
                    error={error?.ohsomeFilter}
                    onChange={setFieldValue}
                    hint="Please specify which objects should be included in your project."
                />
            )}
        </Container>
    );
}

export default ObjectSourceInput;
