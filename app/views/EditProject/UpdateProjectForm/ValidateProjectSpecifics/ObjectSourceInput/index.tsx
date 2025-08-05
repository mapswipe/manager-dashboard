import { useContext } from 'react';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import EnumsContext from '#base/context/EnumsContext';
import Container from '#components/Container';
import AssetInput from '#components/domain/AssetInput';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import { ValidateObjectSourceTypeEnum } from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import { PartialValidateObjectSourceInputFields } from './schema';

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

    const {
        ValidateObjectSourceTypeEnum: validateObjectSourceTypeOptions,
    } = useContext(EnumsContext);

    const {
        AoiGeojsonFile,
        ObjectGeojsonUrl,
        TaskingManager,
    } = ValidateObjectSourceTypeEnum;

    return (
        <Container
            heading="Validation Object Source"
            headingLevel={4}
            withPadding
            withBackground
            spacing="lg"
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
                    // TODO(frozenhelium): add proper hint
                    // hint="Upload your project area as GeoJSON File (max. 1MB)
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
                />
            )}
            {value?.sourceType === TaskingManager && (
                <TextInput
                    label="HOT Tasking Manager Project ID"
                    name="taskingManagerProjectId"
                    value={value.taskingManagerProjectId}
                    error={error?.taskingManagerProjectId}
                    onChange={setFieldValue}
                />
            )}
            {(value?.sourceType === AoiGeojsonFile || value?.sourceType === TaskingManager) && (
                <TextInput
                    label="Ohsome filter"
                    name="ohsomeFilter"
                    value={value.ohsomeFilter}
                    error={error?.ohsomeFilter}
                    onChange={setFieldValue}
                />
            )}
        </Container>
    );
}

export default ObjectSourceInput;
