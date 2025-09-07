import { useContext } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import InlineLayout from '#components/InlineLayout';
import EnumsContext from '#contexts/EnumsContext';
import { ProjectTypeEnum } from '#generated/types/graphql';
import { SpacingType } from '#utils/styles';

import ProjectTypeIcon from '../ProjectTypeIcon';

interface Props {
    value: ProjectTypeEnum | undefined | null;
    spacing?: SpacingType;
}

function ProjectTypeOutput(props: Props) {
    const {
        value,
        spacing,
    } = props;

    const { projectTypeMapping } = useContext(EnumsContext);

    if (isNotDefined(value)) {
        return null;
    }

    return (
        <InlineLayout
            start={<ProjectTypeIcon type={value} />}
            spacingOffset={-2}
            spacing={spacing}
            withCenterAlign
        >
            {projectTypeMapping?.[value].label}
        </InlineLayout>
    );
}

export default ProjectTypeOutput;
