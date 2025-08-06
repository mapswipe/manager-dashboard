import { useCallback } from 'react';
import { IoAdd } from 'react-icons/io5';
import { isNotDefined } from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Container from '#components/Container';
import CustomOptionInput from '#components/domain/CustomOptionInput';
import { PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema';
import RasterTileServerInput from '#components/domain/RasterTileServerInput';
import {
    defaultRasterTileServerInputValue,
    type PartialRasterTileServerInputFields,
} from '#components/domain/RasterTileServerInput/schema';
import NonFieldError from '#components/NonFieldError';

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

    const {
        setValue: setCustomOptionValue,
        removeValue: removeCustomOption,
    } = useFormArray(
        'customOptions' as const,
        setFieldValue,
    );

    const addCustomOption = useCallback((newCustomOptionIndex: number) => {
        const newCustomOption: PartialCustomOptionInputFields = {
            clientId: ulid(),
            value: newCustomOptionIndex,
        };

        setFieldValue(
            (oldValue: PartialCustomOptionInputFields[] | undefined) => (
                [...(oldValue ?? []), newCustomOption]
            ),
            'customOptions' as const,
        );
    }, [setFieldValue]);

    return (
        <>
            <Container
                withBackground
                withPadding
                headingLevel={4}
                heading="Result options"
                spacing="lg"
                headerActions={(
                    <Button
                        name={value?.customOptions?.length ?? 0}
                        onClick={addCustomOption}
                        styleVariant="transparent"
                        start={<IoAdd />}
                        withoutPadding
                    >
                        Add option
                    </Button>
                )}
                headerDescription={(
                    <NonFieldError error={error?.customOptions} />
                )}
                empty={isNotDefined(value?.customOptions) || value.customOptions.length === 0}
            >
                {value?.customOptions?.map((customOption, optionIndex) => (
                    <CustomOptionInput
                        key={customOption.clientId}
                        index={optionIndex}
                        value={customOption}
                        onChange={setCustomOptionValue}
                        error={getErrorObject(
                            getErrorObject(error?.customOptions)?.[customOption.clientId],
                        )}
                        onRemove={removeCustomOption}
                    />
                ))}
            </Container>
            <ObjectSourceInput
                value={value?.objectSource}
                setFieldValue={setObjectSourceInputFieldValue}
                disabled={disabled}
                error={error?.objectSource}
                projectId={projectId}
            />
            <RasterTileServerInput
                withContainerBackground
                withContainerPadding
                containerSpacing="lg"
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
