import {
    PiArchive,
    PiCloudCheck,
    PiFileText,
    PiHourglassMedium,
    PiTrash,
    PiWarningCircle,
} from 'react-icons/pi';
import { isNotDefined } from '@togglecorp/fujs';

import { TutorialStatusEnum } from '#generated/types/graphql';

interface Props {
    className?: string;
    value: TutorialStatusEnum | undefined | null;
}

function TutorialStatusIcon(props: Props) {
    const {
        value,
        className,
    } = props;

    if (isNotDefined(value)) {
        return null;
    }

    if (value === TutorialStatusEnum.Draft) {
        return <PiFileText className={className} />;
    }

    if (value === TutorialStatusEnum.ReadyToPublish) {
        return <PiHourglassMedium className={className} />;
    }

    if (value === TutorialStatusEnum.Published) {
        return <PiCloudCheck className={className} />;
    }

    if (value === TutorialStatusEnum.PublishingFailed) {
        return <PiWarningCircle className={className} />;
    }

    if (value === TutorialStatusEnum.Archived) {
        return <PiArchive className={className} />;
    }

    if (value === TutorialStatusEnum.Discarded) {
        return <PiTrash className={className} />;
    }

    value satisfies never;

    return null;
}

export default TutorialStatusIcon;
