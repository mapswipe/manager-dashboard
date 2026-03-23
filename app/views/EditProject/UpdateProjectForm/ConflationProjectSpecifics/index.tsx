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
    type PartialRasterTileServerInputFields,
} from '#components/domain/RasterTileServerInput/schema';

import {
    defaultObjectSourceInputFormValue,
    PartialConflationObjectSourceInputFields,
} from './ObjectSourceInput/schema';
import ObjectSourceInput from './ObjectSourceInput';
import { type PartialConflationSpecificFields } from './schema';

interface Props {
    value: PartialConflationSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialConflationSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialConflationSpecificFields>) => void;
    disabled?: boolean;
}

function ConflationProjectSpecifics(props: Props) {
    const {
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

    const setObjectSourceInputFieldValue = useFormObject<'objectSource', PartialConflationObjectSourceInputFields>(
        'objectSource' as const,
        setFieldValue,
        defaultObjectSourceInputFormValue,
    );

    return (
        <>
            <ObjectSourceInput
                value={value?.objectSource}
                setFieldValue={setObjectSourceInputFieldValue}
                error={error?.objectSource}
            />
            <RasterTileServerInput
                value={value?.tileServerProperty}
                error={error?.tileServerProperty}
                setFieldValue={setTileServerInputFieldValue}
                disabled={disabled}
                zoomLevel={undefined}
            />
        </>
    );
}

export default ConflationProjectSpecifics;
