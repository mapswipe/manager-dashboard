import {
    ComponentProps,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapCenter,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';
import { gql } from 'urql';

import {
    ProjectAssetMimetypeEnum,
    useProjectAssetPreviewQuery,
} from '#generated/types/graphql';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECT_ASSET_PREVIEW = gql`
query ProjectAssetPreview($assetId: ID!) {
    projectAsset(id: $assetId) {
        clientId
        id
        file {
            url
            name
        }
        mimetype
    }
}
`;

const geoJsonSourceOptions: Omit<maplibregl.GeoJSONSourceSpecification, 'data'> = {
    type: 'geojson',
};

const geoJsonLayerOptions: ComponentProps<typeof MapLayer>['layerOptions'] = {
    type: 'line',
    paint: {
        'line-color': '#ffff00',
        'line-width': 2,
        'line-dasharray': [2, 1],
    },
};

interface Props {
    geometryAssetId?: string;
    zoomLevel?: number;
}

function GeoJsonMapSource(props: Props) {
    const {
        geometryAssetId,
        zoomLevel,
    } = props;

    const [geoJson, setGeoJson] = useState<object | undefined>();

    const [{ data: geometryAssetResponse }] = useProjectAssetPreviewQuery({
        variables: { assetId: geometryAssetId ?? '' },
        pause: isNotDefined(geometryAssetId),
    });

    useEffect(() => {
        async function fetchGeoJson() {
            if (isNotDefined(geometryAssetResponse)
                || geometryAssetResponse
                    .projectAsset.mimetype !== ProjectAssetMimetypeEnum.Geojson
            ) {
                return;
            }

            const geoJsonResponse = await fetch(
                geometryAssetResponse.projectAsset.file.url,
            );

            const rawGeoJson = await geoJsonResponse.json();

            // TODO: validate
            setGeoJson(rawGeoJson);
        }

        fetchGeoJson();
    }, [geometryAssetResponse]);

    const center = useMemo<[number, number] | undefined>(() => {
        if (isNotDefined(geoJson) || isNotDefined(zoomLevel)) {
            return undefined;
        }
        const bounds = getBbox(geoJson as GeoJSON.GeoJSON);
        const x1 = bounds[0];
        const y1 = bounds[1];
        const x2 = bounds[2];
        const y2 = bounds[3];

        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        return [centerX, centerY];
    }, [geoJson, zoomLevel]);

    if (isNotDefined(geoJson)) {
        return null;
    }

    const sourceKey = `geojson-source-${geometryAssetId}`;
    const layerKey = `geojson-layer-${geometryAssetId}`;

    return (
        <>
            <MapSource
                sourceKey={sourceKey}
                sourceOptions={geoJsonSourceOptions}
                geoJson={geoJson as GeoJSON.FeatureCollection}
            >
                <MapLayer
                    layerKey={layerKey}
                    layerOptions={geoJsonLayerOptions}
                />
            </MapSource>
            {isDefined(center) && (
                <MapCenter
                    center={center}
                    centerOptions={{
                        zoom: zoomLevel,
                        // FIXME: use constants
                        duration: 1000,
                    }}
                />
            )}
        </>
    );
}

export default GeoJsonMapSource;
