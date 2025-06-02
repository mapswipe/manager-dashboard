import {
    ComponentProps,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    getLayerName,
    MapCenter,
    MapContainer,
    MapLayer,
    MapOrder,
    MapSource,
} from '@togglecorp/re-map';
import { removeNull } from '@togglecorp/toggle-form';
import getBbox from '@turf/bbox';

import TileServerContext from '#base/context/TileServerContext';
import BaseMap from '#components/BaseMap';
import {
    ProjectAssetMimetypeEnum,
    ProjectAssetPreviewQuery,
    ProjectAssetPreviewQueryVariables,
    VectorTileServerNameEnum,
} from '#generated/types/graphql';
import { type PartialTileServerInputFields } from '#views/EditProject/UpdateProjectForm/TileServerInput/schema';

import { PartialOverlayVectorTileConfigInputFields } from '../schema';
import { vectorTileServerNameToTileInputKey } from '../VectorTileServerInput/schema';

import styles from './styles.module.css';

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
    className?: string;
    baseTileServer: PartialTileServerInputFields | undefined;
    aoiGeometryAssetId?: string;
    vectorTileConfig: PartialOverlayVectorTileConfigInputFields | undefined;
    zoomLevel?: number;
}

function VectorTilePreview(props: Props) {
    const {
        className,
        baseTileServer,
        vectorTileConfig,
        aoiGeometryAssetId,
        zoomLevel,
    } = props;

    const [geoJson, setGeoJson] = useState<object | undefined>();

    const {
        data: aoiGeometryAssetResponse,
    } = useQuery<ProjectAssetPreviewQuery, ProjectAssetPreviewQueryVariables>(
        PROJECT_ASSET_PREVIEW,
        {
            variables: {
                assetId: aoiGeometryAssetId ?? '',
            },
            skip: isNotDefined(aoiGeometryAssetId),
        },
    );

    useEffect(() => {
        async function fetchGeoJson() {
            if (isNotDefined(aoiGeometryAssetResponse)
                || aoiGeometryAssetResponse
                    .projectAsset.mimetype !== ProjectAssetMimetypeEnum.Geojson
            ) {
                return;
            }

            const geoJsonResponse = await fetch(
                aoiGeometryAssetResponse.projectAsset.file.url,
            );

            const rawGeoJson = await geoJsonResponse.json();

            // TODO: validate
            setGeoJson(rawGeoJson);
        }

        fetchGeoJson();
    }, [aoiGeometryAssetResponse]);

    const { vector: vectorTileServers } = useContext(TileServerContext);

    const {
        url,
        credits,
        sourceName,
        minZoom,
        maxZoom,
    } = useMemo(() => {
        const vectorTileServerMapping = listToMap(
            vectorTileServers,
            ({ type }) => type,
        );

        if (isNotDefined(vectorTileConfig) || isNotDefined(vectorTileConfig.tileServer)) {
            return {};
        }

        const { name } = vectorTileConfig.tileServer;

        if (isNotDefined(name)) {
            return {};
        }

        if (name === VectorTileServerNameEnum.Custom) {
            return {
                url: vectorTileConfig.tileServer?.custom?.url,
                credits: vectorTileConfig.tileServer?.custom?.credits,
                sourceName: vectorTileConfig.tileServer?.custom?.sourceName,
            };
        }

        const tileServer = vectorTileConfig.tileServer?.[
            vectorTileServerNameToTileInputKey[name]
        ];
        return {
            url: vectorTileServerMapping[name]?.url,
            credits: vectorTileServerMapping[name]?.credits,
            sourceName: tileServer?.sourceName,
            minZoom: vectorTileServerMapping[name]?.minZoom,
            maxZoom: vectorTileServerMapping[name]?.maxZoom,
        };
    }, [vectorTileConfig, vectorTileServers]);

    const sourceOptions = useMemo<ComponentProps<typeof MapSource>['sourceOptions']>(() => {
        if (isNotDefined(url)) {
            return undefined;
        }

        return removeNull({
            type: 'vector',
            tiles: [url],
            attribution: credits ?? '',
            minzoom: minZoom ?? null,
            maxzoom: maxZoom ?? null,
        });
    }, [url, credits, minZoom, maxZoom]);

    const lineLayerOptions = useMemo<Omit<maplibregl.LineLayerSpecification, 'id' | 'source'> | undefined>(() => {
        if (isNotDefined(vectorTileConfig) || isNotDefined(sourceName)) {
            return undefined;
        }

        return {
            type: 'line',
            'source-layer': sourceName,
            paint: {
                'line-color': vectorTileConfig.lineColor,
                'line-width': vectorTileConfig.lineWidth,
                'line-opacity': vectorTileConfig.lineOpacity,
            },
        };
    }, [vectorTileConfig, sourceName]);

    const fillLayerOptions = useMemo<Omit<maplibregl.FillLayerSpecification, 'id' | 'source'> | undefined>(() => {
        if (isNotDefined(vectorTileConfig) || isNotDefined(sourceName)) {
            return undefined;
        }

        return {
            type: 'fill',
            'source-layer': sourceName,
            paint: {
                'fill-color': vectorTileConfig.fillColor,
                'fill-opacity': vectorTileConfig.fillOpacity,
            },
        };
    }, [vectorTileConfig, sourceName]);

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

    return (
        <BaseMap baseTileServer={baseTileServer}>
            <MapContainer
                className={_cs(styles.vectorTilePreview, className)}
            />
            {isDefined(sourceOptions) && (
                <MapSource
                    key={`overlay-source-${vectorTileConfig?.tileServer?.name}`}
                    sourceKey={`overlay-source-${vectorTileConfig?.tileServer?.name}`}
                    sourceOptions={sourceOptions}
                >
                    {isDefined(fillLayerOptions) && (
                        <MapLayer
                            key={`overlay-fill-layer-${sourceName}`}
                            layerKey={`overlay-fill-layer-${sourceName}`}
                            layerOptions={fillLayerOptions}
                        />
                    )}
                    {isDefined(lineLayerOptions) && (
                        <MapLayer
                            key={`overlay-line-layer-${sourceName}`}
                            layerKey={`overlay-line-layer-${sourceName}`}
                            layerOptions={lineLayerOptions}
                        />
                    )}
                </MapSource>
            )}
            {isDefined(geoJson) && (
                <MapSource
                    sourceKey="geojson-source"
                    sourceOptions={geoJsonSourceOptions}
                    geoJson={geoJson as GeoJSON.FeatureCollection}
                >
                    <MapLayer
                        layerKey="geojson-layer"
                        layerOptions={geoJsonLayerOptions}
                    />
                </MapSource>
            )}
            <MapOrder
                ordering={[
                    getLayerName('base-tile-source', 'base-tile-layer', true),
                    getLayerName(
                        `overlay-source-${vectorTileConfig?.tileServer?.name}`,
                        `overlay-fill-layer-${sourceName}`,
                        true,
                    ),
                    getLayerName(
                        `overlay-source-${vectorTileConfig?.tileServer?.name}`,
                        `overlay-line-layer-${sourceName}`,
                        true,
                    ),
                ]}
            />
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
        </BaseMap>
    );
}

export default VectorTilePreview;
