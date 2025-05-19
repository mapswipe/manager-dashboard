import { isDefined } from '@togglecorp/fujs';

import { joinUrlPart } from '#base/utils/routes';
import { TileServerNameEnum } from '#generated/types/graphql';

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

export function getFullAssetUrl(url: string) {
    const gqlPath = '/graphql';
    const serverUrl = import.meta.env.REACT_APP_GRAPHQL_API_ENDPOINT.replace(gqlPath, '');

    return joinUrlPart(serverUrl, url);
}

const BING_KEY = import.meta.env.REACT_APP_BING_API_KEY;
const MAPBOX_KEY = import.meta.env.REACT_APP_MAPBOX_API_KEY;
const MAXAR_PREMIUM = import.meta.env.REACT_APP_MAXAR_PREMIUM_API_KEY;
const MAXAR_STANDARD = import.meta.env.REACT_APP_MAXAR_STANDARD_API_KEY;

export const tileServerUrls: {
    [key in Exclude<TileServerNameEnum, 'CUSTOM'>]: string;
} = {
    [TileServerNameEnum.Bing]: `https://ecn.t0.tiles.virtualearth.net/tiles/a{quad_key}.jpeg?g=7505&token=${BING_KEY}`,
    [TileServerNameEnum.Mapbox]: `https://d.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg?access_token=${MAPBOX_KEY}`,
    [TileServerNameEnum.MaxarPremium]: `https://services.digitalglobe.com/earthservice/tmsaccess/tms/1.0.0/DigitalGlobe%3AImageryTileService@EPSG%3A3857@jpg/{z}/{x}/{y}.jpg?connectId=${MAXAR_PREMIUM}`,
    [TileServerNameEnum.MaxarStandard]: `https://services.digitalglobe.com/earthservice/tmsaccess/tms/1.0.0/DigitalGlobe%3AImageryTileService@EPSG%3A3857@jpg/{z}/{x}/{y}.jpg?connectId=${MAXAR_STANDARD}`,
    [TileServerNameEnum.Esri]: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    [TileServerNameEnum.EsriBeta]: 'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

export const tileServerDefaultCredits: Record<Exclude<TileServerNameEnum, 'CUSTOM'>, string> = {
    [TileServerNameEnum.Bing]: '© 2019 Microsoft Corporation, Earthstar Geographics SIO',
    [TileServerNameEnum.MaxarPremium]: '© 2019 Maxar',
    [TileServerNameEnum.MaxarStandard]: '© 2019 Maxar',
    [TileServerNameEnum.Esri]: '© 2019 ESRI',
    [TileServerNameEnum.EsriBeta]: '© 2019 ESRI',
    [TileServerNameEnum.Mapbox]: '© 2019 MapBox',
};

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
