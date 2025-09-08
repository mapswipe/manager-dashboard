import { PiInfo } from 'react-icons/pi';
import { isNotDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import PopupButton from '#components/PopupButton';
import TextOutput from '#components/TextOutput';
import { ProjectType } from '#generated/types/graphql';

type ProjectAdditionalInputFields = Pick<
ProjectType,
'verificationNumber'
| 'groupSize'
| 'maxTasksPerUser'
>

interface Props {
    value: ProjectAdditionalInputFields | undefined;
}

function ProjectTaskDetails(props: Props) {
    const {
        value,
    } = props;

    if (isNotDefined(value)) {
        return null;
    }

    return (
        <Container
            heading="Task details"
            headingLevel={5}
            contentLayout="block"
            spacing="sm"
        >
            <TextOutput
                label="Verification number"
                value={value.verificationNumber}
                valueType="number"
                withCenterAlign
                description={(
                    <PopupButton
                        label={<PiInfo />}
                        withoutDropdownIcon
                        styleVariant="transparent"
                        withoutPadding
                    >
                        How many people do you want to see every
                        tile before you consider it finished?
                        (default is 3 - more is recommended for harder tasks,
                        but this will also make project take longer)
                    </PopupButton>
                )}
            />
            <TextOutput
                label="Group size"
                value={value.groupSize}
                valueType="number"
                withCenterAlign
                description={(
                    <PopupButton
                        label={<PiInfo />}
                        withoutDropdownIcon
                        styleVariant="transparent"
                        withoutPadding
                    >
                        How big should a mapping session be?
                        Group size refers to the number of tasks per mapping session.
                    </PopupButton>
                )}
            />
            <TextOutput
                label="Max tasks per user"
                value={value.maxTasksPerUser}
                valueType="number"
                withCenterAlign
                description={(
                    <PopupButton
                        label={<PiInfo />}
                        withoutDropdownIcon
                        styleVariant="transparent"
                        withoutPadding
                    >
                        How many tasks each user is allowed to work on for this project.
                        Empty indicates that no limit is set.
                    </PopupButton>
                )}
            />
        </Container>
    );
}

export default ProjectTaskDetails;
