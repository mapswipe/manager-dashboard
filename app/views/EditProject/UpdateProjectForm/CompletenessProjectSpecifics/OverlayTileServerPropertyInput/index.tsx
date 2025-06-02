import { useContext } from 'react';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import EnumsContext from '#base/context/EnumsContext';
import Container from '#components/Container';
import RadioInput from '#components/RadioInput';
import { OverlayLayerTypeEnum } from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import { PartialTileServerInputFields } from '../../TileServerInput/schema';
import {
    defaultOverlayRasterTileConfigInputValue,
    PartialOverlayRasterTileConfigInputFields,
} from './OverlayRasterTileConfigInput/schema';
import {
    defaultOverlayVectorTileConfigInputValue,
    PartialOverlayVectorTileConfigInputFields,
} from './OverlayVectorTileConfigInput/schema';
import OverlayRasterTileConfigInput from './OverlayRasterTileConfigInput';
import OverlayVectorTileConfigInput from './OverlayVectorTileConfigInput';
import { PartialOverlayTileServerPropertyInputFields } from './schema';

interface Props {
    value: PartialOverlayTileServerPropertyInputFields | undefined | null;
    error: LeafError | ObjectError<PartialOverlayTileServerPropertyInputFields>;
    setFieldValue: (...entries: EntriesAsList<PartialOverlayTileServerPropertyInputFields>) => void;
    disabled?: boolean;
    aoiGeoJsonAssetId?: string;
    baseTileServer: PartialTileServerInputFields | undefined;
    zoomLevel?: number;
}

function OverlayTileServerPropertyInput(props: Props) {
    const {
        value,
        error: formError,
        setFieldValue,
        disabled,
        aoiGeoJsonAssetId,
        baseTileServer,
        zoomLevel,
    } = props;

    const { OverlayLayerTypeEnum: overlayLayerTypeOptions } = useContext(EnumsContext);

    const error = getErrorObject(formError);

    const setRasterTileServerConfigFieldValue = useFormObject<'raster', PartialOverlayRasterTileConfigInputFields>(
        'raster' as const,
        setFieldValue,
        defaultOverlayRasterTileConfigInputValue,
    );

    const setVectorTileServerConfigFieldValue = useFormObject<'vector', PartialOverlayVectorTileConfigInputFields>(
        'vector' as const,
        setFieldValue,
        defaultOverlayVectorTileConfigInputValue,
    );

    return (
        <Container
            heading="Overlay Layer"
            headingLevel={4}
        >
            <RadioInput
                name="type"
                options={overlayLayerTypeOptions}
                keySelector={keySelector}
                labelSelector={labelSelector}
                value={value?.type}
                error={error?.type}
                onChange={setFieldValue}
                disabled={disabled}
            />
            {value?.type === OverlayLayerTypeEnum.RasterTile && (
                <OverlayRasterTileConfigInput
                    value={value?.raster}
                    error={error?.raster}
                    setFieldValue={setRasterTileServerConfigFieldValue}
                    disabled={disabled}
                    aoiGeoJsonAssetId={aoiGeoJsonAssetId}
                />
            )}
            {value?.type === OverlayLayerTypeEnum.VectorTile && (
                <OverlayVectorTileConfigInput
                    label={null}
                    value={value?.vector}
                    error={error?.vector}
                    setFieldValue={setVectorTileServerConfigFieldValue}
                    disabled={disabled}
                    aoiGeometryAssetId={aoiGeoJsonAssetId}
                    baseTileServer={baseTileServer}
                    zoomLevel={zoomLevel}
                />
            )}
        </Container>
    );
}

export default OverlayTileServerPropertyInput;
