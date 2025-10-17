import { useState } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import DefaultMapContainer from '#components/DefaultMapContainer';
import BaseMap from '#components/domain/BaseMap';
import GeoJsonAssetMapSource from '#components/domain/GeoJsonAssetMapSource';
import MapZoomViewSelectInput, { MapZoomViewType } from '#components/domain/MapZoomViewSelectInput';
import RasterTileServerOutput from '#components/domain/RasterTileServerOutput';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import ZoomLevelOutput from '#components/ZoomLevelOutput';
import { CompareProjectPropertyType } from '#generated/types/graphql';

interface Props {
    data: CompareProjectPropertyType | undefined;
    defaultBounds: GeoJSON.Polygon | undefined | null;
}

function CompareDetails(props: Props) {
    const {
        data,
        defaultBounds,
    } = props;
    const [zoomView, setZoomView] = useState<MapZoomViewType>('aoiBounds');

    if (isNotDefined(data)) {
        return null;
    }

    const tileZ = data.zoomLevel;

    return (
        <>
            <ZoomLevelOutput
                value={data.zoomLevel}
            />
            <ListLayout layout="grid">
                <BaseMap baseTileServer={removeNull(data.tileServerProperty)}>
                    <DefaultMapContainer compact />
                    <GeoJsonAssetMapSource
                        geoJsonAssetId={data.aoiGeometry}
                        zoomLevel={zoomView === 'zoomLevel' ? tileZ : undefined}
                        withPadding={zoomView === 'aoiBounds'}
                        defaultBounds={defaultBounds}
                    />
                </BaseMap>
                <RasterTileServerOutput
                    value={data.tileServerProperty}
                    withPadding
                    withHeaderBorder
                />
            </ListLayout>
            <ListLayout layout="grid">
                <BaseMap baseTileServer={removeNull(data.tileServerBProperty)}>
                    <DefaultMapContainer compact />
                    <GeoJsonAssetMapSource
                        geoJsonAssetId={data.aoiGeometry}
                        zoomLevel={zoomView === 'zoomLevel' ? tileZ : undefined}
                        withPadding={zoomView === 'aoiBounds'}
                        defaultBounds={defaultBounds}
                    />
                </BaseMap>
                <RasterTileServerOutput
                    value={data.tileServerBProperty}
                    heading="Tile Server B"
                    withPadding
                    withHeaderBorder
                />
            </ListLayout>
            <ListLayout layout="grid">
                <InlineLayout withCenteredContent>
                    <MapZoomViewSelectInput
                        value={zoomView}
                        onChange={setZoomView}
                    />
                </InlineLayout>
                <div />
            </ListLayout>
        </>
    );
}

export default CompareDetails;
