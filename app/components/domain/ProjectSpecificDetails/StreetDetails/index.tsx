import { useContext } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import Container from '#components/Container';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import ProjectAssetPreview from '#components/domain/ProjectAssetPreview';
import { streetImageProviderToConfigKey } from '#components/domain/StreetImageProviderInput/schema';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import EnumsContext from '#contexts/EnumsContext';
import {
    StreetImageProviderEnum,
    StreetProjectPropertyType,
} from '#generated/types/graphql';

interface Props {
    data: StreetProjectPropertyType | undefined;
}

function StreetDetails(props: Props) {
    const { data } = props;
    const { streetImageProviderMapping } = useContext(EnumsContext);

    if (isNotDefined(data)) {
        return null;
    }

    const filters = data[streetImageProviderToConfigKey[data.provider]];

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
                heading="Street-level imagery provider"
                headingLevel={5}
            >
                <ListLayout
                    layout="block"
                    spacing="sm"
                >
                    <TextOutput
                        label="Image provider"
                        value={streetImageProviderMapping?.[data.provider]?.label}
                        valueType="text"
                    />
                    {(
                        data.provider === StreetImageProviderEnum.PanoramaxCustom
                        && data.panoramaxCustom?.url
                    ) && (
                        <TextOutput
                            label="Panoramax instance URL"
                            value={data.panoramaxCustom.url}
                            valueType="text"
                        />
                    )}
                </ListLayout>
            </Container>
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
                        value={filters?.startTime}
                    />
                    <TextOutput
                        label="End date"
                        value={filters?.endTime}
                    />
                    <TextOutput
                        label="Image Creator ID"
                        value={filters?.creatorId}
                    />
                    {data.provider === StreetImageProviderEnum.Mapillary && (
                        <TextOutput
                            label="Organization ID"
                            value={data.mapillary?.organizationId}
                        />
                    )}
                    <TextOutput
                        label="Image Sampling Threshold"
                        value={filters?.samplingThreshold}
                        valueType="number"
                        unit="meter"
                    />
                </ListLayout>
                <ListLayout
                    layout="block"
                    spacing="sm"
                >
                    <TextOutput
                        label="Only use 360 degree panorama images"
                        value={filters?.panoOnly}
                        valueType="boolean"
                    />
                    <TextOutput
                        label="Randomize the order of images in the project"
                        value={filters?.randomizeOrder}
                        valueType="boolean"
                    />
                </ListLayout>
            </Container>
        </>
    );
}

export default StreetDetails;
