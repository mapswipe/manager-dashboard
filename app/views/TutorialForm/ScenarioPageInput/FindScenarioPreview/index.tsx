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
    PathOptions,
    StyleFunction,
} from 'leaflet';

import GeoJsonPreview from '#components/GeoJsonPreview';
import MobilePreview from '#components/MobilePreview';
import SegmentInput from '#components/SegmentInput';
import {
    keySelector,
    labelSelector,
} from '#utils/common';
import { iconMap } from '#utils/icon';

import { PartialScenarioPageInputFields } from '../schema';

import styles from './styles.module.css';

type PreviewKey = 'instructions' | 'hint' | 'success';

interface PreviewOption {
    key: PreviewKey;
    label: string;
}

const previewOptions: PreviewOption[] = [
    { key: 'instructions', label: 'Instruction' },
    { key: 'hint', label: 'Hint' },
    { key: 'success', label: 'Success' },
];

function tile2lon(x: number, z: number) {
    return (x / (2 ** z)) * 360 - 180;
}

function tile2lat(y: number, z: number) {
    const n = Math.PI - 2 * Math.PI * (y / (2 ** z));
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function createGeoJsonFromTiles(
    tiles: {
        tileX: number | undefined,
        tileY: number | undefined,
        tileZ: number | undefined,
        reference: number | undefined,
    }[] | undefined,
) {
    if (isNotDefined(tiles) || tiles.length === 0) {
        return undefined;
    }

    const geojson: GeoJSON.GeoJSON = {
        type: 'FeatureCollection' as const,
        features: tiles.map((tile) => {
            const {
                tileX,
                tileY,
                tileZ,
                reference,
            } = tile;

            if (isNotDefined(tileX) || isNotDefined(tileY) || isNotDefined(tileZ)) {
                return undefined;
            }

            const west = tile2lon(tileX, tileZ);
            const east = tile2lon(tileX + 1, tileZ);
            const north = tile2lat(tileY, tileZ);
            const south = tile2lat(tileY + 1, tileZ);

            const feature = {
                type: 'Feature' as const,
                geometry: {
                    type: 'Polygon' as const,
                    coordinates: [[
                        [west, south],
                        [east, south],
                        [east, north],
                        [west, north],
                        [west, south],
                    ]],
                },
                properties: {
                    tile_x: tileX,
                    tile_y: tileY,
                    tile_z: tileZ,
                    reference: reference ?? 0,
                },
            };

            return feature;
        }).filter(isDefined),
    };

    return geojson;
}

interface Props {
    className?: string;
    url: string | undefined;
    lookFor: string | undefined;
    scenario: PartialScenarioPageInputFields | undefined;
}

interface FindTutorialProperties {
    reference: number;
}

const previewStyles: StyleFunction<FindTutorialProperties> = (feature) => {
    const findPreviewStylesObject: PathOptions = {
        color: '#ffffff',
        stroke: true,
        weight: 0.5,
        fillOpacity: 0.2,
    };
    if (!feature) {
        return findPreviewStylesObject;
    }
    const referenceColorMap: Record<number, string> = {
        0: 'transparent',
        1: 'green',
        2: 'yellow',
        3: 'red',
    };
    const ref = feature.properties.reference;
    return {
        ...findPreviewStylesObject,
        fillColor: referenceColorMap[ref] || 'transparent',
    };
};

function FindScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        url,
        lookFor,
    } = props;

    const [currentPreview, setCurrentPreview] = useState<PreviewKey>('instructions');

    const generatedGeojson = useMemo(() => {
        const tiles = scenario?.tasks?.map((task) => ({
            tileX: task.projectTypeSpecifics?.find?.tileX,
            tileY: task.projectTypeSpecifics?.find?.tileY,
            tileZ: task.projectTypeSpecifics?.find?.tileZ,
            reference: task.reference,
        }));

        return createGeoJsonFromTiles(tiles);
    }, [scenario]);

    const previewPopUp = useMemo(() => {
        if (isNotDefined(scenario)) {
            return undefined;
        }

        if (currentPreview === 'instructions') {
            return {
                icon: scenario.instructionsIcon,
                title: scenario.instructionsTitle,
                description: scenario.instructionsDescription,
            };
        }

        if (currentPreview === 'hint') {
            return {
                icon: scenario.hintIcon,
                title: scenario.hintTitle,
                description: scenario.hintDescription,
            };
        }

        if (currentPreview === 'success') {
            return {
                icon: scenario.successIcon,
                title: scenario.successTitle,
                description: scenario.successDescription,
            };
        }

        return undefined;
    }, [scenario, currentPreview]);

    const Icon = previewPopUp?.icon ? iconMap[previewPopUp.icon] : undefined;

    return (
        <div className={_cs(styles.findScenarioPreview, className)}>
            <MobilePreview
                heading={lookFor || '{look for}'}
                headingLabel="You are looking for:"
                popupIcons={Icon && <Icon />}
                popupTitle={previewPopUp?.title || '{title}'}
                popupDescription={previewPopUp?.description || '{description}'}
            >
                <GeoJsonPreview
                    className={styles.mapContainer}
                    geoJson={generatedGeojson}
                    url={url}
                    previewStyle={previewStyles}
                />
            </MobilePreview>
            <SegmentInput
                name={undefined}
                value={currentPreview}
                onChange={setCurrentPreview}
                options={previewOptions}
                keySelector={keySelector}
                labelSelector={labelSelector}
            />
        </div>
    );
}

export default FindScenarioPreview;
