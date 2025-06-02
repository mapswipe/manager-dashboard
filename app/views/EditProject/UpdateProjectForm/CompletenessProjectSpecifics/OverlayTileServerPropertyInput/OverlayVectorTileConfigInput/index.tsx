import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import SelectInput from '#components/SelectInput';
import {
    colorOptions,
    labelSelector,
    lineWidthOptions,
    opacityOptions,
    valueSelector,
} from '#utils/common';
import { PartialTileServerInputFields } from '#views/EditProject/UpdateProjectForm/TileServerInput/schema';

import {
    defaultVectorTileServerInputValue,
    PartialVectorTileServerInputFields,
} from './VectorTileServerInput/schema';
import { PartialOverlayVectorTileConfigInputFields } from './schema';
import VectorTilePreview from './VectorTilePreview';
import VectorTileServerInput from './VectorTileServerInput';

interface Props {
    label?: React.ReactNode;
    value: PartialOverlayVectorTileConfigInputFields | undefined;
    error: LeafError | ObjectError<PartialOverlayVectorTileConfigInputFields>;
    setFieldValue: (...entries: EntriesAsList<PartialOverlayVectorTileConfigInputFields>) => void;
    disabled?: boolean;
    baseTileServer: PartialTileServerInputFields | undefined;
    aoiGeometryAssetId?: string;
    zoomLevel?: number;
}

function OverlayVectorTileConfigInput(props: Props) {
    const {
        label = 'Vector Tile Server',
        value,
        error: formError,
        setFieldValue,
        disabled,
        baseTileServer,
        aoiGeometryAssetId,
        zoomLevel,
    } = props;

    const error = getErrorObject(formError);

    const setVectorTileServerFieldValue = useFormObject<'tileServer', PartialVectorTileServerInputFields>(
        'tileServer',
        setFieldValue,
        defaultVectorTileServerInputValue,
    );

    return (
        <Container
            heading={label}
            headingLevel={4}
        >
            <ListLayout
                layout="grid"
                numPreferredGridColumns={2}
            >
                {/*
                <NumberInput
                    name="circleRadius"
                    label="Circle Radius"
                    value={value?.circleRadius}
                    error={error?.circleRadius}
                    disabled={disabled}
                    onChange={setFieldValue}
                />
                <SelectInput
                    name="circleColor"
                    label="Circle Color"
                    options={colorOptions}
                    keySelector={valueSelector}
                    labelSelector={labelSelector}
                    value={value?.circleColor}
                    error={error?.circleColor}
                    disabled={disabled}
                    onChange={setFieldValue}
                />
                <NumberInput
                    name="circleOpacity"
                    label="Circle Opacity"
                    value={value?.circleOpacity}
                    error={error?.circleOpacity}
                    disabled={disabled}
                    onChange={setFieldValue}
                />
                */}
                <SelectInput
                    name="lineColor"
                    label="Line Color"
                    options={colorOptions}
                    keySelector={valueSelector}
                    labelSelector={labelSelector}
                    value={value?.lineColor}
                    error={error?.lineColor}
                    disabled={disabled}
                    onChange={setFieldValue}
                />
                <SelectInput
                    name="lineOpacity"
                    label="Line Opacity"
                    options={opacityOptions}
                    keySelector={valueSelector}
                    labelSelector={labelSelector}
                    value={value?.lineOpacity}
                    error={error?.lineOpacity}
                    disabled={disabled}
                    onChange={setFieldValue}
                />
                <SelectInput
                    name="lineWidth"
                    label="Line Width"
                    options={lineWidthOptions}
                    keySelector={valueSelector}
                    labelSelector={labelSelector}
                    value={value?.lineWidth}
                    error={error?.lineWidth}
                    disabled={disabled}
                    onChange={setFieldValue}
                />
                <SelectInput
                    name="fillColor"
                    label="Fill Color"
                    options={colorOptions}
                    keySelector={valueSelector}
                    labelSelector={labelSelector}
                    value={value?.fillColor}
                    error={error?.fillColor}
                    disabled={disabled}
                    onChange={setFieldValue}
                />
                <SelectInput
                    name="fillOpacity"
                    label="Fill Opacity"
                    options={opacityOptions}
                    keySelector={valueSelector}
                    labelSelector={labelSelector}
                    value={value?.fillOpacity}
                    error={error?.fillOpacity}
                    disabled={disabled}
                    onChange={setFieldValue}
                />
            </ListLayout>
            <ListLayout
                layout="grid"
            >
                <VectorTileServerInput
                    value={value?.tileServer}
                    error={error?.tileServer}
                    setFieldValue={setVectorTileServerFieldValue}
                    disabled={disabled}
                />
                <VectorTilePreview
                    vectorTileConfig={value}
                    baseTileServer={baseTileServer}
                    aoiGeometryAssetId={aoiGeometryAssetId}
                    zoomLevel={zoomLevel}
                />
            </ListLayout>
        </Container>
    );
}

export default OverlayVectorTileConfigInput;
