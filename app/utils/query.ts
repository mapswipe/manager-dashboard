import { gql } from '@apollo/client';

export const TILE_SERVER_PROPERTY_FRAGMENT = gql`
fragment TileServerPropertyFields on ProjectTileServerConfig {
    name
    bing {
        credits
    }
    esri {
        credits
    }
    esriBeta {
        credits
    }
    mapbox {
        credits
    }
    maxarPremium {
        credits
    }
    maxarStandard {
        credits
    }
    custom {
        credits
        url
    }
}
`;

export const VECTOR_TILE_SERVER_PROPERTY_FRAGMENT = gql`
fragment VectorTileServerPropertyFields on ProjectVectorTileServerConfig {
    name
    openFreeMap {
        credits
        sourceName
    }
    openStreetMap {
        credits
        sourceName
    }
    versatiles {
        credits
        sourceName
    }
    custom {
        credits
        sourceName
        url
    }
}
`;

export const PROJECT_TYPE_SPECIFIC_FRAGMENT = gql`
${TILE_SERVER_PROPERTY_FRAGMENT}
${VECTOR_TILE_SERVER_PROPERTY_FRAGMENT}
fragment ProjectTypeSpecificFields on CompareProjectPropertyTypeFindProjectPropertyTypeValidateProjectPropertyTypeCompletenessProjectPropertyType {
    ... on CompareProjectPropertyType {
        aoiGeometry
        zoomLevel
        tileServerProperty {
            ...TileServerPropertyFields
        }
        tileServerBProperty {
            ...TileServerPropertyFields
        }
    }
    ... on FindProjectPropertyType {
        aoiGeometry
        tileServerProperty {
            ...TileServerPropertyFields
        }
        zoomLevel
    }
    ... on CompletenessProjectPropertyType {
        aoiGeometry
        overlayTileServerProperty {
            type
            vector {
                circleColor
                circleOpacity
                circleRadius
                fillColor
                fillOpacity
                lineColor
                lineDasharray
                lineOpacity
                lineWidth
                tileServer {
                    ...VectorTileServerPropertyFields
                }
            }
            raster {
                opacity,
                tileServer {
                    ...TileServerPropertyFields
                }
            }
        }
        tileServerProperty {
            ...TileServerPropertyFields
        }
        zoomLevel
    }
    ... on ValidateProjectPropertyType {
        objectSource {
            aoiGeometry
            objectGeojsonUrl
            ohsomeFilter
            sourceType
            taskingManagerProjectId
        }
        tileServerProperty {
            ...TileServerPropertyFields
        }
    }
}
`;
