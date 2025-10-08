import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { MapContainer } from '@togglecorp/re-map';
import {
    PartialForm,
    removeNull,
} from '@togglecorp/toggle-form';
import { type } from 'arktype';
import { FillLayerSpecification } from 'maplibre-gl';

import BaseMap from '#components/domain/BaseMap';
import GeoJsonMapSource from '#components/domain/GeoJsonMapSource';
import Icon from '#components/domain/Icon';
import RasterTileMapSource from '#components/domain/RasterTileMapSource';
import { PreviewItem } from '#components/domain/TutorialPreviewScreenSelectInput';
import VectorTileMapSource from '#components/domain/VectorTileMapSource';
import MobilePreview from '#components/MobilePreview';
import {
    ProjectOverlayRasterTileServerConfig,
    ProjectOverlayTileServerConfig,
    ProjectOverlayVectorTileServerConfig,
    ProjectRasterTileServerConfig,
    TutorialScenarioPageCreateInput,
} from '#generated/types/graphql';
import { createGeoJsonFromTiles } from '#utils/geo';

import styles from './styles.module.css';

const layerOptions: Omit<FillLayerSpecification, 'id' | 'source'> = {
    type: 'fill',
    paint: {
        'fill-color': [
            'match',
            ['get', 'reference'],
            1,
            'green',
            2,
            'yellow',
            3,
            'red',
            'transparent',
        ],
        'fill-outline-color': '#ffffff',
        'fill-opacity': 0.2,
    },
};

interface Props {
    className?: string;
    tileServerProperty: ProjectRasterTileServerConfig | undefined;
    overlayTileServerProperty: PartialForm<ProjectOverlayTileServerConfig> | undefined;
    projectInstruction: string | undefined | null;
    scenario: PartialForm<TutorialScenarioPageCreateInput> | undefined;
    preview: PreviewItem | undefined;
}

function CompletenessScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        projectInstruction,
        tileServerProperty,
        overlayTileServerProperty,
        preview,
    } = props;

    const generatedGeojson = useMemo(() => {
        const tiles = scenario?.tasks?.map((task) => ({
            tileX: task.projectTypeSpecifics?.completeness?.tileX,
            tileY: task.projectTypeSpecifics?.completeness?.tileY,
            tileZ: task.projectTypeSpecifics?.completeness?.tileZ,
            reference: task.reference,
        }));

        return createGeoJsonFromTiles(tiles);
    }, [scenario]);

    const rasterTileConfigValue = type.object.as<ProjectOverlayRasterTileServerConfig>()(
        overlayTileServerProperty?.raster,
    );

    const vectorTileConfigValue = type.object.as<ProjectOverlayVectorTileServerConfig>()(
        overlayTileServerProperty?.vector,
    );

    return (
        <div className={_cs(styles.completenessScenarioPreview, className)}>
            <MobilePreview
                heading={projectInstruction}
                popupIcons={<Icon value={preview?.icon} />}
                popupTitle={preview?.title || '{title}'}
                popupDescription={preview?.description || '{description}'}
                contentClassName={styles.content}
            >
                <BaseMap
                    baseTileServer={removeNull(tileServerProperty)}
                    disablePan
                >
                    <MapContainer
                        className={styles.mapContainer}
                    />
                    {!(vectorTileConfigValue instanceof type.errors) && (
                        <VectorTileMapSource
                            tileConfig={vectorTileConfigValue}
                        />
                    )}
                    {!(rasterTileConfigValue instanceof type.errors) && (
                        <RasterTileMapSource
                            tileConfig={rasterTileConfigValue}
                        />
                    )}
                    <GeoJsonMapSource
                        geoJson={generatedGeojson as GeoJSON.FeatureCollection}
                        sourceKey="completeness-geojson-source"
                        layerKey="completeness-geojson-layer"
                        layerOptions={layerOptions}
                    />
                </BaseMap>
            </MobilePreview>
        </div>
    );
}

export default CompletenessScenarioPreview;
