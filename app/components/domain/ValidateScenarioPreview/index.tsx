import { useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    PartialForm,
    removeNull,
} from '@togglecorp/toggle-form';
import { LineLayerSpecification } from 'maplibre-gl';

import { PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import GeoJsonPreview from '#components/domain/GeoJsonPreview';
import Icon from '#components/domain/Icon';
import ListLayout from '#components/ListLayout';
import MobilePreview from '#components/MobilePreview';
import {
    ProjectRasterTileServerConfig,
    TutorialScenarioPageCreateInput,
} from '#generated/types/graphql';

import { PreviewItem } from '../TutorialPreviewScreenSelectInput';

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
    preEventTileServerProperty?: ProjectRasterTileServerConfig | null;
    projectInstruction: string | undefined | null;
    customOptions: PartialCustomOptionInputFields[] | undefined;
    scenario: PartialForm<TutorialScenarioPageCreateInput> | undefined;
    preview: PreviewItem | undefined;
}

function ValidateScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        tileServerProperty,
        preEventTileServerProperty,
        projectInstruction,
        customOptions,
        preview,
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

    const panes = useMemo(() => {
        const hasPreEvent = isDefined(preEventTileServerProperty);
        return [
            hasPreEvent
                ? {
                    key: 'pre',
                    label: 'Before',
                    tileServer: removeNull(preEventTileServerProperty),
                }
                : undefined,
            {
                key: 'post',
                label: hasPreEvent ? 'After' : undefined,
                tileServer: removeNull(tileServerProperty),
            },
        ].filter(isDefined);
    }, [preEventTileServerProperty, tileServerProperty]);

    return (
        <ListLayout
            className={_cs(styles.validateScenarioPreview, className)}
            layout="block"
        >
            <MobilePreview
                heading={projectInstruction}
                popupIcons={<Icon value={preview?.icon} />}
                popupTitle={preview?.title || '{title}'}
                popupDescription={preview?.description || '{description}'}
                popupVariant={preview?.popupVariant}
                popupVerticalPosition="inline"
                contentClassName={styles.content}
            >
                <div className={styles.panes}>
                    {panes.map((pane) => (
                        <div
                            key={pane.key}
                            className={styles.pane}
                        >
                            <GeoJsonPreview
                                tileSize={280}
                                className={styles.paneMap}
                                geoJson={generatedGeojson}
                                baseTileServer={pane.tileServer}
                                geoJsonLayerOptions={layerOptions}
                                fitInSingleTile
                                disablePan
                            />
                            {isDefined(pane.label) && (
                                <div className={styles.paneLabel}>
                                    {pane.label}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <CustomOptionPreview
                    value={customOptions}
                />
            </MobilePreview>
        </ListLayout>
    );
}

export default ValidateScenarioPreview;
