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
    useTutorialAssetPreviewQuery,
} from '#generated/types/graphql';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tutorial_ASSET_PREVIEW = gql`
query TutorialAssetPreview($assetId: ID!) {
    tutorialAsset(id: $assetId) {
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

function TutorialAssetPreview(props: Props) {
    const {
        className: classNameFromProps,
        rendererClassName,
        assetId,
        geoJsonTileServer,
    } = props;

    const [geoJson, setGeoJson] = useState<object | undefined>();

    const [{
        data: previewResponse,
    }] = useTutorialAssetPreviewQuery({
        variables: {
            assetId: assetId ?? '',
        },
        pause: isNotDefined(assetId),
    });

    const className = _cs(styles.tutorialAssetPreview, classNameFromProps);
    const {
        ImageGif,
        ImagePng,
        ImageJpeg,
        Geojson,
    } = AssetMimetypeEnum;

    useEffect(() => {
        async function fetchGeoJson() {
            if (
                isNotDefined(previewResponse)
                || previewResponse.tutorialAsset.mimetype !== Geojson
            ) {
                return;
            }

            fetch(previewResponse.tutorialAsset.file.url)
                .then((geoJsonResponse) => {
                    if (!geoJsonResponse.ok) {
                        throw new Error('Failed to fetch GeoJSON file.');
                    }
                    return geoJsonResponse.json();
                })
                .then((rawGeoJson) => {
                    // TODO: validate
                    setGeoJson(rawGeoJson);
                })
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error('Error fetching GeoJSON:', error);
                    setGeoJson(undefined);
                });
        }
        fetchGeoJson();
    }, [previewResponse, Geojson]);

    const tutorialAsset = previewResponse?.tutorialAsset;
    const mimetype = tutorialAsset?.mimetype;

    if (
        isDefined(tutorialAsset)
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
        } = tutorialAsset;

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
                    className={rendererClassName}
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

export default TutorialAssetPreview;
