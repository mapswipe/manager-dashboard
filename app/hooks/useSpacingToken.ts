import {
    useEffect,
    useState,
} from 'react';
import {
    bound,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';

export type SpacingType = 'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type SpacingMode = 'row-gap' | 'column-gap' | 'padding-inline' | 'padding-block';

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

            const spacingTokens = [
                '0',
                'var(--spacing-2xs)',
                'var(--spacing-xs)',
                'var(--spacing-sm)',
                'var(--spacing-md)',
                'var(--spacing-lg)',
                'var(--spacing-xl)',
                'var(--spacing-2xl)',
            ] as const;

            const spacingTypeToStartIndexMap: Record<SpacingType, number> = {
                none: 0,
                '2xs': 1,
                xs: 2,
                sm: 3,
                md: 4,
                lg: 5,
                xl: 6,
                '2xl': 7,
            };

            const startIndex = bound(
                spacingTypeToStartIndexMap[spacing] + offset,
                0,
                spacingTokens.length - 1,
            );

            const spacingValue = spacingTokens[
                bound(
                    startIndex,
                    0,
                    spacingTokens.length - 1,
                )
            ];

            const style = document.createElement('style');
            document.head.appendChild(style);
            if (!style.sheet) {
                style.remove();
                return undefined;
            }

            const rules = modes.map((mode) => (
                `${mode}: ${spacingValue}`
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
