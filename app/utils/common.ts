import { MarkdownViewProps } from 'react-showdown';
import { isDefined } from '@togglecorp/fujs';

import {
    ProjectTypeEnum,
    ProjectTypeSpecificInput,
} from '#generated/types/graphql';

export const DEFAULT_ALERT_DISMISS_DURATION = 4500;
export const DEFAULT_PAGE_SIZE = 5;
export const DEFAULT_PAGE = 1;

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
    { value: 2, label: '2 items / page' },
    { value: 5, label: '5 items / page' },
    { value: 10, label: '10 items / page' },
    { value: 20, label: '20 items / page' },
    { value: 50, label: '50 items / page' },
    { value: 100, label: '100 items / page' },
];

export function imageryUrlCondition(value: string | null | undefined) {
    if (!value) {
        return undefined;
    }

    if (value.includes('{quadkey}')) {
        return undefined;
    }

    if (
        value.includes('{z}')
        && value.includes('{x}')
        && (value.includes('{y}') || value.includes('{-y}'))
    ) {
        return undefined;
    }
    return 'Imagery url must contain {x}, {y} (or {-y}) & {z} placeholders or {quadkey} placeholder.';
}

export const projectTypeToKeyMap: Record<ProjectTypeEnum, keyof(ProjectTypeSpecificInput)> = {
    [ProjectTypeEnum.Find]: 'find',
    [ProjectTypeEnum.Compare]: 'compare',
    [ProjectTypeEnum.Completeness]: 'completeness',
    [ProjectTypeEnum.Validate]: 'validate',
    [ProjectTypeEnum.ValidateImage]: 'validateImage',
};

interface NumericValueOption {
    value: number;
    label: string;
}

interface StringValueOption {
    value: string;
    label: string;
}

export const colorOptions: StringValueOption[] = [
    {
        value: '#ffffff',
        label: 'White',
    },
    {
        value: '#000000',
        label: 'Black',
    },
    {
        value: '#ff0000',
        label: 'Red',
    },
    {
        value: '#00ff00',
        label: 'Green',
    },
    {
        value: '#0000ff',
        label: 'Blue',
    },
];

export const opacityOptions: NumericValueOption[] = [
    {
        value: 0.25,
        label: '25%',
    },
    {
        value: 0.5,
        label: '50%',
    },
    {
        value: 0.75,
        label: '75%',
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
];
