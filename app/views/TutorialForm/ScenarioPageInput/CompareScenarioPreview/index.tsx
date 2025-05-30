import {
    useMemo,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import {
    PathOptions,
    StyleFunction,
} from 'leaflet';

import GeoJsonPreview from '#components/GeoJsonPreview';
import MobilePreview from '#components/MobilePreview';
import { ProjectTileServerConfig } from '#generated/types/graphql';
import { createGeoJsonFromTiles } from '#utils/geo';
import { iconMap } from '#utils/icon';
import { getTileServerUrlAndCredits } from '#views/EditProject/UpdateProjectForm/TileServerInput/schema';

import PreviewSegmentInput, { PreviewItem } from '../PreviewSegmentInput';
import { PartialScenarioPageInputFields } from '../schema';

import styles from './styles.module.css';

interface CompareTutorialProperties {
    reference: number;
}

const previewStyles: StyleFunction<CompareTutorialProperties> = (feature) => {
    const comparePreviewStylesObject: PathOptions = {
        color: '#ffffff',
        stroke: true,
        weight: 0.5,
        fillOpacity: 0.2,
    };
    if (!feature) {
        return comparePreviewStylesObject;
    }
    const referenceColorMap: Record<number, string> = {
        0: 'transparent',
        1: 'green',
        2: 'yellow',
        3: 'red',
    };
    const ref = feature.properties.reference;
    return {
        ...comparePreviewStylesObject,
        fillColor: referenceColorMap[ref] || 'transparent',
    };
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

    const tileServerConfig = getTileServerUrlAndCredits(removeNull(tileServerProperty));
    const tileServerBConfig = getTileServerUrlAndCredits(removeNull(tileServerBProperty));

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
            >
                <GeoJsonPreview
                    className={styles.mapContainer}
                    geoJson={generatedGeojson}
                    url={tileServerConfig?.url}
                    attribution={tileServerConfig?.credits}
                    previewStyle={previewStyles}
                />
                <GeoJsonPreview
                    className={styles.mapContainer}
                    geoJson={generatedGeojson}
                    url={tileServerBConfig?.url}
                    attribution={tileServerBConfig?.credits}
                    previewStyle={previewStyles}
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
