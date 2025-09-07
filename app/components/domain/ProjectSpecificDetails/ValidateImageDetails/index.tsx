import { useContext } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import Container from '#components/Container';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import EnumsContext from '#contexts/EnumsContext';
import { ValidateImageProjectPropertyType } from '#generated/types/graphql';

interface Props {
    data: ValidateImageProjectPropertyType | undefined;
}

function ValidateImageDetails(props: Props) {
    const { data } = props;

    const { validateImageSourceTypeMapping } = useContext(EnumsContext);

    if (isNotDefined(data) || isNotDefined(data.sourceType)) {
        return null;
    }

    return (
        <ListLayout layout="block">
            <TextOutput
                label="Source type"
                value={validateImageSourceTypeMapping?.[data.sourceType].label}
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
    );
}

export default ValidateImageDetails;
