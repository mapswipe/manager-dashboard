import {
    useCallback,
    useContext,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Checkbox from '#components/Checkbox';
import Container from '#components/Container';
import AssetInput from '#components/domain/AssetInput';
import { type PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import RasterTileServerInput from '#components/domain/RasterTileServerInput';
import {
    defaultRasterTileServerInputValue,
    type PartialRasterTileServerInputFields,
} from '#components/domain/RasterTileServerInput/schema';
import ListLayout from '#components/ListLayout';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import ZoomLevelSelectInput from '#components/ZoomLevelSelectInput';
import EnumsContext from '#contexts/EnumsContext';
import {
    ProjectAssetInputTypeEnum,
    type ProjectDetailsQuery,
} from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import { type PartialLocateObjectSpecificFields } from './schema';

type DefaultCustomOption = ProjectDetailsQuery['defaultLocateObjectCustomOptions'][number];

// FIXME(frozenhelium): The custom options for both cases (with and without multiple features)
// should come from the server

// NOTE: In the LOCATE custom options, value 2 corresponds to the "Multiple
// Features" option, which managers can optionally exclude to keep only the
// "Single Feature" and "No" options.
const MULTIPLE_FEATURES_VALUE = 2;

// Value 1 is the "Single Feature" option. Drop "Multiple Features" and the
// single-vs-multiple split stops making sense. The option then just means a
// feature is present, so we show it as "Feature Exists".
// Only these two strings live here. The original label is restored from the
// backend default (see the toggle handler), not duplicated, so they can't
// drift apart.
const SINGLE_FEATURE_VALUE = 1;
const FEATURE_EXISTS_TITLE = 'Feature Exists';
const FEATURE_EXISTS_DESCRIPTION = 'the shape outlines one or more features in the image';

function relabelSingleFeatureOption(
    options: PartialCustomOptionInputFields[],
    overrides: Partial<PartialCustomOptionInputFields>,
): PartialCustomOptionInputFields[] {
    return options.map((option) => (
        option.value === SINGLE_FEATURE_VALUE
            ? { ...option, ...overrides }
            : option
    ));
}

interface Props {
    projectId: string;
    value: PartialLocateObjectSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialLocateObjectSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialLocateObjectSpecificFields>) => void;
    defaultMultipleFeaturesOption: DefaultCustomOption | undefined;
    defaultSingleFeatureOption: DefaultCustomOption | undefined;
    disabled?: boolean;
}

function LocateObjectProjectSpecifics(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        defaultMultipleFeaturesOption,
        defaultSingleFeatureOption,
        disabled,
    } = props;

    const { subGridSizeOptions } = useContext(EnumsContext);

    const error = getErrorObject(formError);

    const setTileServerInputFieldValue = useFormObject<'tileServerProperty', PartialRasterTileServerInputFields>(
        'tileServerProperty' as const,
        setFieldValue,
        defaultRasterTileServerInputValue,
    );

    const includeMultipleFeatures = value?.customOptions?.some(
        (option) => option.value === MULTIPLE_FEATURES_VALUE,
    ) ?? false;

    const handleMultipleFeaturesToggle = useCallback((include: boolean) => {
        setFieldValue(
            (oldOptions: PartialCustomOptionInputFields[] | undefined) => {
                const baseOptions = oldOptions ?? [];

                if (!include) {
                    const withoutMultiple = baseOptions.filter(
                        (option) => option.value !== MULTIPLE_FEATURES_VALUE,
                    );
                    return relabelSingleFeatureOption(withoutMultiple, {
                        title: FEATURE_EXISTS_TITLE,
                        description: FEATURE_EXISTS_DESCRIPTION,
                    });
                }

                const alreadyPresent = baseOptions.some(
                    (option) => option.value === MULTIPLE_FEATURES_VALUE,
                );
                if (alreadyPresent || isNotDefined(defaultMultipleFeaturesOption)) {
                    return baseOptions;
                }

                // The two options are handled differently here. "Single
                // Feature" was never removed, only relabeled, so just put its
                // original label back. "Multiple Features" was removed
                // entirely, so re-add it below.
                const restoredOptions = isDefined(defaultSingleFeatureOption)
                    ? relabelSingleFeatureOption(baseOptions, {
                        title: defaultSingleFeatureOption.title,
                        description: defaultSingleFeatureOption.description,
                    })
                    : baseOptions;

                return [
                    ...restoredOptions,
                    {
                        clientId: ulid(),
                        ...defaultMultipleFeaturesOption,
                    },
                ];
            },
            'customOptions' as const,
        );
    }, [setFieldValue, defaultMultipleFeaturesOption, defaultSingleFeatureOption]);

    return (
        <>
            <AssetInput
                label="AOI geometry"
                projectId={projectId}
                name="aoiGeometry"
                onChange={setFieldValue}
                value={value?.aoiGeometry}
                error={error?.aoiGeometry}
                inputType={ProjectAssetInputTypeEnum.AoiGeometry}
                hint="Upload your project area as GeoJSON File"
                disabled={disabled}
                withoutPreview
            />
            <RasterTileServerInput
                value={value?.tileServerProperty}
                error={error?.tileServerProperty}
                setFieldValue={setTileServerInputFieldValue}
                disabled={disabled}
                aoiGeoJsonAssetId={value?.aoiGeometry}
                zoomLevel={isDefined(value?.zoomLevel) ? value.zoomLevel : undefined}
            />
            <ZoomLevelSelectInput
                name="zoomLevel"
                value={value?.zoomLevel}
                onChange={setFieldValue}
                error={error?.zoomLevel}
                disabled={disabled}
            />
            <Container
                heading="Subgrid"
                headingLevel={5}
            >
                <RadioInput
                    label="Sub grid Size"
                    name="subGridSize"
                    options={subGridSizeOptions}
                    value={value?.subGridSize}
                    disabled={disabled}
                    onChange={setFieldValue}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    error={error?.subGridSize}
                />
            </Container>
            <Container
                heading="Answer options"
                headingLevel={5}
                headerDescription="Choose which answer options appear on the tiles. Disable 'Multiple Features' to keep only the first two options."
            >
                <Checkbox
                    name="includeMultipleFeatures"
                    label="Include 'Multiple Features' option"
                    value={includeMultipleFeatures}
                    onChange={handleMultipleFeaturesToggle}
                    // Re-enabling needs both backend defaults: one to re-add
                    // "Multiple Features", one to restore the "Single Feature"
                    // label. Missing either, a click would do nothing, so
                    // disable the checkbox instead.
                    disabled={disabled
                        || isNotDefined(defaultMultipleFeaturesOption)
                        || isNotDefined(defaultSingleFeatureOption)}
                />
                <CustomOptionPreview
                    variant="tile"
                    value={value?.customOptions}
                />
            </Container>
            <Container
                heading="Export Meta"
                headingLevel={5}
            >
                <ListLayout type="grid">
                    <TextInput
                        label="Key"
                        name="exportMetaKey"
                        value={value?.exportMetaKey}
                        onChange={setFieldValue}
                        error={error?.exportMetaKey}
                    />
                    <TextInput
                        label="Value"
                        name="exportMetaValue"
                        value={value?.exportMetaValue}
                        onChange={setFieldValue}
                        error={error?.exportMetaValue}
                    />
                </ListLayout>
            </Container>
        </>
    );
}

export default LocateObjectProjectSpecifics;
