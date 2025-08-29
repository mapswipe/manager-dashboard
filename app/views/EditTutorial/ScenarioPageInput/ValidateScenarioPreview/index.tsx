import { useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import { LineLayerSpecification } from 'maplibre-gl';

import { PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import GeoJsonPreview from '#components/domain/GeoJsonPreview';
import Icon from '#components/domain/Icon';
import MobilePreview from '#components/MobilePreview';
import { ProjectRasterTileServerConfig } from '#generated/types/graphql';

import { PartialScenarioPageInputFields } from '../schema';

import styles from './styles.module.css';

const layerOptions: Omit<LineLayerSpecification, 'id' | 'source'> = {
    type: 'line',
    paint: {
        'line-color': '#ffffff',
        'line-width': 2,
        'line-dasharray': [3, 3],
        'line-opacity': 0.8,
    },
};

interface Props {
    className?: string;
    tileServerProperty: ProjectRasterTileServerConfig | undefined;
    projectInstruction: string | undefined | null;
    scenario: PartialScenarioPageInputFields | undefined;
    customOptions: PartialCustomOptionInputFields[] | undefined;
}

function ValidateScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        tileServerProperty,
        projectInstruction,
        customOptions,
    } = props;

    const generatedGeojson = useMemo<GeoJSON.FeatureCollection>(() => {
        const features: Array<GeoJSON.Feature> = scenario?.tasks?.map((task) => {
            if (isNotDefined(task.projectTypeSpecifics?.validate?.objectGeometry)) {
                return undefined;
            }

            return {
                type: 'Feature' as const,
                geometry: JSON.parse(task.projectTypeSpecifics.validate.objectGeometry),
                properties: {
                    reference: task.reference,
                },
            };
        }).filter(isDefined) ?? [];

        return {
            type: 'FeatureCollection' as const,
            features,
        };
    }, [scenario]);

    return (
        <div className={_cs(styles.validateScenarioPreview, className)}>
            <MobilePreview
                heading={projectInstruction}
                popupIcons={<Icon value={scenario?.instructionsIcon} />}
                popupTitle={scenario?.instructionsTitle || '{title}'}
                popupDescription={scenario?.instructionsDescription || '{description}'}
                contentClassName={styles.content}
            >
                <GeoJsonPreview
                    // NOTE tiles size must match css varialbe --size-tile-validate
                    tileSize={320}
                    className={styles.mapContainer}
                    geoJson={generatedGeojson}
                    baseTileServer={removeNull(tileServerProperty)}
                    geoJsonLayerOptions={layerOptions}
                    fitInSingleTile
                />
                <CustomOptionPreview
                    value={customOptions}
                />
            </MobilePreview>
        </div>
    );
}

export default ValidateScenarioPreview;
