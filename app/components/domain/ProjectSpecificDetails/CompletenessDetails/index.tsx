import { useState } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import DefaultMapContainer from '#components/DefaultMapContainer';
import BaseMap from '#components/domain/BaseMap';
import GeoJsonAssetMapSource from '#components/domain/GeoJsonAssetMapSource';
import MapZoomViewSelectInput, { MapZoomViewType } from '#components/domain/MapZoomViewSelectInput';
import OverlayTileServerConfigOutput from '#components/domain/OverlayTileServerConfigOutput';
import RasterTileMapSource from '#components/domain/RasterTileMapSource';
import RasterTileServerOutput from '#components/domain/RasterTileServerOutput';
import VectorTileMapSource from '#components/domain/VectorTileMapSource';
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import ZoomLevelOutput from '#components/ZoomLevelOutput';
import { ProjectSpecificDetailsQuery } from '#generated/types/graphql';

interface Props {
    data: ProjectSpecificDetailsQuery['project']['projectTypeSpecifics'];
}

function CompletenessDetails(props: Props) {
    const { data } = props;
    const [zoomView, setZoomView] = useState<MapZoomViewType>('aoiBounds');

    // eslint-disable-next-line no-underscore-dangle
    if (isNotDefined(data) || data.__typename !== 'CompletenessProjectPropertyType') {
        return null;
    }

    return (
        <>
            <ZoomLevelOutput
                value={data.zoomLevel}
            />
            <ListLayout layout="grid">
                <ListLayout layout="block">
                    <BaseMap baseTileServer={removeNull(data.tileServerProperty)}>
                        <DefaultMapContainer />
                        <VectorTileMapSource
                            tileConfig={removeNull(data.overlayTileServerProperty.vector)}
                        />
                        <RasterTileMapSource
                            tileConfig={removeNull(data.overlayTileServerProperty.raster)}
                        />
                        <GeoJsonAssetMapSource
                            geoJsonAssetId={data.aoiGeometry}
                            zoomLevel={zoomView === 'zoomLevel' ? data.zoomLevel : undefined}
                        />
                    </BaseMap>
                    <InlineLayout withCenteredContent>
                        <MapZoomViewSelectInput
                            value={zoomView}
                            onChange={setZoomView}
                        />
                    </InlineLayout>
                </ListLayout>
                <ListLayout layout="block">
                    <RasterTileServerOutput
                        heading="Base tile server"
                        value={data.tileServerProperty}
                        withPadding
                        withHeaderBorder
                    />
                    <OverlayTileServerConfigOutput
                        value={data.overlayTileServerProperty}
                        withPadding
                        withHeaderBorder
                    />
                </ListLayout>
            </ListLayout>
        </>
    );
}

export default CompletenessDetails;
