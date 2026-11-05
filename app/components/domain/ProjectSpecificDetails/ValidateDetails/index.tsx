import {
    useContext,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import Container from '#components/Container';
import DefaultMapContainer from '#components/DefaultMapContainer';
import BaseMap from '#components/domain/BaseMap';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import GeoJsonAssetMapSource from '#components/domain/GeoJsonAssetMapSource';
import RasterTileServerOutput from '#components/domain/RasterTileServerOutput';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import EnumsContext from '#contexts/EnumsContext';
import { ValidateProjectPropertyType } from '#generated/types/graphql';

interface Props {
    data: ValidateProjectPropertyType | undefined;
    defaultBounds: GeoJSON.Polygon | undefined | null;
}

function ValidateDetails(props: Props) {
    const {
        data,
        defaultBounds,
    } = props;

    const { validateObjectSourceTypeMapping } = useContext(EnumsContext);

    const preEventTileServer = useMemo(
        () => removeNull(data?.preEventTileServerProperty),
        [data?.preEventTileServerProperty],
    );
    const tileServer = useMemo(
        () => removeNull(data?.tileServerProperty),
        [data?.tileServerProperty],
    );

    if (isNotDefined(data) || isNotDefined(data.objectSource)) {
        return null;
    }

    return (
        <>
            <TextOutput
                label="Source type"
                value={validateObjectSourceTypeMapping?.[data.objectSource.sourceType].label}
            />
            {isDefined(data.objectSource.taskingManagerProjectId) && (
                <TextOutput
                    label="HOT Tasking Manager ID"
                    value={data.objectSource.taskingManagerProjectId}
                />
            )}
            {isDefined(data.objectSource.objectGeojsonUrl) && (
                <TextOutput
                    label="Object GeoJSON URL"
                    value={data.objectSource.objectGeojsonUrl}
                />
            )}
            {isDefined(data.objectSource.ohsomeFilter) && (
                <TextOutput
                    label="Ohsome filter"
                    value={data.objectSource.ohsomeFilter}
                />
            )}
            {data.hasPreImagery && isDefined(data.preEventTileServerProperty) && (
                <ListLayout layout="grid">
                    <BaseMap
                        baseTileServer={preEventTileServer}
                        withSavedZoomRange
                        disablePan
                    >
                        <DefaultMapContainer />
                        <GeoJsonAssetMapSource
                            geoJsonAssetId={removeNull(data.objectSource.aoiGeometry)}
                            defaultBounds={defaultBounds}
                            zoomLevel={undefined}
                            withPadding
                        />
                    </BaseMap>
                    <RasterTileServerOutput
                        heading="Pre-event tile server"
                        value={data.preEventTileServerProperty}
                        withSavedZoomRange
                        withPadding
                        withHeaderBorder
                    />
                </ListLayout>
            )}
            <ListLayout layout="grid">
                <BaseMap
                    baseTileServer={tileServer}
                    withSavedZoomRange
                    disablePan={data.hasPreImagery}
                >
                    <DefaultMapContainer />
                    <GeoJsonAssetMapSource
                        geoJsonAssetId={removeNull(data.objectSource.aoiGeometry)}
                        defaultBounds={defaultBounds}
                        zoomLevel={undefined}
                        withPadding
                    />
                </BaseMap>
                <RasterTileServerOutput
                    heading={data.hasPreImagery ? 'Post-event tile server' : undefined}
                    value={data.tileServerProperty}
                    withSavedZoomRange
                    withPadding
                    withHeaderBorder
                />
            </ListLayout>
            <Container
                headingLevel={5}
                heading="Custom options"
            >
                <CustomOptionPreview
                    value={removeNull(data?.customOptions)}
                    variant="info"
                />
            </Container>
        </>
    );
}

export default ValidateDetails;
