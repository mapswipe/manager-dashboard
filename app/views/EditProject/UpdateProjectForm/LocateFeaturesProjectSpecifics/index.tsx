import { useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import AssetInput from '#components/domain/AssetInput';
import RasterTileServerInput from '#components/domain/RasterTileServerInput';
import {
    defaultRasterTileServerInputValue,
    type PartialRasterTileServerInputFields,
} from '#components/domain/RasterTileServerInput/schema';
import ListLayout from '#components/ListLayout';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import ZoomLevelSelectInput from '#components/ZoomLevelSelectInput';
import EnumsContext from '#contexts/EnumsContext';
import { ProjectAssetInputTypeEnum } from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import { type PartialLocateFeaturesSpecificFields } from './schema';

interface Props {
    projectId: string;
    value: PartialLocateFeaturesSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialLocateFeaturesSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialLocateFeaturesSpecificFields>) => void;
    disabled?: boolean;
}

function LocateFeaturesProjectSpecifics(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const { subGridSizeOptions } = useContext(EnumsContext);

    const error = getErrorObject(formError);

    const setTileServerInputFieldValue = useFormObject<'tileServerProperty', PartialRasterTileServerInputFields>(
        'tileServerProperty' as const,
        setFieldValue,
        defaultRasterTileServerInputValue,
    );

    return (
        <>
            <AssetInput
                label="AOI geometry"
                projectId={projectId}
                name="aoiGeometry"
                onChange={setFieldValue}
                value={value?.aoiGeometry}
                error={error?.aoiGeometry}
                inputType={ProjectAssetInputTypeEnum.AoiGeometry}
                hint="Upload your project area as GeoJSON File"
                disabled={disabled}
                withoutPreview
            />
            <RasterTileServerInput
                value={value?.tileServerProperty}
                error={error?.tileServerProperty}
                setFieldValue={setTileServerInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={value?.aoiGeometry}
                zoomLevel={isDefined(value?.zoomLevel) ? value.zoomLevel : undefined}
            />
            <ZoomLevelSelectInput
                name="zoomLevel"
                value={value?.zoomLevel}
                onChange={setFieldValue}
                error={error?.zoomLevel}
                disabled={disabled}
            />
            <Container
                heading="Subgrid"
                headingLevel={5}
            >
                <RadioInput
                    label="Sub grid Size"
                    name="subGridSize"
                    options={subGridSizeOptions}
                    value={value?.subGridSize}
                    disabled={disabled}
                    onChange={setFieldValue}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    error={error?.subGridSize}
                />
            </Container>
            <Container
                heading="Export Meta"
                headingLevel={5}
            >
                <ListLayout type="grid">
                    <TextInput
                        label="Key"
                        name="exportMetaKey"
                        value={value?.exportMetaKey}
                        onChange={setFieldValue}
                        error={error?.exportMetaKey}
                    />
                    <TextInput
                        label="Value"
                        name="exportMetaValue"
                        value={value?.exportMetaValue}
                        onChange={setFieldValue}
                        error={error?.exportMetaValue}
                    />
                </ListLayout>
            </Container>
        </>
    );
}

export default LocateFeaturesProjectSpecifics;
