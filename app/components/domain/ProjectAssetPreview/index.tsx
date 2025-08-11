import {
    useEffect,
    useState,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { gql } from 'urql';

import GeoJsonPreview from '#components/domain/GeoJsonPreview';
import { PartialRasterTileServerInputFields } from '#components/domain/RasterTileServerInput/schema';
import {
    AssetMimetypeEnum,
    useProjectAssetPreviewQuery,
} from '#generated/types/graphql';

import styles from './styles.module.css';

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
    className?: string;
    rendererClassName?: string;
    assetId: string | undefined;
    geoJsonTileServer?: PartialRasterTileServerInputFields;
}

function ProjectAssetPreview(props: Props) {
    const {
        className: classNameFromProps,
        rendererClassName,
        assetId,
        geoJsonTileServer,
    } = props;

    const [geoJson, setGeoJson] = useState<object | undefined>();

    const [{
        data: previewResponse,
    }] = useProjectAssetPreviewQuery({
        variables: {
            assetId: assetId ?? '',
        },
        pause: isNotDefined(assetId),
    });

    const className = _cs(styles.projectAssetPreview, classNameFromProps);
    const {
        ImageGif,
        ImagePng,
        ImageJpeg,
        Geojson,
    } = AssetMimetypeEnum;

    useEffect(() => {
        async function fetchGeoJson() {
            if (isNotDefined(previewResponse)
                || previewResponse.projectAsset.mimetype !== Geojson
            ) {
                return;
            }

            const geoJsonResponse = await fetch(
                previewResponse.projectAsset.file.url,
            );

            const rawGeoJson = await geoJsonResponse.json();

            // TODO: validate
            setGeoJson(rawGeoJson);
        }

        fetchGeoJson();
    }, [previewResponse, Geojson]);

    const projectAsset = previewResponse?.projectAsset;
    const mimetype = projectAsset?.mimetype;

    if (
        isDefined(projectAsset)
            && (
                mimetype === ImageGif
                    || mimetype === ImagePng
                    || mimetype === ImageJpeg
            )
    ) {
        const {
            file: {
                url,
                name,
            },
        } = projectAsset;

        return (
            <div className={className}>
                <img
                    className={_cs(styles.image, rendererClassName)}
                    src={url}
                    alt={name}
                />
            </div>
        );
    }

    if (mimetype === Geojson || isDefined(geoJsonTileServer)) {
        return (
            <div className={className}>
                <GeoJsonPreview
                    className={_cs(styles.geoJson, rendererClassName)}
                    // FIXME: We need to also add a validation
                    geoJson={geoJson as unknown as GeoJSON.FeatureCollection}
                    baseTileServer={geoJsonTileServer}
                />
            </div>
        );
    }

    return (
        <div className={className}>
            <div className={styles.noPreview}>
                Preview not available!
            </div>
        </div>
    );
}

export default ProjectAssetPreview;
