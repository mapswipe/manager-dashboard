import { MarkdownViewProps } from 'react-showdown';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import {
    ProjectTypeEnum,
    ProjectTypeSpecificInput,
} from '#generated/types/graphql';

export const DEFAULT_ALERT_DISMISS_DURATION = 4500;
export const DEFAULT_PAGE_SIZE = 5;
export const DEFAULT_PAGE = 1;

export const OPACITY_TILE_SELECTED = 0.2;

export const COLOR_TILE_OPTION_NO = '';
export const COLOR_TILE_OPTION_YES = 'green';
export const COLOR_TILE_OPTION_MAYBE = 'orange';
export const COLOR_TILE_OPTION_BAD_IMAGERY = 'red';

export const VALUE_TILE_OPTION_NO = 0;
export const VALUE_TILE_OPTION_YES = 1;
export const VALUE_TILE_OPTION_MAYBE = 2;
export const VALUE_TILE_OPTION_BAD_IMAGERY = 3;

export interface TileSelectOption {
    value: number,
    label: string;
    color: string;
}

export const defaultTileOptions: TileSelectOption[] = [
    {
        value: VALUE_TILE_OPTION_NO,
        label: 'No',
        color: COLOR_TILE_OPTION_NO,
    },
    {
        value: VALUE_TILE_OPTION_YES,
        label: 'Yes',
        color: COLOR_TILE_OPTION_YES,
    },
    {
        value: VALUE_TILE_OPTION_MAYBE,
        label: 'Maybe',
        color: COLOR_TILE_OPTION_MAYBE,
    },
    {
        value: VALUE_TILE_OPTION_BAD_IMAGERY,
        label: 'Bad Imagery',
        color: COLOR_TILE_OPTION_BAD_IMAGERY,
    },
];

export const defaultMarkdownPreviewOptions: MarkdownViewProps['options'] = {
    simpleLineBreaks: true,
    headerLevelStart: 3,
    simplifiedAutoLink: true,
    openLinksInNewWindow: true,
    backslashEscapesHTMLTags: true,
    literalMidWordUnderscores: true,
    strikethrough: true,
    tables: true,
    tasklists: true,
};

export function valueSelector<T>(item: { value: T }) {
    return item.value;
}

export function labelSelector<T>(item: { label: T }) {
    return item.label;
}

export function keySelector<T>(item: { key: T }) {
    return item.key;
}

export function idSelector<T>(item: { id: T }) {
    return item.id;
}

export function nameSelector<T>(item: { name: T }) {
    return item.name;
}

export function getNoMoreThanNCharacterCondition(maxCharacters: number) {
    return (value: string | undefined) => {
        if (!isDefined(value) || value.length <= maxCharacters) {
            return undefined;
        }

        return `Max ${maxCharacters} characters allowed`;
    };
}

// NOTE: We have a similar function in firebase function utils
// firebase/functions/src/utils/index.ts
export const formatProjectTopic = (projectTopic: string) => {
    // Note: this will remove start and end space
    const projectWithoutStartAndEndSpace = projectTopic.trim();

    // Note: this will change multi space to single space
    const removeMultiSpaceToSingle = projectWithoutStartAndEndSpace.replace(/\s+/g, ' ');
    const newProjectTopic = removeMultiSpaceToSingle.toLowerCase();

    return newProjectTopic;
};

export function ymdToDateString(year: number, month: number, day: number) {
    const ys = String(year).padStart(4, '0');
    const ms = String(month + 1).padStart(2, '0');
    const ds = String(day).padStart(2, '0');

    return `${ys}-${ms}-${ds}`;
}

export function dateStringToDate(value: string) {
    return new Date(`${value}T00:00`);
}

export const defaultPagePerItemOptions = [
    // { value: 2, label: '2 items/page' },
    { value: 5, label: '5 items/page' },
    { value: 10, label: '10 items/page' },
    { value: 20, label: '20 items/page' },
];

export function imageryUrlCondition(value: string | null | undefined) {
    if (!value) {
        return undefined;
    }

    if (value.includes('{quad_key}')) {
        return undefined;
    }

    if (
        value.includes('{z}')
        && value.includes('{x}')
        && (value.includes('{y}') || value.includes('{-y}'))
    ) {
        return undefined;
    }
    return 'Imagery url must contain {x}, {y} (or {-y}) & {z} placeholders or {quad_key} placeholder.';
}

export const projectTypeToKeyMap: Record<ProjectTypeEnum, keyof(ProjectTypeSpecificInput)> = {
    [ProjectTypeEnum.Find]: 'find',
    [ProjectTypeEnum.Compare]: 'compare',
    [ProjectTypeEnum.Completeness]: 'completeness',
    [ProjectTypeEnum.Validate]: 'validate',
    [ProjectTypeEnum.ValidateImage]: 'validateImage',
    [ProjectTypeEnum.Street]: 'street',
};

