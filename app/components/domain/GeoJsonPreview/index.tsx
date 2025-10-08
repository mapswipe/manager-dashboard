import {
    ComponentProps,
    useMemo,
} from 'react';
import {
    bboxToTile,
    tileToBBOX,
} from '@mapbox/tilebelt';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapContainer,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';

import BaseMap from '#components/domain/BaseMap';
import { type PartialRasterTileServerInputFields } from '#components/domain/RasterTileServerInput/schema';
import {
    BoundingBox,
    getBbox,
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
    disablePan?: boolean;
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
        disablePan,
    } = props;

    const bounds = useMemo(() => {
        const bbox = getBbox(geoJson);

        if (isNotDefined(bbox) || !fitInSingleTile) {
            return bbox;
        }

        return tileToBBOX(bboxToTile(bbox)) as BoundingBox;
    }, [fitInSingleTile, geoJson]);

    return (
        <BaseMap
            baseTileServer={baseTileServer}
            tileSize={tileSize}
            disablePan={disablePan}
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
                    bounds={bounds}
                    padding={padding}
                    // FIXME: use constants
                    duration={500}
                />
            )}
        </BaseMap>
    );
}

export default GeoJsonPreview;
