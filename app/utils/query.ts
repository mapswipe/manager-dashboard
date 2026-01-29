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
        sourceLayer
    }
    openStreetMap {
        credits
        sourceLayer
    }
    versatiles {
        credits
        sourceLayer
    }
    custom {
        credits
        sourceLayer
        url
        minZoom
        maxZoom
    }
}
`;

export const PROJECT_TYPE_SPECIFIC_FRAGMENT = gql`
${TILE_SERVER_PROPERTY_FRAGMENT}
${VECTOR_TILE_SERVER_PROPERTY_FRAGMENT}
fragment ProjectTypeSpecificFields on CompareProjectPropertyTypeFindProjectPropertyTypeValidateProjectPropertyTypeValidateImageProjectPropertyTypeCompletenessProjectPropertyTypeStreetProjectPropertyTypeConflationProjectPropertyType {
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
        customOptions {
            ...ProjectCustomOptionFields
        }
    }
    ... on ValidateImageProjectPropertyType {
        __typename
        sourceType
        customOptions {
            ...ProjectCustomOptionFields
        }
    }
    ... on StreetProjectPropertyType {
        __typename
        aoiGeometry
        customOptions {
            ...ProjectCustomOptionFields
        }
        mapillaryImageFilters {
            creatorId
            endTime
            isPano
            organizationId
            randomizeOrder
            samplingThreshold
            startTime
        }
    }
    ... on ConflationProjectPropertyType {
        __typename
        objectSource {
            objectGeojsonUrl
        }
        tileServerProperty {
            ...RasterTileServerPropertyFields
        }
    }
}
`;

export const CUSTOM_OPTION_FRAGMENT = gql`
fragment ProjectCustomOptionFields on ProjectCustomOption {
    clientId
    description
    icon
    iconColor
    subOptions {
        clientId
        description
        value
    }
    title
    value
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

export const PROJECT_DETAILS_FRAGMENT = gql`
${PROJECT_TYPE_SPECIFIC_FRAGMENT}
fragment ProjectDetailFields on ProjectType {
    aoiGeometry {
        id
        totalArea
        bbox
    }
    aoiGeometryInputAsset {
        id
        file {
            name
            url
        }
    }
    projectTypeSpecificOutputAsset {
        id
        file {
            name
            url
        }
    }
    additionalInfoUrl
    clientId
    description
    groupSize
    id
    oldId
    isFeatured
    lookFor
    projectInstruction
    maxTasksPerUser
    name
    topic
    projectNumber
    region
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
        ...ProjectTypeSpecificFields
    }
    requestingOrganization {
        id
        name
    }
    team {
        id
        name
    }
    tutorial {
        id
        name
    }
    status
    statusMessage
    verificationNumber
}
`;

export const TUTORIAL_DETAILS_FRAGMENT = gql`
fragment TutorialDetailFields on TutorialType {
    id
    name
    clientId
    status
    informationPages {
        id
        clientId
        pageNumber
        title
        tutorialId
        blocks {
            id
            clientId
            blockNumber
            blockType
            pageId
            text
            imageId
            image {
                id
            }
        }
    }
    projectId
    scenarios {
        id
        clientId
        hintDescription
        hintIcon
        hintTitle
        instructionsDescription
        instructionsIcon
        instructionsTitle
        scenarioPageNumber
        successDescription
        successIcon
        successTitle
        tutorialId
        tasks {
            id
            clientId
            reference
            scenarioId
            projectTypeSpecifics {
                ... on FindTutorialTaskPropertyType {
                    __typename
                    tileX
                    tileY
                    tileZ
                }
                ... on CompareTutorialTaskPropertyType {
                    __typename
                    tileX
                    tileY
                    tileZ
                }
                ... on CompletenessTutorialTaskPropertyType {
                    __typename
                    tileX
                    tileY
                    tileZ
                }
                ... on ConflationTutorialTaskPropertyType {
                    __typename
                    identifier
                    objectGeometry
                }
                ... on ValidateTutorialTaskPropertyType {
                    __typename
                    identifier
                    objectGeometry
                }
                ... on ValidateImageTutorialTaskPropertyType {
                    __typename
                    fileName
                    height
                    url
                    width
                    annotation {
                        bbox
                        id
                        imageId
                        iscrowd
                        segmentation
                        area
                        categoryId
                    }
                }
                ... on StreetTutorialTaskPropertyType {
                    __typename
                    mapillaryImageId
                    geometry
                }
            }
        }
    }
}
`;
