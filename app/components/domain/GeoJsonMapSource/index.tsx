import {
    ComponentProps,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapCenter,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';

const geoJsonSourceOptions: Omit<maplibregl.GeoJSONSourceSpecification, 'data'> = {
    type: 'geojson',
};

const geoJsonLayerOptions: ComponentProps<typeof MapLayer>['layerOptions'] = {
    type: 'line',
    paint: {
        'line-color': '#ffffff',
        'line-width': 2,
        'line-opacity': 1,
        // 'line-dasharray': [2, 1],
    },
    layout: {
        visibility: 'visible',
    },
};

interface Props {
    geoJson: GeoJSON.FeatureCollection;
    zoomLevel?: number;
    sourceKey: string;
    layerKey: string;
}

function GeoJsonMapSource(props: Props) {
    const {
        geoJson,
        zoomLevel,
        sourceKey,
        layerKey,
    } = props;

    const bounds = isDefined(geoJson)
        ? (getBbox(geoJson as GeoJSON.GeoJSON) as [number, number, number, number])
        : undefined;

    const center = useMemo<[number, number] | undefined>(() => {
        if (isNotDefined(bounds) || isNotDefined(zoomLevel)) {
            return undefined;
        }

        const x1 = bounds[0];
        const y1 = bounds[1];
        const x2 = bounds[2];
        const y2 = bounds[3];

        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        return [centerX, centerY];
    }, [bounds, zoomLevel]);

    if (isNotDefined(geoJson)) {
        return null;
    }

    return (
        <>
            <MapSource
                key={sourceKey}
                sourceKey={sourceKey}
                sourceOptions={geoJsonSourceOptions}
                geoJson={geoJson as GeoJSON.FeatureCollection}
            >
                <MapLayer
                    key={layerKey}
                    layerKey={layerKey}
                    layerOptions={geoJsonLayerOptions}
                />
            </MapSource>
            {isDefined(center) && (
                <MapCenter
                    center={center}
                    centerOptions={{
                        zoom: zoomLevel,
                        duration: 0,
                    }}
                />
            )}
            {isNotDefined(center) && isDefined(bounds) && (
                <MapBounds
                    bounds={bounds}
                    duration={0}
                />
            )}
        </>
    );
}

export default GeoJsonMapSource;
