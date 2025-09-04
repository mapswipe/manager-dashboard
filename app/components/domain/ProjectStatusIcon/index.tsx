import {
    PiArchive,
    PiCheckCircle,
    PiCloudCheck,
    PiExclamationMark,
    PiFileText,
    PiHourglassMedium,
    PiPauseCircle,
    PiTrash,
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

    if (value === ProjectStatusEnum.MarkedAsReady) {
        return <PiHourglassMedium className={className} />;
    }

    if (value === ProjectStatusEnum.Ready) {
        return <PiCheckCircle className={className} />;
    }

    if (value === ProjectStatusEnum.Failed) {
        return <PiExclamationMark className={className} />;
    }

    if (value === ProjectStatusEnum.Paused) {
        return <PiPauseCircle className={className} />;
    }

    if (value === ProjectStatusEnum.Archived) {
        return <PiArchive className={className} />;
    }

    if (value === ProjectStatusEnum.Discarded) {
        return <PiTrash className={className} />;
    }

    if (value === ProjectStatusEnum.Published) {
        return <PiCloudCheck className={className} />;
    }

    value satisfies never;

    return null;
}

export default ProjectStatusIcon;
