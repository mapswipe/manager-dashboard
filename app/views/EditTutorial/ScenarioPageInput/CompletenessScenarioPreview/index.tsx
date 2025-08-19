import {
    useMemo,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import { MapContainer } from '@togglecorp/re-map';
import {
    PartialForm,
    removeNull,
} from '@togglecorp/toggle-form';

import BaseMap from '#components/domain/BaseMap';
import GeoJsonMapSource from '#components/domain/GeoJsonMapSource';
import Icon from '#components/domain/Icon';
import VectorTileMapSource from '#components/domain/VectorTileMapSource';
import MobilePreview from '#components/MobilePreview';
import {
    ProjectOverlayTileServerConfig,
    ProjectRasterTileServerConfig,
} from '#generated/types/graphql';
import { createGeoJsonFromTiles } from '#utils/geo';

import PreviewSegmentInput, { PreviewItem } from '../PreviewSegmentInput';
import { PartialScenarioPageInputFields } from '../schema';

import styles from './styles.module.css';

interface Props {
    className?: string;
    tileServerProperty: ProjectRasterTileServerConfig | undefined;
    overlayTileServerProperty: PartialForm<ProjectOverlayTileServerConfig> | undefined;
    lookFor: string | undefined;
    scenario: PartialScenarioPageInputFields | undefined;
}

function CompletenessScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        lookFor,
        tileServerProperty,
        overlayTileServerProperty,
    } = props;

    const [preview, setPreview] = useState<PreviewItem | undefined>();

    const generatedGeojson = useMemo(() => {
        const tiles = scenario?.tasks?.map((task) => ({
            tileX: task.projectTypeSpecifics?.completeness?.tileX,
            tileY: task.projectTypeSpecifics?.completeness?.tileY,
            tileZ: task.projectTypeSpecifics?.completeness?.tileZ,
            reference: task.reference,
        }));

        return createGeoJsonFromTiles(tiles);
    }, [scenario]);

    return (
        <div className={_cs(styles.completenessScenarioPreview, className)}>
            <MobilePreview
                heading="You are looking for:"
                headerDescription={lookFor || '{look for}'}
                popupIcons={<Icon value={preview?.icon} />}
                popupTitle={preview?.title || '{title}'}
                popupDescription={preview?.description || '{description}'}
                contentClassName={styles.content}
            >
                <BaseMap baseTileServer={removeNull(tileServerProperty)}>
                    <MapContainer
                        className={styles.mapContainer}
                    />
                    <GeoJsonMapSource
                        geoJson={generatedGeojson as GeoJSON.FeatureCollection}
                        sourceKey="completeness-geojson-source"
                        layerKey="completeness-geojson-layer"
                    />
                    <VectorTileMapSource
                        tileConfig={removeNull(overlayTileServerProperty?.vector)}
                    />
                    {/* TODO: overlay for raster */}
                </BaseMap>
            </MobilePreview>
            <PreviewSegmentInput
                scenario={scenario}
                onPreviewChange={setPreview}
            />
        </div>
    );
}

export default CompletenessScenarioPreview;
