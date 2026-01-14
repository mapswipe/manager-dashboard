import {
    useCallback,
    useContext,
} from 'react';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import { PartialRasterTileServerInputFields } from '#components/domain/RasterTileServerInput/schema';
import RadioInput from '#components/RadioInput';
import EnumsContext from '#contexts/EnumsContext';
import { OverlayLayerTypeEnum } from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

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
    baseTileServer: PartialRasterTileServerInputFields | undefined;
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

    const { overlayLayerTypeOptions } = useContext(EnumsContext);

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

    const handleOverlayLayerTypeChange = useCallback(
        (newType: OverlayLayerTypeEnum | undefined) => {
            setFieldValue(newType, 'type');

            if (newType === OverlayLayerTypeEnum.VectorTile) {
                setFieldValue(
                    (oldValue: PartialOverlayVectorTileConfigInputFields | undefined) => {
                        if (!oldValue) {
                            return defaultOverlayVectorTileConfigInputValue;
                        }

                        return oldValue;
                    },
                    'vector',
                );
            }

            if (newType === OverlayLayerTypeEnum.RasterTile) {
                setFieldValue(
                    (oldValue: PartialOverlayRasterTileConfigInputFields | undefined) => {
                        if (!oldValue) {
                            return defaultOverlayRasterTileConfigInputValue;
                        }

                        return oldValue;
                    },
                    'raster',
                );
            }
        },
        [setFieldValue],
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
                onChange={handleOverlayLayerTypeChange}
                disabled={disabled}
                hint="Select the layer that you want to compare for completeness."
            />
            {value?.type === OverlayLayerTypeEnum.RasterTile && (
                <OverlayRasterTileConfigInput
                    value={value?.raster}
                    error={error?.raster}
                    setFieldValue={setRasterTileServerConfigFieldValue}
                    disabled={disabled}
                    aoiGeoJsonAssetId={aoiGeoJsonAssetId}
                    baseTileServer={baseTileServer}
                    zoomLevel={zoomLevel}
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
