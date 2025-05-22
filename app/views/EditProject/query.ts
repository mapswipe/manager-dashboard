import { gql } from '@apollo/client';

export const TILE_SERVER_PROPERTY_FRAGMENT = gql`
fragment TileServerPropertyFields on ProjectTileServerConfig {
    bing {
        credits
    }
    custom {
        credits
        url
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
    name
}
`;

export const PROJECT_QUERY = gql`
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
        }
        requestingOrganization {
            id
            name
        }
        tutorialId
        status
        verificationNumber
    }
}

${TILE_SERVER_PROPERTY_FRAGMENT}
`;
