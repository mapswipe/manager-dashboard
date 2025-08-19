import { isNotDefined } from '@togglecorp/fujs';

import { IconEnum } from '#generated/types/graphql';
import { iconMapping } from '#utils/icon';

interface Props {
    className?: string;
    value: IconEnum | undefined | null;
}

function Icon(props: Props) {
    const {
        className,
        value,
    } = props;

    if (isNotDefined(value)) {
        return null;
    }

    const IconElement = iconMapping[value];

    return (
        <IconElement
            className={className}
        />
    );
}

export default Icon;
