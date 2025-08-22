import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import Container from '#components/Container';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import ProjectAssetPreview from '#components/domain/ProjectAssetPreview';
import GridLayoutItem from '#components/GridLayoutItem';
import ListLayout from '#components/ListLayout';
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
        <ListLayout
            layout="grid"
            numPreferredGridColumns={4}
            minGridColumnSize="9rem"
        >
            <ListLayout layout="block">
                <TextOutput
                    label="Source type"
                    value={data?.objectSource.sourceType}
                />
                <Container
                    headingLevel={6}
                    heading="Custom options"
                >
                    <CustomOptionPreview
                        value={removeNull(data?.customOptions)}
                        variant="info"
                    />
                </Container>
            </ListLayout>
            <GridLayoutItem columnSpan={3}>
                <ProjectAssetPreview
                    assetId={removeNull(data?.objectSource.aoiGeometry)}
                    geoJsonTileServer={removeNull(data?.tileServerProperty)}
                />
            </GridLayoutItem>
        </ListLayout>
    );
}

export default ValidateDetails;
