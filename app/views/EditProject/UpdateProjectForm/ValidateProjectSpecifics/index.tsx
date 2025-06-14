import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import RasterTileServerInput from '#components/RasterTileServerInput';
import {
    defaultRasterTileServerInputValue,
    type PartialRasterTileServerInputFields,
} from '#components/RasterTileServerInput/schema';

import {
    defaultObjectSourceInputFormValue,
    PartialValidateObjectSourceInputFields,
} from './ObjectSourceInput/schema';
import ObjectSourceInput from './ObjectSourceInput';
import { type PartialValidateSpecificFields } from './schema';

interface Props {
    projectId: string;
    value: PartialValidateSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialValidateSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialValidateSpecificFields>) => void;
    disabled?: boolean;
}

function ValidateProjectSpecifics(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    const setTileServerInputFieldValue = useFormObject<'tileServerProperty', PartialRasterTileServerInputFields>(
        'tileServerProperty' as const,
        setFieldValue,
        defaultRasterTileServerInputValue,
    );

    const setObjectSourceInputFieldValue = useFormObject<'objectSource', PartialValidateObjectSourceInputFields>(
        'objectSource' as const,
        setFieldValue,
        defaultObjectSourceInputFormValue,
    );

    return (
        <>
            <ObjectSourceInput
                value={value?.objectSource}
                setFieldValue={setObjectSourceInputFieldValue}
                disabled={disabled}
                error={error?.objectSource}
                projectId={projectId}
            />
            <RasterTileServerInput
                value={value?.tileServerProperty}
                error={error?.tileServerProperty}
                setFieldValue={setTileServerInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={value?.objectSource?.aoiGeometry}
            />
        </>
    );
}

export default ValidateProjectSpecifics;
