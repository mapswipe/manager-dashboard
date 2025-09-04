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
import { ProjectSpecificDetailsQuery } from '#generated/types/graphql';

interface Props {
    data: ProjectSpecificDetailsQuery['project']['projectTypeSpecifics'];
}

function FindDetails(props: Props) {
    const { data } = props;
    const [zoomView, setZoomView] = useState<MapZoomViewType>('aoiBounds');

    // eslint-disable-next-line no-underscore-dangle
    if (isNotDefined(data) || data.__typename !== 'FindProjectPropertyType') {
        return null;
    }

    return (
        <>
            <ZoomLevelOutput value={data.zoomLevel} />
            <ListLayout layout="grid">
                <ListLayout layout="block">
                    <BaseMap baseTileServer={removeNull(data?.tileServerProperty)}>
                        <DefaultMapContainer />
                        <GeoJsonAssetMapSource
                            geoJsonAssetId={data?.aoiGeometry}
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
                <RasterTileServerOutput
                    value={data.tileServerProperty}
                    withHeaderBorder
                    withPadding
                />
            </ListLayout>
        </>
    );
}

export default FindDetails;
