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
    defaultStreetMapilaryImageFiltersInputFormValue,
    PartialStreetMapilaryImageFiltersInputFields,
} from './StreetMapilaryImageFiltersInput/schema';
import { type PartialStreetSpecificFields } from './schema';
import StreetMapilaryImageFiltersInput from './StreetMapilaryImageFiltersInput';

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

    const setStreetMapilaryImageFiltersInputFieldValue = useFormObject<'mapillaryImageFilters', PartialStreetMapilaryImageFiltersInputFields>(
        'mapillaryImageFilters' as const,
        setFieldValue,
        defaultStreetMapilaryImageFiltersInputFormValue,
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
                    withoutPreview
                />
            </Container>
            <StreetMapilaryImageFiltersInput
                value={value?.mapillaryImageFilters}
                setFieldValue={setStreetMapilaryImageFiltersInputFieldValue}
                disabled={disabled}
                error={error?.mapillaryImageFilters}
            />
        </>
    );
}

export default StreetProjectSpecifics;
