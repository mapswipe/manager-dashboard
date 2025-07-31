import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import RasterTileServerInput from '#components/domain/RasterTileServerInput';
import {
    defaultRasterTileServerInputValue,
    PartialRasterTileServerInputFields,
} from '#components/domain/RasterTileServerInput/schema';
import NumberInput from '#components/NumberInput';

import { PartialOverlayRasterTileConfigInputFields } from './schema';

interface Props {
    aoiGeoJsonAssetId: string | undefined;
    value: PartialOverlayRasterTileConfigInputFields | undefined | null;
    error: LeafError | ObjectError<PartialOverlayRasterTileConfigInputFields>;
    setFieldValue: (...entries: EntriesAsList<PartialOverlayRasterTileConfigInputFields>) => void;
    disabled?: boolean;
}

function OverlayRasterTileConfigInput(props: Props) {
    const {
        value,
        error: formError,
        setFieldValue,
        disabled,
        aoiGeoJsonAssetId,
    } = props;

    const error = getErrorObject(formError);

    const setTileServerInputFieldValue = useFormObject<'tileServer', PartialRasterTileServerInputFields>(
        'tileServer' as const,
        setFieldValue,
        defaultRasterTileServerInputValue,
    );

    return (
        <>
            <NumberInput
                label="Opacity"
                name="opacity"
                value={value?.opacity}
                onChange={setFieldValue}
                error={error?.opacity}
                disabled={disabled}
            />
            <RasterTileServerInput
                value={value?.tileServer}
                error={error?.tileServer}
                setFieldValue={setTileServerInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={aoiGeoJsonAssetId}
            />
        </>
    );
}

export default OverlayRasterTileConfigInput;