interface NumericValueOption {
    value: number;
    label: string;
}

export interface StringValueOption {
    value: string;
    label: string;
}

export const colorOptions: StringValueOption[] = [
    {
        label: 'Red',
        value: '#f44336',
    },
    {
        label: 'Pink',
        value: '#e91e63',
    },
    {
        label: 'Purple',
        value: '#9c27b0',
    },
    {
        label: 'Deep Purple',
        value: '#673ab7',
    },
    {
        label: 'Indigo',
        value: '#3f51b5',
    },
    {
        label: 'Blue',
        value: '#2196f3',
    },
    {
        label: 'Light Blue',
        value: '#03a9f4',
    },
    {
        label: 'Cyan',
        value: '#00bcd4',
    },
    {
        label: 'Teal',
        value: '#009688',
    },
    {
        label: 'Green',
        value: '#4caf50',
    },
    {
        label: 'Light Green',
        value: '#8bc34a',
    },
    {
        label: 'Lime',
        value: '#cddc39',
    },
    {
        label: 'Yellow',
        value: '#ffeb3b',
    },
    {
        label: 'Amber',
        value: '#ffc107',
    },
    {
        label: 'Orange',
        value: '#ff9800',
    },
    {
        label: 'Deep Orange',
        value: '#ff5722',
    },
    {
        label: 'Brown',
        value: '#795548',
    },
    {
        label: 'Grey',
        value: '#9e9e9e',
    },
    {
        label: 'Blue Grey',
        value: '#607d8b',
    },
    {
        label: 'Black',
        value: '#000000',
    },
    {
        label: 'White',
        value: '#ffffff',
    },
];

export const opacityOptions: NumericValueOption[] = [
    {
        value: 0,
        label: '0%',
    },
    {
        value: 0.1,
        label: '10%',
    },
    {
        value: 0.2,
        label: '20%',
    },
    {
        value: 0.3,
        label: '30%',
    },
    {
        value: 0.4,
        label: '40%',
    },
    {
        value: 0.5,
        label: '50%',
    },
    {
        value: 0.6,
        label: '60%',
    },
    {
        value: 0.7,
        label: '70%',
    },
    {
        value: 0.8,
        label: '80%',
    },
    {
        value: 0.9,
        label: '90%',
    },
    {
        value: 1,
        label: '100%',
    },
];

export const lineWidthOptions: NumericValueOption[] = [
    {
        value: 1,
        label: '1',
    },
    {
        value: 2,
        label: '2',
    },
    {
        value: 3,
        label: '3',
    },
    {
        value: 4,
        label: '4',
    },
    {
        value: 5,
        label: '5',
    },
];

export function readFileAsText(inputFile: File): Promise<string> {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException('Problem parsing input file.'));
        };

        temporaryFileReader.onload = () => {
            if (typeof temporaryFileReader.result === 'string') {
                resolve(temporaryFileReader.result);
            } else {
                reject(new DOMException('Problem parsing input file as string.'));
            }
        };

        temporaryFileReader.readAsText(inputFile);
    });
}

function getMaximumFractionDigits(value: number) {
    if (value < 1000) {
        return 2;
    }

    const formatter = new Intl.NumberFormat('default', { notation: 'compact' });
    const formattedParts = formatter.formatToParts(value);
    const fraction = formattedParts.find(({ type }) => type === 'fraction');

    if (isNotDefined(fraction) || isFalsyString(fraction.value)) {
        return 0;
    }

    if (Number(fraction.value) > 0.1) {
        return 1;
    }

    return 0;
}

export interface FormatNumberOptions {
    currency?: boolean;
    unit?: Intl.NumberFormatOptions['unit'];
    maximumFractionDigits?: Intl.NumberFormatOptions['maximumFractionDigits'];
    compact?: boolean;
    separatorHidden?: boolean,
    language?: string,
    prefix?: string,
    suffix?: string,
}

