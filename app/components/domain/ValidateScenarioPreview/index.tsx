import {
    useMemo,
    useState,
} from 'react';
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
import InlineLayout from '#components/InlineLayout';
import ListLayout from '#components/ListLayout';
import MobilePreview from '#components/MobilePreview';
import {
    ProjectRasterTileServerConfig,
    TutorialScenarioPageCreateInput,
} from '#generated/types/graphql';

import TutorialPreviewScreenSelectInput, { PreviewItem } from '../TutorialPreviewScreenSelectInput';

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
    customOptions: PartialCustomOptionInputFields[] | undefined;
    scenario: PartialForm<TutorialScenarioPageCreateInput> | undefined;
}

function ValidateScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        tileServerProperty,
        projectInstruction,
        customOptions,
    } = props;

    const [preview, setPreview] = useState<PreviewItem | undefined>();

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
            <InlineLayout withCenteredContent>
                <TutorialPreviewScreenSelectInput
                    scenario={scenario}
                    onPreviewChange={setPreview}
                />
            </InlineLayout>
        </ListLayout>
    );
}

export default ValidateScenarioPreview;
