import {
    useEffect,
    useState,
} from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import GeoJsonPreview from '#components/GeoJsonPreview';
import {
    ProjectAssetMimetypeEnum,
    ProjectAssetPreviewQuery,
    ProjectAssetPreviewQueryVariables,
} from '#generated/types/graphql';

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

interface Props {
    className?: string;
    assetId: string;
    geoJsonImageryServerUrl?: string;
    geoJsonImageryCredits?: string;
}

function ProjectAssetPreview(props: Props) {
    const {
        className: classNameFromProps,
        assetId,
        geoJsonImageryServerUrl,
        geoJsonImageryCredits,
    } = props;

    const [geoJson, setGeoJson] = useState<object | undefined>();

    const {
        data: previewResponse,
    } = useQuery<ProjectAssetPreviewQuery, ProjectAssetPreviewQueryVariables>(
        PROJECT_ASSET_PREVIEW,
        {
            variables: {
                assetId,
            },
            skip: isNotDefined(assetId),
        },
    );

    const className = _cs(styles.projectAssetPreview, classNameFromProps);
    const {
        ImageGif,
        ImagePng,
        ImageJpeg,
        Geojson,
    } = ProjectAssetMimetypeEnum;

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

    if (isNotDefined(previewResponse)) {
        return (
            <div className={className}>
                <div className={styles.noPreview}>
                    Preview not available!
                </div>
            </div>
        );
    }

    const {
        projectAsset: {
            file: {
                url,
                name,
            },
            mimetype,
        },
    } = previewResponse;

    if (mimetype === ImageGif
        || mimetype === ImagePng
        || mimetype === ImageJpeg
    ) {
        return (
            <div className={className}>
                <img
                    className={styles.image}
                    src={url}
                    alt={name}
                />
            </div>
        );
    }

    if (mimetype === Geojson) {
        return (
            <div className={className}>
                <GeoJsonPreview
                    className={styles.geoJson}
                    // FIXME: We need to also add a validation
                    geoJson={geoJson as unknown as GeoJSON.GeoJSON}
                    url={geoJsonImageryServerUrl}
                    attribution={geoJsonImageryCredits}
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
