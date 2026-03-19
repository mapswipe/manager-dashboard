import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import Container from '#components/Container';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import ProjectAssetPreview from '#components/domain/ProjectAssetPreview';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import { StreetProjectPropertyType } from '#generated/types/graphql';

interface Props {
    data: StreetProjectPropertyType | undefined;
}

function StreetDetails(props: Props) {
    const { data } = props;

    if (isNotDefined(data)) {
        return null;
    }

    return (
        <>
            <ListLayout layout="grid">
                <ProjectAssetPreview
                    assetId={data.aoiGeometry}
                />
                <Container
                    headingLevel={5}
                    heading="Custom options"
                >
                    <CustomOptionPreview
                        value={removeNull(data.customOptions)}
                        variant="info"
                    />
                </Container>
            </ListLayout>
            <Container
                heading="Street-level Image Filters"
                headingLevel={5}
            >
                <ListLayout
                    layout="grid"
                    spacing="sm"
                >
                    <TextOutput
                        label="Start date"
                        value={data.mapillaryImageFilters.startTime}
                    />
                    <TextOutput
                        label="End date"
                        value={data.mapillaryImageFilters.endTime}
                    />
                    <TextOutput
                        label="Image Creator ID"
                        value={data.mapillaryImageFilters.creatorId}
                    />
                    <TextOutput
                        label="Organization ID"
                        value={data.mapillaryImageFilters.organizationId}
                    />
                    <TextOutput
                        label="Image Sampling Threshold"
                        value={data.mapillaryImageFilters.samplingThreshold}
                        valueType="number"
                    />
                </ListLayout>
                <ListLayout
                    layout="block"
                    spacing="sm"
                >
                    <TextOutput
                        label="Only use 360 degree panaroma images"
                        value={data.mapillaryImageFilters.panoOnly}
                        valueType="boolean"
                    />
                    <TextOutput
                        label="Randomize the order of images in the project"
                        value={data.mapillaryImageFilters.randomizeOrder}
                        valueType="boolean"
                    />
                </ListLayout>
                <ListLayout
                    layout="block"
                    spacing="sm"
                >
                    <TextOutput
                        label="Image provider name"
                        value={data.imageProvider?.name}
                        valueType="text"
                    />
                    {data.imageProvider?.url && (
                        <TextOutput
                            label="Panoramax API URL"
                            value={data.imageProvider.url}
                            valueType="text"
                        />
                    )}
                </ListLayout>
            </Container>
        </>
    );
}

export default StreetDetails;