export function formatNumber(
    value: null | undefined,
    options?: FormatNumberOptions,
): undefined
export function formatNumber(
    value: number | null | undefined,
    options?: FormatNumberOptions,
): undefined
export function formatNumber(
    value: number,
    options?: FormatNumberOptions,
): string
export function formatNumber(
    value: number | null | undefined,
    options?: FormatNumberOptions,
) {
    if (isNotDefined(value)) {
        return undefined;
    }

    const formattingOptions: Intl.NumberFormatOptions = {};

    if (isNotDefined(options)) {
        formattingOptions.maximumFractionDigits = getMaximumFractionDigits(value);
        return new Intl.NumberFormat('default', formattingOptions).format(value);
    }

    const {
        currency,
        unit,
        maximumFractionDigits,
        compact,
        separatorHidden,
        language,
        suffix,
        prefix,
    } = options;

    if (isTruthyString(unit)) {
        if (unit in Intl.supportedValuesOf('unit')) {
            formattingOptions.unit = unit;
            formattingOptions.unitDisplay = 'short';
            formattingOptions.style = 'unit';
        } else {
            // eslint-disable-next-line no-console
            console.error('Unsupported unit', unit);
        }
    }
    if (currency) {
        formattingOptions.currencyDisplay = 'narrowSymbol';
        formattingOptions.style = 'currency';
    }
    if (compact) {
        formattingOptions.notation = 'compact';
        formattingOptions.compactDisplay = 'short';
    }

    formattingOptions.useGrouping = !separatorHidden;

    if (isDefined(maximumFractionDigits)) {
        formattingOptions.maximumFractionDigits = maximumFractionDigits;
    } else {
        formattingOptions.maximumFractionDigits = getMaximumFractionDigits(value);
    }

    const newValue = new Intl.NumberFormat(language, formattingOptions)
        .format(value);

    return [
        prefix,
        newValue,
        suffix,
    ].filter(isDefined).join('');
}

export type ZoomLeveOption = {
    value: number;
    label: string;
    description: string;
    // Meter per pixel
    scale: number;
    // Single tile sqkm
    area: number;
};

export const zoomLevelOptions: ZoomLeveOption[] = [
    {
        value: 10, label: 'Town View', description: 'Towns, small cities', scale: 152, area: 1500,
    },
    {
        value: 11, label: 'Neighborhood View', description: 'Urban neighborhoods', scale: 76, area: 400,
    },
    {
        value: 12, label: 'Street View', description: 'Street-level navigation', scale: 38, area: 100,
    },
    {
        value: 13, label: 'Local Street View', description: 'Blocks, parks, schools', scale: 19, area: 25,
    },
    {
        value: 14, label: 'Sub-Street View', description: 'Individual buildings', scale: 9.5, area: 5,
    },
    {
        value: 15, label: 'Block View', description: 'Detailed house blocks, parking lots', scale: 4.8, area: 1.5,
    },
    {
        value: 16, label: 'Building View', description: 'Houses, small buildings', scale: 2.4, area: 0.4,
    },
    {
        value: 17, label: 'Property View', description: 'Property boundaries, driveways, fences', scale: 1.2, area: 0.1,
    },
    {
        value: 18, label: 'Pedestrian View', description: 'Sidewalks, individual trees, cars', scale: 0.6, area: 0.025,
    },
    {
        value: 19, label: 'Front Door View', description: 'Doors, benches, small features', scale: 0.3, area: 0.0064,
    },
    {
        value: 20, label: 'Close-up View', description: 'People, signs, textures', scale: 0.15, area: 0.0016,
    },
    {
        value: 21, label: 'Detailed Ground View', description: 'Pavement cracks, survey markers', scale: 0.075, area: 0.0004,
    },
    {
        value: 22, label: 'Surveying View', description: 'Ultra-fine — blueprints, floorplans', scale: 0.037, area: 0.0001,
    },
];

export function hasSomeDefinedValue(item: unknown) {
    if (isNotDefined(item)) {
        return false;
    }

    if (typeof item === 'boolean') {
        return true;
    }

    if (typeof item === 'number') {
        return !Number.isNaN(item);
    }

    if (typeof item === 'string') {
        return isTruthyString(item.trim());
    }

    if (Array.isArray(item)) {
        if (item.length === 0) {
            return false;
        }

        return item.some(hasSomeDefinedValue);
    }

    if (typeof item === 'object') {
        if (!item) {
            return false;
        }

        return Object.values(item).some(hasSomeDefinedValue);
    }

    return false;
}

export function removeEmptyList<T>(list: T[] | undefined | null) {
    if (isDefined(list) && list.length === 0) {
        return undefined;
    }
    return list;
}

export function getInstruction(
    instruction: string | null | undefined,
    lookFor: string | null | undefined,
    projectType: ProjectTypeEnum | null | undefined,
) {
    if (isNotDefined(instruction) && isNotDefined(lookFor)) {
        return '??';
    }

    if (isDefined(instruction)) {
        return instruction;
    }

    const fallbackInstruction = (projectType === ProjectTypeEnum.Validate
        || projectType === ProjectTypeEnum.ValidateImage)
        ? `Does the shape outline ${lookFor}?`
        : `You are looking for ${lookFor}`;

    return fallbackInstruction;
}

