import {
    useMemo,
    useState,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import { LineLayerSpecification } from 'maplibre-gl';

import GeoJsonPreview from '#components/GeoJsonPreview';
import MobilePreview from '#components/MobilePreview';
import { ProjectRasterTileServerConfig } from '#generated/types/graphql';
import { iconMap } from '#utils/icon';

import PreviewSegmentInput, { PreviewItem } from '../PreviewSegmentInput';
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
    lookFor: string | undefined;
    scenario: PartialScenarioPageInputFields | undefined;
}

function ValidateScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        tileServerProperty,
        lookFor,
    } = props;

    const [preview, setPreview] = useState<PreviewItem | undefined>();

    const generatedGeojson = useMemo<GeoJSON.FeatureCollection>(() => {
        const features: Array<GeoJSON.Feature> = scenario?.tasks?.map((task) => {
            if (isNotDefined(task.projectTypeSpecifics?.validate?.objectGeometry)) {
                return undefined;
            }

            return {
                type: 'Feature' as const,
                geometry: JSON.parse(task.projectTypeSpecifics?.validate?.objectGeometry),
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

    const Icon = preview?.icon ? iconMap[preview.icon] : undefined;

    return (
        <div className={_cs(styles.validateScenarioPreview, className)}>
            <MobilePreview
                heading={lookFor || '{look for}'}
                headerDescription="You are looking for:"
                popupIcons={Icon && <Icon />}
                popupTitle={preview?.title || '{title}'}
                popupDescription={preview?.description || '{description}'}
                contentClassName={styles.content}
            >
                <GeoJsonPreview
                    className={styles.mapContainer}
                    geoJson={generatedGeojson}
                    baseTileServer={removeNull(tileServerProperty)}
                    geoJsonLayerOptions={layerOptions}
                />
            </MobilePreview>
            <PreviewSegmentInput
                scenario={scenario}
                onPreviewChange={setPreview}
            />
        </div>
    );
}

export default ValidateScenarioPreview;
