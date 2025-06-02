import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import TileServerInput from '../TileServerInput';
import {
    defaultTileServerInputValue,
    PartialTileServerInputFields,
} from '../TileServerInput/schema';
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

    const setTileServerInputFieldValue = useFormObject<'tileServerProperty', PartialTileServerInputFields>(
        'tileServerProperty' as const,
        setFieldValue,
        defaultTileServerInputValue,
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
            <TileServerInput
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
