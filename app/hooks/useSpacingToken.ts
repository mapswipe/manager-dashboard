import {
    useEffect,
    useState,
} from 'react';
import {
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';

import {
    getOpticallyCorrectedSpacingValue,
    getSpacingValue,
    SpacingMode,
    SpacingType,
} from '#utils/styles';

interface Props {
    spacing?: SpacingType;
    modes?: SpacingMode[];
    offset?: 0;
}

function useSpacingToken(props: Props) {
    const [className] = useState(() => `_${randomString()}`);

    const {
        spacing = 'md',
        modes = ['padding-inline', 'padding-block'],
        offset = 0,
    } = props;

    useEffect(
        () => {
            if (isNotDefined(spacing)) {
                return undefined;
            }

            const spacingValue = getSpacingValue(spacing, offset);

            const style = document.createElement('style');
            document.head.appendChild(style);
            if (!style.sheet) {
                style.remove();
                return undefined;
            }

            const rules = modes.map((mode) => (
                `${mode}: ${getOpticallyCorrectedSpacingValue(spacingValue, mode)}`
            )).join('; ');

            style.sheet.insertRule(`.${className} { ${rules} }`);

            return () => {
                style.remove();
            };
        },
        [spacing, modes, className, offset],
    );

    return className;
}

export default useSpacingToken;
