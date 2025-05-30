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
import {
    PathOptions,
    StyleFunction,
} from 'leaflet';

import GeoJsonPreview from '#components/GeoJsonPreview';
import MobilePreview from '#components/MobilePreview';
import { ProjectTileServerConfig } from '#generated/types/graphql';
import { iconMap } from '#utils/icon';
import { getTileServerUrlAndCredits } from '#views/EditProject/UpdateProjectForm/TileServerInput/schema';

import PreviewSegmentInput, { PreviewItem } from '../PreviewSegmentInput';
import { PartialScenarioPageInputFields } from '../schema';

import styles from './styles.module.css';

interface ValidateTutorialProperties {
    reference: number;
}

const previewStyles: StyleFunction<ValidateTutorialProperties> = () => {
    const validatePreviewStylesObject: PathOptions = {
        color: '#ffffff',
        stroke: true,
        weight: 2,
        dashArray: '3',
        fill: false,
        opacity: 0.8,
    };

    return validatePreviewStylesObject;
};

interface Props {
    className?: string;
    tileServerProperty: ProjectTileServerConfig | undefined;
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

    const tileServerConfig = getTileServerUrlAndCredits(removeNull(tileServerProperty));

    const generatedGeojson = useMemo<GeoJSON.GeoJSON>(() => {
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
                    url={tileServerConfig?.url}
                    attribution={tileServerConfig?.credits}
                    previewStyle={previewStyles}
                    padding={[130, 130]}
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
