import { ComponentProps } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapCenter,
    MapContainer,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';

import BaseMap from '#components/domain/BaseMap';
import { type PartialRasterTileServerInputFields } from '#components/domain/RasterTileServerInput/schema';
import {
    getBbox,
    getCenterFromBBox,
    getZoomLevelFromBbox,
} from '#utils/geo';

import styles from './styles.module.css';

const DEFAULT_MAP_PADDING = 10;

const geoJsonSourceOptions: Omit<maplibregl.GeoJSONSourceSpecification, 'data'> = {
    type: 'geojson',
};

const defaultGeoJsonLayerOptions: ComponentProps<typeof MapLayer>['layerOptions'] = {
    type: 'line',
    paint: {
        'line-color': '#ffffff',
        'line-width': 1,
    },
};

interface Props {
    className?: string;
    baseTileServer: PartialRasterTileServerInputFields | undefined;
    geoJson: GeoJSON.Feature<GeoJSON.Geometry>
        | GeoJSON.FeatureCollection<GeoJSON.Geometry>
        | undefined;
    geoJsonLayerOptions?: ComponentProps<typeof MapLayer>['layerOptions'];
    padding?: number;
    tileSize?: number;
    fitInSingleTile?: boolean;
}

function GeoJsonPreview(props: Props) {
    const {
        className,
        baseTileServer,
        geoJson,
        geoJsonLayerOptions = defaultGeoJsonLayerOptions,
        padding = DEFAULT_MAP_PADDING,
        tileSize,
        fitInSingleTile = false,
    } = props;

    const bounds = getBbox(geoJson);
    const center = getCenterFromBBox(bounds);
    const zoomLevel = getZoomLevelFromBbox(bounds);

    return (
        <BaseMap
            baseTileServer={baseTileServer}
            tileSize={tileSize}
        >
            {isDefined(geoJson) && (
                <MapSource
                    sourceKey="geojson-source"
                    sourceOptions={geoJsonSourceOptions}
                    geoJson={geoJson}
                >
                    <MapLayer
                        layerKey="geojson-layer"
                        layerOptions={geoJsonLayerOptions}
                    />
                </MapSource>
            )}
            <MapContainer className={_cs(styles.geoJsonPreview, className)} />
            {isDefined(bounds) && !fitInSingleTile && (
                <MapBounds
                    bounds={bounds}
                    padding={padding}
                    // FIXME: use constants
                    duration={500}
                />
            )}
            {fitInSingleTile && (
                <MapCenter
                    center={center}
                    centerOptions={{
                        zoom: zoomLevel,
                        duration: 500,
                    }}
                />
            )}
        </BaseMap>
    );
}

export default GeoJsonPreview;
