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

interface CompletenessTutorialProperties {
    reference: number;
}

const previewStyles: StyleFunction<CompletenessTutorialProperties> = (feature) => {
    const completenessPreviewStylesObject: PathOptions = {
        color: '#ffffff',
        stroke: true,
        weight: 0.5,
        fillOpacity: 0.2,
    };
    if (!feature) {
        return completenessPreviewStylesObject;
    }
    const referenceColorMap: Record<number, string> = {
        0: 'transparent',
        1: 'green',
        2: 'yellow',
        3: 'red',
    };
    const ref = feature.properties.reference;
    return {
        ...completenessPreviewStylesObject,
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

function CompletenessScenarioPreview(props: Props) {
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
            tileX: task.projectTypeSpecifics?.completeness?.tileX,
            tileY: task.projectTypeSpecifics?.completeness?.tileY,
            tileZ: task.projectTypeSpecifics?.completeness?.tileZ,
            reference: task.reference,
        }));

        return createGeoJsonFromTiles(tiles);
    }, [scenario]);

    const Icon = preview?.icon ? iconMap[preview.icon] : undefined;

    return (
        <div className={_cs(styles.completenessScenarioPreview, className)}>
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
                    url={tileServerConfig?.url}
                    attribution={tileServerConfig?.credits}
                    previewStyle={previewStyles}
                />
                <GeoJsonPreview
                    className={_cs(styles.mapContainer, styles.overlay)}
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

export default CompletenessScenarioPreview;
