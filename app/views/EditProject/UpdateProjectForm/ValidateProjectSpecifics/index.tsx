import { useCallback } from 'react';
import { IoAdd } from 'react-icons/io5';
import { PiTrash } from 'react-icons/pi';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
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
import ListLayout from '#components/ListLayout';
import NonFieldError from '#components/NonFieldError';

import {
    defaultObjectSourceInputFormValue,
    PartialValidateObjectSourceInputFields,
} from './ObjectSourceInput/schema';
import ObjectSourceInput from './ObjectSourceInput';
import { type PartialValidateSpecificFields } from './schema';

const isPreEventImageryEnabled = import.meta.env.APP_ENVIRONMENT !== 'PROD';

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

    const setPreEventTileServerInputFieldValue = useFormObject<
        'preEventTileServerProperty',
        PartialRasterTileServerInputFields
    >(
        'preEventTileServerProperty' as const,
        setFieldValue,
        defaultRasterTileServerInputValue,
    );

    const handlePreEventTileServerAdd = useCallback(() => {
        setFieldValue(defaultRasterTileServerInputValue, 'preEventTileServerProperty');
    }, [setFieldValue]);

    const handlePreEventTileServerRemove = useCallback(() => {
        setFieldValue(undefined, 'preEventTileServerProperty');
    }, [setFieldValue]);

    const hasPreEventTileServer = isDefined(value?.preEventTileServerProperty);

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
                headingLevel={4}
                heading="Custom options"
                withWelledContent
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
                <ListLayout layout="grid">
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
                </ListLayout>
            </Container>
            <ObjectSourceInput
                value={value?.objectSource}
                setFieldValue={setObjectSourceInputFieldValue}
                disabled={disabled}
                error={error?.objectSource}
                projectId={projectId}
            />
            {hasPreEventTileServer && (
                <RasterTileServerInput
                    label="Pre-event Tile Server"
                    value={value?.preEventTileServerProperty}
                    error={error?.preEventTileServerProperty}
                    setFieldValue={setPreEventTileServerInputFieldValue}
                    disabled={disabled}
                    aoiGeoJsonAssetId={value?.objectSource?.aoiGeometry}
                    zoomLevel={undefined}
                    headerActions={(
                        <Button
                            name={undefined}
                            onClick={handlePreEventTileServerRemove}
                            styleVariant="translucent"
                            colorVariant="danger"
                            disabled={disabled}
                            spacing="sm"
                            title="Remove pre-event imagery"
                        >
                            <PiTrash />
                        </Button>
                    )}
                />
            )}
            <RasterTileServerInput
                label={hasPreEventTileServer ? 'Post-event Tile Server' : 'Tile Server'}
                value={value?.tileServerProperty}
                error={error?.tileServerProperty}
                setFieldValue={setTileServerInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={value?.objectSource?.aoiGeometry}
                zoomLevel={undefined}
                headerActions={!hasPreEventTileServer && isPreEventImageryEnabled && (
                    <Button
                        name={undefined}
                        onClick={handlePreEventTileServerAdd}
                        styleVariant="transparent"
                        start={<IoAdd />}
                        disabled={disabled}
                        withoutPadding
                    >
                        Add pre-event imagery
                    </Button>
                )}
            />
        </>
    );
}

export default ValidateProjectSpecifics;
