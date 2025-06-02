import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import TextOutput from '#components/TextOutput';
import { CompletenessProjectPropertyType } from '#generated/types/graphql';
import ProjectAssetPreview from '#views/EditProject/ProjectAssetPreview';

interface Props {
    data: CompletenessProjectPropertyType | undefined;
}

function CompletenessDetails(props: Props) {
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

export default CompletenessDetails;
