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

// NOTE: In the LOCATE custom options, value 2 corresponds to the "Multiple
// Features" option, which managers can optionally exclude to keep only the
// "Single Feature" and "No" options.
const MULTIPLE_FEATURES_VALUE = 2;

interface Props {
    projectId: string;
    value: PartialLocateObjectSpecificFields | undefined | null;
    error: LeafError | ObjectError<PartialLocateObjectSpecificFields>;
    setFieldValue: (...entries: EntriesAsList<PartialLocateObjectSpecificFields>) => void;
    defaultMultipleFeaturesOption: DefaultCustomOption | undefined;
    disabled?: boolean;
}

function LocateObjectProjectSpecifics(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        defaultMultipleFeaturesOption,
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
                    return baseOptions.filter(
                        (option) => option.value !== MULTIPLE_FEATURES_VALUE,
                    );
                }

                const alreadyPresent = baseOptions.some(
                    (option) => option.value === MULTIPLE_FEATURES_VALUE,
                );
                if (alreadyPresent || isNotDefined(defaultMultipleFeaturesOption)) {
                    return baseOptions;
                }

                return [
                    ...baseOptions,
                    {
                        clientId: ulid(),
                        ...defaultMultipleFeaturesOption,
                    },
                ];
            },
            'customOptions' as const,
        );
    }, [setFieldValue, defaultMultipleFeaturesOption]);

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
                    // NOTE: re-adding the option needs the canonical default from
                    // the backend; without it the toggle could not function, so
                    // we disable it rather than let a click silently no-op.
                    disabled={disabled || isNotDefined(defaultMultipleFeaturesOption)}
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
