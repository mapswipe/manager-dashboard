import {
    PiArchive,
    PiCheckCircle,
    PiChecks,
    PiCloudCheck,
    PiFileText,
    PiHourglassMedium,
    PiPauseCircle,
    PiTrash,
    PiWarningCircle,
} from 'react-icons/pi';
import { isNotDefined } from '@togglecorp/fujs';

import { ProjectStatusEnum } from '#generated/types/graphql';

interface Props {
    className?: string;
    value: ProjectStatusEnum | undefined | null;
}

function ProjectStatusIcon(props: Props) {
    const {
        value,
        className,
    } = props;

    if (isNotDefined(value)) {
        return null;
    }

    if (value === ProjectStatusEnum.Draft) {
        return <PiFileText className={className} />;
    }

    if (value === ProjectStatusEnum.ReadyToProcess) {
        return <PiHourglassMedium className={className} />;
    }

    if (value === ProjectStatusEnum.Processed) {
        return <PiCheckCircle className={className} />;
    }

    if (value === ProjectStatusEnum.ProcessingFailed) {
        return <PiWarningCircle className={className} />;
    }

    if (value === ProjectStatusEnum.Discarded) {
        return <PiTrash className={className} />;
    }

    if (value === ProjectStatusEnum.ReadyToPublish) {
        return <PiHourglassMedium className={className} />;
    }

    if (value === ProjectStatusEnum.PublishingFailed) {
        return <PiWarningCircle className={className} />;
    }

    if (value === ProjectStatusEnum.Published) {
        return <PiCloudCheck className={className} />;
    }

    if (value === ProjectStatusEnum.Paused) {
        return <PiPauseCircle className={className} />;
    }

    if (value === ProjectStatusEnum.Withdrawn) {
        return <PiArchive className={className} />;
    }

    if (value === ProjectStatusEnum.Finished) {
        return <PiChecks className={className} />;
    }

    value satisfies never;

    return null;
}

export default ProjectStatusIcon;
