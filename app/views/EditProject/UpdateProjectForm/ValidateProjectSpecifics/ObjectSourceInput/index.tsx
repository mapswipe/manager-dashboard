import {
    useCallback,
    useContext,
    useState,
} from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import Alert from '#components/Alert';
import Container from '#components/Container';
import AssetInput from '#components/domain/AssetInput';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import EnumsContext from '#contexts/EnumsContext';
import {
    ProjectAssetInputTypeEnum,
    ValidateObjectSourceTypeEnum,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    formatNumber,
    keySelector,
    labelSelector,
} from '#utils/common';

import { PartialValidateObjectSourceInputFields } from './schema';
import TestAoiObjectsButton from './TestAoiObjectsButton';
import TestObjectGeojsonUrlButton from './TestObjectGeojsonUrlButton';
import TestTaskingManagerProjectButton from './TestTaskingManagerProjectButton';
import { type ObjectSourceTestResult } from './utils';

interface Props {
    value: PartialValidateObjectSourceInputFields | undefined,
    error: LeafError | ObjectError<PartialValidateObjectSourceInputFields>,
    setFieldValue: (...entries: EntriesAsList<PartialValidateObjectSourceInputFields>) => void;
    disabled?: boolean;
    projectId: string;
}

function ObjectSourceInput(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);
    const alert = useAlert();

    const {
        validateObjectSourceTypeOptions,
    } = useContext(EnumsContext);

    const {
        AoiGeojsonFile,
        ObjectGeojsonUrl,
        TaskingManager,
    } = ValidateObjectSourceTypeEnum;

    const sourceType = value?.sourceType;

    // NOTE: A Tasking Manager or GeoJSON URL source gets its AOI from its test
    const isAoiFromTest = sourceType === TaskingManager || sourceType === ObjectGeojsonUrl;

    const [testPending, setTestPending] = useState(false);
    const inputsDisabled = disabled || testPending;

    const handleTestComplete = useCallback((result: ObjectSourceTestResult) => {
        if (!result.ok) {
            alert.show('Failed to validate AOI', {
                variant: 'danger',
                description: result.message,
            });
            return;
        }
        if (isAoiFromTest) {
            setFieldValue(result.aoiGeometry, 'aoiGeometry');
        }
        alert.show(
            `AOI is valid. It contains ${formatNumber(result.objectCount)} object(s)`,
            { variant: 'success' },
        );
    }, [alert, isAoiFromTest, setFieldValue]);

    const handleSourceTypeChange = useCallback((newSourceType: ValidateObjectSourceTypeEnum) => {
        if (newSourceType === sourceType) {
            return;
        }
        setFieldValue(newSourceType, 'sourceType');
        setFieldValue(undefined, 'aoiGeometry');
    }, [sourceType, setFieldValue]);

    // NOTE: The tested AOI no longer applies once its source changes
    const handleTestedSourceChange = useCallback((
        ...entries: EntriesAsList<PartialValidateObjectSourceInputFields>
    ) => {
        setFieldValue(...entries);
        if (isAoiFromTest) {
            setFieldValue(undefined, 'aoiGeometry');
        }
    }, [isAoiFromTest, setFieldValue]);

    return (
        <Container
            heading="Validation Object Source"
            headingLevel={4}
            headerDescription={isAoiFromTest && isDefined(error?.aoiGeometry) && (
                <Alert
                    name="object-source-aoi-error"
                    type="danger"
                    title={error.aoiGeometry}
                    fullWidth
                    withoutShadow
                />
            )}
            footerActions={(
                <>
                    {sourceType === AoiGeojsonFile && (
                        <TestAoiObjectsButton
                            projectId={projectId}
                            aoiGeometry={value?.aoiGeometry}
                            ohsomeFilter={value?.ohsomeFilter}
                            disabled={disabled}
                            onPendingChange={setTestPending}
                            onTestComplete={handleTestComplete}
                        />
                    )}
                    {sourceType === ObjectGeojsonUrl && (
                        <TestObjectGeojsonUrlButton
                            projectId={projectId}
                            objectGeojsonUrl={value?.objectGeojsonUrl}
                            disabled={disabled}
                            onPendingChange={setTestPending}
                            onTestComplete={handleTestComplete}
                        />
                    )}
                    {sourceType === TaskingManager && (
                        <TestTaskingManagerProjectButton
                            projectId={projectId}
                            taskingManagerProjectId={value?.taskingManagerProjectId}
                            ohsomeFilter={value?.ohsomeFilter}
                            disabled={disabled}
                            onPendingChange={setTestPending}
                            onTestComplete={handleTestComplete}
                        />
                    )}
                </>
            )}
        >
            <RadioInput
                label="Source type"
                name="sourceType"
                options={validateObjectSourceTypeOptions}
                value={sourceType}
                onChange={handleSourceTypeChange}
                keySelector={keySelector}
                labelSelector={labelSelector}
                error={error?.sourceType}
                disabled={inputsDisabled}
            />

            {sourceType === AoiGeojsonFile && (
                <AssetInput
                    label="AOI geometry"
                    projectId={projectId}
                    name="aoiGeometry"
                    onChange={handleTestedSourceChange}
                    value={value?.aoiGeometry}
                    error={error?.aoiGeometry}
                    inputType={ProjectAssetInputTypeEnum.AoiGeometry}
                    hint="Upload your project area as GeoJSON File (max. 1MB). Make sure that you provide a single polygon geometry."
                    disabled={inputsDisabled}
                    withoutPreview
                />
            )}
            {sourceType === ObjectGeojsonUrl && (
                <TextInput
                    label="URL for geojson"
                    name="objectGeojsonUrl"
                    value={value?.objectGeojsonUrl}
                    error={error?.objectGeojsonUrl}
                    onChange={handleTestedSourceChange}
                    hint="Provide a direct link to a GeoJSON file containing your building footprint geometries."
                    disabled={inputsDisabled}
                />
            )}
            {sourceType === TaskingManager && (
                <TextInput
                    label="HOT Tasking Manager Project ID"
                    name="taskingManagerProjectId"
                    value={value?.taskingManagerProjectId}
                    error={error?.taskingManagerProjectId}
                    onChange={handleTestedSourceChange}
                    hint="Provide the ID of a HOT Tasking Manager Project (only numbers, e.g. 6526)."
                    disabled={inputsDisabled}
                />
            )}
            {(sourceType === AoiGeojsonFile || sourceType === TaskingManager) && (
                <TextInput
                    label="Ohsome filter"
                    name="ohsomeFilter"
                    value={value?.ohsomeFilter}
                    error={error?.ohsomeFilter}
                    onChange={handleTestedSourceChange}
                    hint="Please specify which objects should be included in your project."
                    disabled={inputsDisabled}
                />
            )}
        </Container>
    );
}

export default ObjectSourceInput;
