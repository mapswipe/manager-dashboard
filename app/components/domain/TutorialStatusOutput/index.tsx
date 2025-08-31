import { useContext } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import EnumsContext from '#base/context/EnumsContext';
import InlineLayout from '#components/InlineLayout';
import { TutorialStatusEnum } from '#generated/types/graphql';
import { SpacingType } from '#utils/styles';

import TutorialStatusIcon from '../TutorialStatusIcon';

interface Props {
    className?: string;
    spacing?: SpacingType;
    value: TutorialStatusEnum | undefined | null;
}

function TutorialStatusOutput(props: Props) {
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
            start={<TutorialStatusIcon value={value} />}
            spacingOffset={-2}
            withCenterAlign
        >
            {projectStatusMapping?.[value].label}
        </InlineLayout>
    );
}

export default TutorialStatusOutput;
