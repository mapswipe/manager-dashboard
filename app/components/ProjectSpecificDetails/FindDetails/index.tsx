import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import GridLayoutItem from '#components/GridLayoutItem';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import {
    ProjectSpecificDetailsQuery,
    RasterTileServerNameEnum,
} from '#generated/types/graphql';
import ProjectAssetPreview from '#views/EditProject/ProjectAssetPreview';

interface Props {
    data: ProjectSpecificDetailsQuery['project']['projectTypeSpecifics'];
}

function FindDetails(props: Props) {
    const { data } = props;

    // eslint-disable-next-line no-underscore-dangle
    if (isNotDefined(data) || data.__typename !== 'FindProjectPropertyType') {
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
                spacing="xs"
            >
                <TextOutput
                    label="Zoom level"
                    value={data?.zoomLevel}
                />
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
            </ListLayout>
            <GridLayoutItem columnSpan={3}>
                <ProjectAssetPreview
                    assetId={data?.aoiGeometry}
                    geoJsonTileServer={removeNull(data?.tileServerProperty)}
                />
            </GridLayoutItem>
        </ListLayout>
    );
}

export default FindDetails;
