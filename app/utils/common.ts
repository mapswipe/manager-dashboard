import { joinUrlPart } from '#base/utils/routes';
import { isDefined } from '@togglecorp/fujs';

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

export type ProjectInputType = 'aoi_file' | 'link' | 'TMId';
export type ProjectStatus = 'private_active' | 'private_inactive' | 'active' | 'inactive' | 'finished' | 'archived' | 'tutorial';
export const PROJECT_TYPE_BUILD_AREA = 1;
export const PROJECT_TYPE_FOOTPRINT = 2;
export const PROJECT_TYPE_CHANGE_DETECTION = 3;
export const PROJECT_TYPE_COMPLETENESS = 4;
export const PROJECT_TYPE_STREET = 7;

export type ProjectType = 1 | 2 | 3 | 4 | 7;

export const projectTypeLabelMap: {
    [key in ProjectType]: string
} = {
    [PROJECT_TYPE_BUILD_AREA]: 'Find',
    [PROJECT_TYPE_FOOTPRINT]: 'Validate',
    [PROJECT_TYPE_CHANGE_DETECTION]: 'Compare',
    [PROJECT_TYPE_COMPLETENESS]: 'Completeness',
    [PROJECT_TYPE_STREET]: 'Street',
};

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

export function getFullAssetUrl(url: string) {
    const gqlPath = '/graphql';
    const serverUrl = import.meta.env.REACT_APP_GRAPHQL_API_ENDPOINT.replace(gqlPath, '');

    return joinUrlPart(serverUrl, url);
}
