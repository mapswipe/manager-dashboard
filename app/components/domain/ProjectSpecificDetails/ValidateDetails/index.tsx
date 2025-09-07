import { useContext } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
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
}

function ValidateDetails(props: Props) {
    const { data } = props;

    const { validateObjectSourceTypeMapping } = useContext(EnumsContext);

    if (isNotDefined(data) || isNotDefined(data.objectSource)) {
        return null;
    }

    return (
        <>
            <TextOutput
                label="Source type"
                value={validateObjectSourceTypeMapping?.[data.objectSource.sourceType].label}
            />
            <ListLayout layout="grid">
                <BaseMap baseTileServer={removeNull(data?.tileServerProperty)}>
                    <DefaultMapContainer />
                    <GeoJsonAssetMapSource
                        // FIXME: show AOI for other types as well
                        geoJsonAssetId={removeNull(data?.objectSource.aoiGeometry)}
                    />
                </BaseMap>
                <RasterTileServerOutput
                    value={data.tileServerProperty}
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
