import {
    useMemo,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import { FillLayerSpecification } from 'maplibre-gl';

import GeoJsonPreview from '#components/GeoJsonPreview';
import MobilePreview from '#components/MobilePreview';
import { ProjectTileServerConfig } from '#generated/types/graphql';
import { createGeoJsonFromTiles } from '#utils/geo';
import { iconMap } from '#utils/icon';

import PreviewSegmentInput, { PreviewItem } from '../PreviewSegmentInput';
import { PartialScenarioPageInputFields } from '../schema';

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
    tileServerProperty: ProjectTileServerConfig | undefined;
    tileServerBProperty: ProjectTileServerConfig | undefined;
    lookFor: string | undefined;
    scenario: PartialScenarioPageInputFields | undefined;
}

function CompareScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        lookFor,
        tileServerProperty,
        tileServerBProperty,
    } = props;

    const [preview, setPreview] = useState<PreviewItem | undefined>();

    const generatedGeojson = useMemo(() => {
        const tiles = scenario?.tasks?.map((task) => ({
            tileX: task.projectTypeSpecifics?.compare?.tileX,
            tileY: task.projectTypeSpecifics?.compare?.tileY,
            tileZ: task.projectTypeSpecifics?.compare?.tileZ,
            reference: task.reference,
        }));

        return createGeoJsonFromTiles(tiles);
    }, [scenario]);

    const Icon = preview?.icon ? iconMap[preview.icon] : undefined;

    return (
        <div className={_cs(styles.compareScenarioPreview, className)}>
            <MobilePreview
                heading={lookFor || '{look for}'}
                headerDescription="You are looking for:"
                popupIcons={Icon && <Icon />}
                popupTitle={preview?.title || '{title}'}
                popupDescription={preview?.description || '{description}'}
                popupVerticalPosition="center"
                contentClassName={styles.previewContent}
            >
                <GeoJsonPreview
                    className={styles.mapContainer}
                    geoJson={generatedGeojson as GeoJSON.FeatureCollection}
                    baseTileServer={removeNull(tileServerProperty)}
                    geoJsonLayerOptions={layerOptions}
                    padding={0}
                />
                <GeoJsonPreview
                    className={styles.mapContainer}
                    geoJson={generatedGeojson as GeoJSON.FeatureCollection}
                    baseTileServer={removeNull(tileServerBProperty)}
                    geoJsonLayerOptions={layerOptions}
                    padding={0}
                />
            </MobilePreview>
            <PreviewSegmentInput
                scenario={scenario}
                onPreviewChange={setPreview}
            />
        </div>
    );
}

export default CompareScenarioPreview;
