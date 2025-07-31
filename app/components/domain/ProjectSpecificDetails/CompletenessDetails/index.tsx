import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import Container from '#components/Container';
import DefaultMapContainer from '#components/DefaultMapContainer';
import BaseMap from '#components/domain/BaseMap';
import GeoJsonAssetMapSource from '#components/domain/GeoJsonAssetMapSource';
import VectorTileMapSource from '#components/domain/VectorTileMapSource';
import GridLayoutItem from '#components/GridLayoutItem';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import {
    ProjectSpecificDetailsQuery,
    RasterTileServerNameEnum,
} from '#generated/types/graphql';

interface Props {
    data: ProjectSpecificDetailsQuery['project']['projectTypeSpecifics'];
}

function CompletenessDetails(props: Props) {
    const { data } = props;

    // eslint-disable-next-line no-underscore-dangle
    if (isNotDefined(data) || data.__typename !== 'CompletenessProjectPropertyType') {
        return null;
    }

    return (
        <ListLayout
            layout="grid"
            numPreferredGridColumns={4}
            minGridColumnSize="9rem"
        >
            <ListLayout
                layout="block"
            >
                <TextOutput
                    label="Zoom level"
                    value={data?.zoomLevel}
                />
                <Container
                    heading="Base tile"
                    headingLevel={6}
                    spacing="sm"
                >
                    <TextOutput
                        label="Tile Server"
                        value={data?.tileServerProperty.name}
                    />
                    {data.tileServerProperty.name === RasterTileServerNameEnum.Custom && (
                        <TextOutput
                            label="Custom URL"
                            value={data?.tileServerProperty.custom?.url}
                        />
                    )}
                </Container>
                <Container
                    heading="Overlay tile"
                    headingLevel={6}
                    spacing="sm"
                >
                    <TextOutput
                        label="Type"
                        value={data?.overlayTileServerProperty.type}
                    />
                </Container>
            </ListLayout>
            <GridLayoutItem columnSpan={3}>
                <BaseMap baseTileServer={removeNull(data.tileServerProperty)}>
                    <DefaultMapContainer />
                    <VectorTileMapSource
                        tileConfig={removeNull(data.overlayTileServerProperty.vector)}
                    />
                    <GeoJsonAssetMapSource
                        geoJsonAssetId={data.aoiGeometry}
                        zoomLevel={data.zoomLevel}
                    />
                </BaseMap>
            </GridLayoutItem>
        </ListLayout>
    );
}

export default CompletenessDetails;
