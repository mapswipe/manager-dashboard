import { ComponentProps } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapContainer,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';

import BaseMap from '#components/BaseMap';
import { type PartialTileServerInputFields } from '#views/EditProject/UpdateProjectForm/TileServerInput/schema';

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
    baseTileServer: PartialTileServerInputFields | undefined;
    geoJson: GeoJSON.Feature<GeoJSON.Geometry>
        | GeoJSON.FeatureCollection<GeoJSON.Geometry>
        | undefined;
    geoJsonLayerOptions?: ComponentProps<typeof MapLayer>['layerOptions'];
    padding?: number;
}

function GeoJsonPreview(props: Props) {
    const {
        className,
        baseTileServer,
        geoJson,
        geoJsonLayerOptions = defaultGeoJsonLayerOptions,
        padding = DEFAULT_MAP_PADDING,
    } = props;

    const bounds = isDefined(geoJson) ? getBbox(geoJson) : undefined;

    return (
        <BaseMap
            baseTileServer={baseTileServer}
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
            {isDefined(bounds) && (
                <MapBounds
                    bounds={bounds as [number, number, number, number]}
                    padding={padding}
                    // FIXME: use constants
                    duration={1000}
                />
            )}
        </BaseMap>
    );
}

export default GeoJsonPreview;
