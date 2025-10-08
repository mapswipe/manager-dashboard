import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    PartialForm,
    removeNull,
} from '@togglecorp/toggle-form';
import { FillLayerSpecification } from 'maplibre-gl';

import GeoJsonPreview from '#components/domain/GeoJsonPreview';
import Icon from '#components/domain/Icon';
import { PreviewItem } from '#components/domain/TutorialPreviewScreenSelectInput';
import ListLayout from '#components/ListLayout';
import MobilePreview from '#components/MobilePreview';
import {
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
    projectInstruction: string | undefined | null;
    scenario: PartialForm<TutorialScenarioPageCreateInput> | undefined;
    preview: PreviewItem | undefined;
}

function FindScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        projectInstruction,
        tileServerProperty,
        preview,
    } = props;

    const generatedGeojson = useMemo(() => {
        const tiles = scenario?.tasks?.map((task) => ({
            tileX: task.projectTypeSpecifics?.find?.tileX,
            tileY: task.projectTypeSpecifics?.find?.tileY,
            tileZ: task.projectTypeSpecifics?.find?.tileZ,
            reference: task.reference,
        }));

        return createGeoJsonFromTiles(tiles);
    }, [scenario]);

    return (
        <ListLayout
            className={_cs(styles.findScenarioPreview, className)}
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
                    // NOTE: this should match --tile-size
                    tileSize={180}
                    className={styles.mapContainer}
                    geoJson={generatedGeojson}
                    baseTileServer={removeNull(tileServerProperty)}
                    geoJsonLayerOptions={layerOptions}
                    padding={0}
                    disablePan
                />
            </MobilePreview>
        </ListLayout>
    );
}

export default FindScenarioPreview;
