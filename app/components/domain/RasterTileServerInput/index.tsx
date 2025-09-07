import {
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    useFormObject,
} from '@togglecorp/toggle-form';

import Container, { type ContainerProps } from '#components/Container';
import DefaultMapContainer from '#components/DefaultMapContainer';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';
import RadioInput from '#components/RadioInput';
import TextInput from '#components/TextInput';
import EnumsContext from '#contexts/EnumsContext';
import TileServerContext from '#contexts/TileServerContext';
import { RasterTileServerNameEnum } from '#generated/types/graphql';
import {
    keySelector,
    labelSelector,
} from '#utils/common';

import BaseMap from '../BaseMap';
import GeoJsonAssetMapSource from '../GeoJsonAssetMapSource';
import MapZoomViewSelectInput, { MapZoomViewType } from '../MapZoomViewSelectInput';
import {
    PartialCommonRasterTileServerConfigFields,
    PartialCustomRasterTileServerConfigFields,
    type PartialRasterTileServerInputFields,
    rasterTileServerNameToTileInputKey,
    TileInputKeys,
} from './schema';

interface Props {
    label?: React.ReactNode;
    value: PartialRasterTileServerInputFields | undefined,
    error: LeafError | ObjectError<PartialRasterTileServerInputFields>,
    setFieldValue: (...entries: EntriesAsList<PartialRasterTileServerInputFields>) => void;
    disabled?: boolean;
    aoiGeoJsonAssetId?: string;
    withContainerBackground?: ContainerProps['withBackground'];
    withContainerPadding?: ContainerProps['withPadding'];
    containerSpacing?: ContainerProps['spacing'];
    containerHeadingLevel?: ContainerProps['headingLevel'];
    withoutPreview?: boolean;
    zoomLevel?: number;
}

function RasterTileServerInput(props: Props) {
    const {
        label = 'Tile Server',
        value,
        error: formError,
        setFieldValue,
        disabled,
        aoiGeoJsonAssetId,
        withContainerPadding,
        withContainerBackground,
        containerSpacing,
        containerHeadingLevel = 4,
        withoutPreview = false,
        zoomLevel,
    } = props;

    const error = getErrorObject(formError);

    const { rasterTileServerNameOptions } = useContext(EnumsContext);
    const [zoomView, setZoomView] = useState<MapZoomViewType>('aoiBounds');

    const fieldName = (isDefined(value)
        && isDefined(value.name)
    ) ? rasterTileServerNameToTileInputKey[value.name] : 'custom';

    const setCommonRasterTileServerFieldValue = useFormObject<
        Exclude<TileInputKeys, 'custom'>,
        PartialCommonRasterTileServerConfigFields
    >(
        fieldName === 'custom' ? 'bing' : fieldName,
        setFieldValue,
        {},
    );

    const setCustomRasterTileServerFieldValue = useFormObject<
        'custom',
        PartialCustomRasterTileServerConfigFields
    >(
        'custom',
        setFieldValue,
        {},
    );

    const { raster: rasterTileServers } = useContext(TileServerContext);
    const tileServerMapping = useMemo(() => (
        listToMap(rasterTileServers, ({ type }) => type)
    ), [rasterTileServers]);

    const handleImageryServerChange = useCallback((newValue: RasterTileServerNameEnum) => {
        setFieldValue(newValue, 'name');

        if (newValue !== RasterTileServerNameEnum.Custom) {
            setFieldValue(
                {
                    credits: tileServerMapping[newValue]?.credits,
                },
                rasterTileServerNameToTileInputKey[newValue],
            );
        }
    }, [setFieldValue, tileServerMapping]);

    return (
        <Container
            heading={label}
            headingLevel={containerHeadingLevel}
            withBackground={withContainerBackground}
            withPadding={withContainerPadding}
            spacing={containerSpacing}
        >
            <ListLayout
                layout={withoutPreview ? 'block' : 'grid'}
            >
                <ListLayout layout="block">
                    <RadioInput
                        label="Imagery server"
                        name="name"
                        options={rasterTileServerNameOptions ?? []}
                        value={value?.name}
                        onChange={handleImageryServerChange}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        error={error?.name}
                        disabled={disabled}
                        radioListLayout="block"
                    />
                    {isDefined(value)
                        && isDefined(value.name)
                        && value.name !== RasterTileServerNameEnum.Custom
                        && (
                            <TextInput
                                name="credits"
                                label="Imagery credits"
                                value={value[fieldName]?.credits}
                                error={getErrorObject(error?.[fieldName])?.credits}
                                onChange={setCommonRasterTileServerFieldValue}
                                disabled={disabled}
                            />
                        )}
                    {isDefined(value)
                        && isDefined(value.name)
                        && value.name === RasterTileServerNameEnum.Custom
                        && (
                            <>
                                <TextInput
                                    name="url"
                                    label="Custom Imagery Server URL"
                                    hint="Make sure you have permission. Add a custom tile server URL that uses {x}, {y} (or {-y}) & {z} or {quad_key} as placeholders and that already includes the api key."
                                    value={value.custom?.url}
                                    error={getErrorObject(error?.custom)?.url}
                                    onChange={setCustomRasterTileServerFieldValue}
                                    disabled={disabled}
                                />
                                <TextInput
                                    name="credits"
                                    label="Imagery Credits"
                                    hint="Insert appropriate imagery credits"
                                    value={value.custom?.credits}
                                    error={getErrorObject(error?.custom)?.credits}
                                    onChange={setCustomRasterTileServerFieldValue}
                                    disabled={disabled}
                                />
                                <ListLayout layout="grid">
                                    <NumberInput
                                        name="minZoom"
                                        label="Min zoom"
                                        value={value.custom?.minZoom}
                                        onChange={setCustomRasterTileServerFieldValue}
                                        disabled={disabled}
                                        error={getErrorObject(error?.custom)?.minZoom}
                                    />
                                    <NumberInput
                                        name="maxZoom"
                                        label="Max zoom"
                                        value={value.custom?.maxZoom}
                                        onChange={setCustomRasterTileServerFieldValue}
                                        disabled={disabled}
                                        error={getErrorObject(error?.custom)?.maxZoom}
                                    />
                                </ListLayout>
                            </>
                        )}
                </ListLayout>
                {!withoutPreview && (
                    <ListLayout layout="block">
                        <BaseMap baseTileServer={value}>
                            <DefaultMapContainer compact />
                            <GeoJsonAssetMapSource
                                geoJsonAssetId={aoiGeoJsonAssetId}
                                zoomLevel={zoomView === 'zoomLevel' ? zoomLevel : undefined}
                            />
                        </BaseMap>
                        {isDefined(zoomLevel) && (
                            <InlineLayout withCenteredContent>
                                <MapZoomViewSelectInput
                                    value={zoomView}
                                    onChange={setZoomView}
                                />
                            </InlineLayout>
                        )}
                    </ListLayout>
                )}
            </ListLayout>
        </Container>
    );
}

export default RasterTileServerInput;
