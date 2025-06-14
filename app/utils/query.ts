import { gql } from 'urql';

export const TILE_SERVER_PROPERTY_FRAGMENT = gql`
fragment RasterTileServerPropertyFields on ProjectRasterTileServerConfig {
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
        __typename
        aoiGeometry
        zoomLevel
        tileServerProperty {
            ...RasterTileServerPropertyFields
        }
        tileServerBProperty {
            ...RasterTileServerPropertyFields
        }
    }
    ... on FindProjectPropertyType {
        __typename
        aoiGeometry
        tileServerProperty {
            ...RasterTileServerPropertyFields
        }
        zoomLevel
    }
    ... on CompletenessProjectPropertyType {
        __typename
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
                    ...RasterTileServerPropertyFields
                }
            }
        }
        tileServerProperty {
            ...RasterTileServerPropertyFields
        }
        zoomLevel
    }
    ... on ValidateProjectPropertyType {
        __typename
        objectSource {
            aoiGeometry
            objectGeojsonUrl
            ohsomeFilter
            sourceType
            taskingManagerProjectId
        }
        tileServerProperty {
            ...RasterTileServerPropertyFields
        }
    }
}
`;

export const OPERATION_INFO_FRAGMENT = gql`
fragment OperationInfoFields on OperationInfo {
    __typename
    messages {
        code
        field
        kind
        message
    }
}
`;
