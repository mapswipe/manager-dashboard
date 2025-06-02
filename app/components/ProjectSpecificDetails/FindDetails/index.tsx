import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import TextOutput from '#components/TextOutput';
import { FindProjectPropertyType } from '#generated/types/graphql';
import ProjectAssetPreview from '#views/EditProject/ProjectAssetPreview';

interface Props {
    data: FindProjectPropertyType | undefined;
}

function FindDetails(props: Props) {
    const { data } = props;

    if (isNotDefined(data)) {
        return null;
    }

    return (
        <>
            <TextOutput
                label="Zoom level"
                value={data?.zoomLevel}
            />
            <ProjectAssetPreview
                assetId={data?.aoiGeometry}
                geoJsonTileServer={removeNull(data?.tileServerProperty)}
            />
        </>
    );
}

export default FindDetails;
