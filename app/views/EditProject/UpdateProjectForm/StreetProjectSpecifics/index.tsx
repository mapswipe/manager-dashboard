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
import AssetInput from '#components/domain/AssetInput';
import CustomOptionInput from '#components/domain/CustomOptionInput';
import { PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema';
import ListLayout from '#components/ListLayout';
import NonFieldError from '#components/NonFieldError';
import { ProjectAssetInputTypeEnum } from '#generated/types/graphql';

import {
    defaultStreetMapillaryImageFiltersInputFormValue,
    PartialStreetMapillaryImageFiltersInputFields,
} from './StreetMapillaryImageFiltersInput/schema';
import { type PartialStreetSpecificFields } from './schema';
import StreetMapillaryImageFiltersInput from './StreetMapillaryImageFiltersInput';

interface Props {
    projectId: string;
    value: PartialStreetSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialStreetSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialStreetSpecificFields>) => void;
    disabled?: boolean;
}

function StreetProjectSpecifics(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);

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

    const setStreetMapillaryImageFiltersInputFieldValue = useFormObject<'mapillaryImageFilters', PartialStreetMapillaryImageFiltersInputFields>(
        'mapillaryImageFilters' as const,
        setFieldValue,
        defaultStreetMapillaryImageFiltersInputFormValue,
    );

    return (
        <>
            <Container
                withBackground
                headingLevel={4}
                heading="Custom options"
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
                withWelledContent
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
            <Container
                withBackground
            >
                <AssetInput
                    label="AOI geometry"
                    projectId={projectId}
                    name="aoiGeometry"
                    onChange={setFieldValue}
                    value={value?.aoiGeometry}
                    error={error?.aoiGeometry}
                    inputType={ProjectAssetInputTypeEnum.AoiGeometry}
                    disabled={disabled}
                    hint="Upload your project area as GeoJSON File (max. 1MB)"
                />
            </Container>
            <StreetMapillaryImageFiltersInput
                value={value?.mapillaryImageFilters}
                setFieldValue={setStreetMapillaryImageFiltersInputFieldValue}
                disabled={disabled}
                error={error?.mapillaryImageFilters}
            />
        </>
    );
}

export default StreetProjectSpecifics;
