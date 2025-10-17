import {
    useEffect,
    useState,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import GeoJsonMapSource from '#components/domain/GeoJsonMapSource';
import {
    AssetMimetypeEnum,
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

interface Props {
    geoJsonAssetId?: string;
    zoomLevel?: number;
    withPadding?: boolean;
    defaultBounds?: GeoJSON.Polygon | null;
}

function GeoJsonAssetMapSource(props: Props) {
    const {
        geoJsonAssetId,
        zoomLevel,
        withPadding,
        defaultBounds,
    } = props;

    const [geoJson, setGeoJson] = useState<object | undefined>();

    const [{ data: geometryAssetResponse }] = useProjectAssetPreviewQuery({
        variables: { assetId: geoJsonAssetId ?? '' },
        pause: isNotDefined(geoJsonAssetId),
    });

    useEffect(() => {
        async function fetchGeoJson() {
            if (isNotDefined(geometryAssetResponse)
                || geometryAssetResponse
                    .projectAsset.mimetype !== AssetMimetypeEnum.Geojson
            ) {
                return;
            }

            const {
                projectAsset: {
                    file,
                },
            } = geometryAssetResponse;

            if (isNotDefined(file)) {
                return;
            }

            const geoJsonResponse = await fetch(
                file.url,
            );

            const rawGeoJson = await geoJsonResponse.json();

            // TODO: validate
            setGeoJson(rawGeoJson);
        }

        fetchGeoJson();
    }, [geometryAssetResponse]);

    const sourceKey = `geojson-source-${geoJsonAssetId}`;
    const layerKey = `geojson-layer-${geoJsonAssetId}`;

    return (
        <GeoJsonMapSource
            overrideBounds={defaultBounds}
            geoJson={(
                geoJsonAssetId
                    ? geoJson as GeoJSON.FeatureCollection | undefined
                    : defaultBounds
            )}
            overrideZoomLevel={zoomLevel}
            sourceKey={sourceKey}
            layerKey={layerKey}
            withPadding={withPadding}
        />
    );
}

export default GeoJsonAssetMapSource;
