import { isNotDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import Container from '#components/Container';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import ListLayout from '#components/ListLayout';
import { ValidateImageProjectPropertyType } from '#generated/types/graphql';

interface Props {
    data: ValidateImageProjectPropertyType | undefined;
}

function ValidateImageDetails(props: Props) {
    const { data } = props;

    if (isNotDefined(data)) {
        return null;
    }

    return (
        <ListLayout layout="block">
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
