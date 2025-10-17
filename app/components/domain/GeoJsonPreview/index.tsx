import { ComponentProps } from 'react';
import { MapLayer } from '@togglecorp/re-map';

import DefaultMapContainer from '#components/DefaultMapContainer';
import BaseMap from '#components/domain/BaseMap';
import { type PartialRasterTileServerInputFields } from '#components/domain/RasterTileServerInput/schema';

import GeoJsonMapSource from '../GeoJsonMapSource';

const defaultGeoJsonLayerOptions: ComponentProps<typeof MapLayer>['layerOptions'] = {
    type: 'line',
    paint: {
        'line-color': '#ffffff',
        'line-width': 1,
        'line-opacity': 1,
    },
    layout: {
        visibility: 'visible',
    },
};

interface Props {
    baseTileServer: PartialRasterTileServerInputFields | undefined;
    geoJson: (
        GeoJSON.FeatureCollection<GeoJSON.Geometry>
        | GeoJSON.Feature<GeoJSON.Geometry>
        | GeoJSON.Geometry
        | undefined | null
    );
    geoJsonLayerOptions?: ComponentProps<typeof MapLayer>['layerOptions'];
    tileSize?: number;
    fitInSingleTile?: boolean;
    disablePan?: boolean;
    className?: string;
    children?: React.ReactNode;
    withPadding?: boolean;
}

function GeoJsonPreview(props: Props) {
    const {
        baseTileServer,
        geoJson,
        geoJsonLayerOptions = defaultGeoJsonLayerOptions,
        tileSize,
        fitInSingleTile = false,
        disablePan,
        className,
        children,
        withPadding,
    } = props;

    return (
        <BaseMap
            baseTileServer={baseTileServer}
            tileSize={tileSize}
            disablePan={disablePan}
        >
            <DefaultMapContainer className={className} />
            <GeoJsonMapSource
                geoJson={geoJson}
                sourceKey="geojson-source"
                layerKey="geojson-layer"
                layerOptions={geoJsonLayerOptions}
                fit={fitInSingleTile ? 'single-tile' : 'default'}
                withPadding={withPadding}
            />
            {children}
        </BaseMap>
    );
}

export default GeoJsonPreview;
