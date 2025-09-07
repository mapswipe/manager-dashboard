import { useContext } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import InlineLayout from '#components/InlineLayout';
import EnumsContext from '#contexts/EnumsContext';
import { ProjectStatusEnum } from '#generated/types/graphql';
import { SpacingType } from '#utils/styles';

import ProjectStatusIcon from '../ProjectStatusIcon';

interface Props {
    className?: string;
    spacing?: SpacingType;
    value: ProjectStatusEnum | undefined | null;
}

function ProjectStatusOutput(props: Props) {
    const {
        value,
        className,
        spacing,
    } = props;
    const { projectStatusMapping } = useContext(EnumsContext);

    if (isNotDefined(value)) {
        return null;
    }

    return (
        <InlineLayout
            className={className}
            spacing={spacing}
            start={<ProjectStatusIcon value={value} />}
            spacingOffset={-2}
            withCenterAlign
        >
            {projectStatusMapping?.[value].label}
        </InlineLayout>
    );
}

export default ProjectStatusOutput;
