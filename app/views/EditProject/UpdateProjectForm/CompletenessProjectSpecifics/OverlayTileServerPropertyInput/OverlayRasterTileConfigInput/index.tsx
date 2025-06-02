import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import NumberInput from '#components/NumberInput';
import TileServerInput from '#views/EditProject/UpdateProjectForm/TileServerInput';
import {
    defaultTileServerInputValue,
    PartialTileServerInputFields,
} from '#views/EditProject/UpdateProjectForm/TileServerInput/schema';

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

    const setTileServerInputFieldValue = useFormObject<'tileServer', PartialTileServerInputFields>(
        'tileServer' as const,
        setFieldValue,
        defaultTileServerInputValue,
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
            <TileServerInput
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
