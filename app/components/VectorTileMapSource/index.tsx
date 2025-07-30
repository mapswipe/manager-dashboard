import {
    ComponentProps,
    useContext,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import {
    PartialForm,
    removeNull,
} from '@togglecorp/toggle-form';

import TileServerContext from '#base/context/TileServerContext';
import {
    ProjectOverlayVectorTileServerConfig,
    VectorTileServerNameEnum,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';
import { vectorTileServerNameToTileInputKey } from '#views/EditProject/UpdateProjectForm/CompletenessProjectSpecifics/OverlayTileServerPropertyInput/OverlayVectorTileConfigInput/VectorTileServerInput/schema';

interface Props {
    tileConfig: PartialForm<DeepNonNullable<ProjectOverlayVectorTileServerConfig>> | undefined;
}

function VectorTileMapSource(props: Props) {
    const {
        tileConfig,
    } = props;

    const { vector: vectorTileServers } = useContext(TileServerContext);

    const {
        url,
        credits,
        sourceLayer,
        minZoom,
        maxZoom,
    } = useMemo(() => {
        const vectorTileServerMapping = listToMap(
            vectorTileServers,
            ({ type }) => type,
        );

        if (isNotDefined(tileConfig) || isNotDefined(tileConfig.tileServer)) {
            return {};
        }

        const { name } = tileConfig.tileServer;

        if (isNotDefined(name)) {
            return {};
        }

        if (name === VectorTileServerNameEnum.Custom) {
            return {
                url: tileConfig.tileServer?.custom?.url,
                credits: tileConfig.tileServer?.custom?.credits,
                sourceLayer: tileConfig.tileServer?.custom?.sourceLayer,
            };
        }

        const tileServer = tileConfig.tileServer?.[
            vectorTileServerNameToTileInputKey[name]
        ];
        return {
            url: vectorTileServerMapping[name]?.url,
            credits: vectorTileServerMapping[name]?.credits,
            sourceLayer: tileServer?.sourceLayer,
            minZoom: vectorTileServerMapping[name]?.minZoom,
            maxZoom: vectorTileServerMapping[name]?.maxZoom,
        };
    }, [tileConfig, vectorTileServers]);

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
        if (isNotDefined(tileConfig) || isNotDefined(sourceLayer)) {
            return undefined;
        }

        return {
            type: 'line',
            'source-layer': sourceLayer,
            paint: {
                'line-color': tileConfig.lineColor,
                'line-width': tileConfig.lineWidth,
                'line-opacity': tileConfig.lineOpacity,
            },
        };
    }, [tileConfig, sourceLayer]);

    const fillLayerOptions = useMemo<Omit<maplibregl.FillLayerSpecification, 'id' | 'source'> | undefined>(() => {
        if (isNotDefined(tileConfig) || isNotDefined(sourceLayer)) {
            return undefined;
        }

        return {
            type: 'fill',
            'source-layer': sourceLayer,
            paint: {
                'fill-color': tileConfig.fillColor,
                'fill-opacity': tileConfig.fillOpacity,
            },
        };
    }, [tileConfig, sourceLayer]);

    if (isNotDefined(sourceOptions)) {
        return null;
    }

    if (isNotDefined(tileConfig) || isNotDefined(tileConfig.tileServer)) {
        return null;
    }

    const sourceKey = `overlay-source-${tileConfig.tileServer.name}`;
    const fillLayerKey = `overlay-fill-layer-${sourceLayer}`;
    const lineLayerKey = `overlay-line-layer-${sourceLayer}`;

    return (
        <MapSource
            key={sourceKey}
            sourceKey={sourceKey}
            sourceOptions={sourceOptions}
        >
            {isDefined(fillLayerOptions) && (
                <MapLayer
                    key={fillLayerKey}
                    layerKey={fillLayerKey}
                    layerOptions={fillLayerOptions}
                />
            )}
            {isDefined(lineLayerOptions) && (
                <MapLayer
                    key={lineLayerKey}
                    layerKey={lineLayerKey}
                    layerOptions={lineLayerOptions}
                />
            )}
        </MapSource>
    );
}

export default VectorTileMapSource;
