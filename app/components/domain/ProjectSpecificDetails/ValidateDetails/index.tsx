import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import ProjectAssetPreview from '#components/domain/ProjectAssetPreview';
import TextOutput from '#components/TextOutput';
import { ValidateProjectPropertyType } from '#generated/types/graphql';

interface Props {
    data: ValidateProjectPropertyType | undefined;
}

function ValidateDetails(props: Props) {
    const { data } = props;

    if (isNotDefined(data) || isNotDefined(data.objectSource)) {
        return null;
    }

    return (
        <>
            <TextOutput
                label="Source type"
                value={data?.objectSource.sourceType}
            />
            <ProjectAssetPreview
                assetId={removeNull(data?.objectSource.aoiGeometry)}
                geoJsonTileServer={removeNull(data?.tileServerProperty)}
            />
        </>
    );
}

export default ValidateDetails;
