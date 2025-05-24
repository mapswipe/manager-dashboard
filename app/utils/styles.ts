import { bound } from '@togglecorp/fujs';

export type SpacingType = 'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type SpacingMode = 'row-gap' | 'column-gap' | 'padding-inline' | 'padding-block';

export const gapSpacings: SpacingMode[] = ['row-gap', 'column-gap'];
export const paddingSpacings: SpacingMode[] = ['padding-block', 'padding-inline'];
export const fullSpacings: SpacingMode[] = [
    ...gapSpacings,
    ...paddingSpacings,
];

export function getOpticallyCorrectedSpacingValue(value: string, mode: SpacingMode) {
    // Horizontal padding seems a bit imbalanced
    // due to the gap from the line height in vertical padding
    if (mode === 'padding-inline') {
        return `calc(${value} + (1rem * var(--line-height-md) - 1rem))`;
    }

    return value;
}

export function getSpacingValue(
    spacing: SpacingType = 'md',
    offset: number = 0,
) {
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

    return spacingValue;
}
