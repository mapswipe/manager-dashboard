import { _cs } from '@togglecorp/fujs';
import {
    PathOptions,
    StyleFunction,
} from 'leaflet';

import GeoJsonPreview from '#components/GeoJsonPreview';
import MobilePreview from '#components/MobilePreview';
import { TutorialScenarioIconEnum } from '#generated/types/graphql';
import { iconMap } from '#utils/icon';
import {
    FindTutorialGeoJson,
    FindTutorialProperties,
} from '#views/TutorialForm/utils';

import styles from './styles.module.css';

interface Props {
    className?: string;
    geoJson: FindTutorialGeoJson | undefined;
    previewPopUp?: {
        title?: string;
        description?: string;
        icon?: TutorialScenarioIconEnum;
    }
    url: string | undefined;
    lookFor: string | undefined;
}

const previewStyles: StyleFunction<FindTutorialProperties> = (feature) => {
    const buildAreaPreviewStylesobject: PathOptions = {
        color: '#ffffff',
        stroke: true,
        weight: 0.5,
        fillOpacity: 0.2,
    };
    if (!feature) {
        return buildAreaPreviewStylesobject;
    }
    const referenceColorMap: Record<number, string> = {
        0: 'transparent',
        1: 'green',
        2: 'yellow',
        3: 'red',
    };
    const ref = feature.properties.reference;
    return {
        ...buildAreaPreviewStylesobject,
        fillColor: referenceColorMap[ref] || 'transparent',
    };
};

function BuildAreaGeoJsonPreview(props: Props) {
    const {
        className,
        geoJson,
        previewPopUp,
        url,
        lookFor,
    } = props;

    const Icon = previewPopUp?.icon ? iconMap[previewPopUp.icon] : undefined;

    return (
        <MobilePreview
            className={_cs(styles.scenarioGeoJsonPreview, className)}
            heading={lookFor || '{look for}'}
            headingLabel="You are looking for:"
            popupIcons={Icon && <Icon />}
            popupTitle={previewPopUp?.title || '{title}'}
            popupDescription={previewPopUp?.description || '{description}'}
            contentClassName={styles.content}
        >
            <GeoJsonPreview
                className={styles.mapContainer}
                geoJson={geoJson}
                url={url}
                previewStyle={previewStyles}
            />
        </MobilePreview>
    );
}

export default BuildAreaGeoJsonPreview;
