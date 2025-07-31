import { isNotDefined } from '@togglecorp/fujs';

export interface FindTutorialProperties {
    group_id: number;
    reference: number;
    screen: number;
    task_id: number;
    tile_x: number;
    tile_y: number;
    tile_z: number;
}

export type FindTutorialGeoJson = GeoJSON.FeatureCollection<
    GeoJSON.Geometry,
    FindTutorialProperties
>;

export function validateFindTutorialGeoJson(
    geoJson: unknown,
): geoJson is FindTutorialGeoJson {
    if (typeof geoJson !== 'object' || isNotDefined(geoJson)) {
        return false;
    }

    if (!('features' in geoJson) || !Array.isArray(geoJson.features)) {
        return false;
    }

    const hasInvalidFeature = geoJson.features.some((feature) => {
        if (
            !('type' in feature)
                || feature.type !== 'Feature'
                || !('geometry' in feature)
                || !('properties' in feature)
                || !Array.isArray(feature.properties)
        ) {
            return false;
        }

        return feature.properties.some((property: unknown) => (
            typeof property !== 'object'
                || isNotDefined(property)
                || !('group_id' in property)
                || typeof property.group_id !== 'number'
                || !('reference' in property)
                || typeof property.reference !== 'number'
                || !('screen' in property)
                || typeof property.screen !== 'number'
                || !('task_id' in property)
                || typeof property.task_id !== 'number'
                || !('tile_x' in property)
                || typeof property.tile_x !== 'number'
                || !('tile_y' in property)
                || typeof property.tile_y !== 'number'
                || !('tile_z' in property)
                || typeof property.tile_z !== 'number'
        ));
    });

    if (hasInvalidFeature) {
        return false;
    }

    return true;
}
