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
import { FillLayerSpecification } from 'maplibre-gl';

import GeoJsonPreview from '#components/domain/GeoJsonPreview';
import Icon from '#components/domain/Icon';
import { PreviewItem } from '#components/domain/TutorialPreviewScreenSelectInput';
import ListLayout from '#components/ListLayout';
import MobilePreview from '#components/MobilePreview';
import {
    ProjectRasterTileServerConfig,
    SubGridSizeEnum,
    TutorialScenarioPageCreateInput,
} from '#generated/types/graphql';
import { subgridSizeToValueMap } from '#utils/common';
import { createSubGridGeoJsonFromTile } from '#utils/geo';

import { PartialCustomOptionInputFields } from '../CustomOptionInput/schema';

import styles from './styles.module.css';

interface Props {
    className?: string;
    tileServerProperty: ProjectRasterTileServerConfig | undefined;
    projectInstruction: string | undefined | null;
    scenario: PartialForm<TutorialScenarioPageCreateInput> | undefined;
    preview: PreviewItem | undefined;
    subgridSize: SubGridSizeEnum | undefined;
    customOptions: PartialCustomOptionInputFields[] | undefined;
}

function LocateObjectScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        projectInstruction,
        tileServerProperty,
        preview,
        subgridSize,
        customOptions,
    } = props;

    // @ts-expect-error potentially wrong typing
    const layerOptions: Omit<FillLayerSpecification, 'id' | 'source'> | undefined = useMemo(() => {
        if (isNotDefined(customOptions)) {
            return undefined;
        }

        const colorAndValueMapping = customOptions.map((option) => ([
            option.value!,
            option.iconColor!,
        ])).flat();

        return {
            type: 'fill',
            paint: {
                // @ts-expect-error potentially wrong typing
                'fill-color': [
                    'match',
                    ['get', 'reference'],
                    ...colorAndValueMapping,
                    'transparent',
                ],
                'fill-outline-color': '#ffffff',
                'fill-opacity': 0.5,
            },
        } satisfies Omit<FillLayerSpecification, 'id' | 'source'>;
    }, [customOptions]);

    const references = useMemo(() => {
        const tasks = scenario?.tasks;
        if (isNotDefined(tasks)) {
            return undefined;
        }

        // createSubGridGeoJsonFromTile maps references positionally onto the
        // row-major sub-grid cells, where cell i corresponds to
        // taskPartitionIndex i. Task order from the server is not guaranteed to
        // match partition order on reload, so we index by taskPartitionIndex
        // rather than rely on the array position.
        const orderedReferences: (number | undefined)[] = [];
        tasks.forEach((task) => {
            if (isDefined(task.taskPartitionIndex)) {
                orderedReferences[task.taskPartitionIndex] = task.reference;
            }
        });

        return orderedReferences;
    }, [scenario?.tasks]);

    const firstTask = scenario?.tasks?.[0];
    const [tileX, tileY, tileZ] = useMemo(() => {
        if (isNotDefined(firstTask)) {
            return [];
        }

        const projectTypeSpecifics = firstTask.projectTypeSpecifics?.locate;

        if (isNotDefined(projectTypeSpecifics)) {
            return [];
        }

        return [
            projectTypeSpecifics.tileX,
            projectTypeSpecifics.tileY,
            projectTypeSpecifics.tileZ,
        ];
    }, [firstTask]);

    const generatedGeojson = useMemo(() => {
        if (isNotDefined(tileX)
            || isNotDefined(tileY)
            || isNotDefined(tileZ)
            || isNotDefined(subgridSize)
        ) {
            return undefined;
        }

        return createSubGridGeoJsonFromTile(
            tileX,
            tileY,
            tileZ,
            subgridSizeToValueMap[subgridSize],
            references,
        );
    }, [tileX, tileY, tileZ, references, subgridSize]);

    const tileServerPropertySafe = useMemo(
        () => removeNull(tileServerProperty),
        [tileServerProperty],
    );

    return (
        <ListLayout
            className={_cs(styles.locateObjectScenarioPreview, className)}
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
                    // NOTE: this should match --size-tile-locate
                    tileSize={320}
                    className={styles.mapContainer}
                    geoJson={generatedGeojson}
                    baseTileServer={tileServerPropertySafe}
                    geoJsonLayerOptions={layerOptions}
                    disablePan
                />
            </MobilePreview>
        </ListLayout>
    );
}

export default LocateObjectScenarioPreview;
