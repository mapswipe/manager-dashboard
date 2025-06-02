import { gql } from '@apollo/client';

import {
    TILE_SERVER_PROPERTY_FRAGMENT,
    VECTOR_TILE_SERVER_PROPERTY_FRAGMENT,
} from '#utils/query';

// eslint-disable-next-line import/prefer-default-export
export const PROJECT_QUERY = gql`
${TILE_SERVER_PROPERTY_FRAGMENT}
${VECTOR_TILE_SERVER_PROPERTY_FRAGMENT}
query ProjectDetails($id: ID!) {
    project(id: $id) {
        additionalInfoUrl
        clientId
        description
        groupSize
        id
        isFeatured
        lookFor
        maxTasksPerUser
        name
        processingStatus
        progress
        projectType
        image {
            id
            file {
                url
            }
        }
        projectTypeSpecifics {
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
        requestingOrganization {
            id
            name
        }
        tutorial {
            id
            name
        }
        status
        verificationNumber
    }
}
`;
