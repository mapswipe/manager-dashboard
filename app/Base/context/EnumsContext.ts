import { createContext } from 'react';

import { AllEnumsQuery } from '#generated/types/graphql';

export interface EnumsContextProps {
    validateObjectSourceTypeOptions: AllEnumsQuery['enums']['ValidateObjectSourceTypeEnum'],
    validateImageSourceTypeOptions: AllEnumsQuery['enums']['ValidateImageSourceTypeEnum'],
    projectStatusOptions: AllEnumsQuery['enums']['ProjectStatusEnum'],
    projectTypeOptions: AllEnumsQuery['enums']['ProjectTypeEnum'],
    rasterTileServerNameOptions: AllEnumsQuery['enums']['RasterTileServerNameEnum'],
    vectorTileServerNameOptions: AllEnumsQuery['enums']['VectorTileServerNameEnum'],
    tutorialInformationPageBlockTypeOptions: AllEnumsQuery['enums']['TutorialInformationPageBlockTypeEnum'],
    iconOptions: AllEnumsQuery['enums']['IconEnum'],
    overlayLayerTypeOptions: AllEnumsQuery['enums']['OverlayLayerTypeEnum'],
    tutorialStatusOptions: AllEnumsQuery['enums']['TutorialStatusEnum'],

    validateObjectSourceTypeMapping: Record<
        AllEnumsQuery['enums']['ValidateObjectSourceTypeEnum'][number]['key'],
        AllEnumsQuery['enums']['ValidateObjectSourceTypeEnum'][number]
    > | undefined;
    validateImageSourceTypeMapping: Record<
        AllEnumsQuery['enums']['ValidateImageSourceTypeEnum'][number]['key'],
        AllEnumsQuery['enums']['ValidateImageSourceTypeEnum'][number]
    > | undefined;
    projectStatusMapping: Record<
        AllEnumsQuery['enums']['ProjectStatusEnum'][number]['key'],
        AllEnumsQuery['enums']['ProjectStatusEnum'][number]
    > | undefined;
    projectTypeMapping: Record<
        AllEnumsQuery['enums']['ProjectTypeEnum'][number]['key'],
        AllEnumsQuery['enums']['ProjectTypeEnum'][number]
    > | undefined;
    rasterTileServerNameMapping: Record<
        AllEnumsQuery['enums']['RasterTileServerNameEnum'][number]['key'],
        AllEnumsQuery['enums']['RasterTileServerNameEnum'][number]
    > | undefined;
    vectorTileServerNameMapping: Record<
        AllEnumsQuery['enums']['VectorTileServerNameEnum'][number]['key'],
        AllEnumsQuery['enums']['VectorTileServerNameEnum'][number]
    > | undefined;
    tutorialInformationPageBlockTypeMapping: Record<
        AllEnumsQuery['enums']['TutorialInformationPageBlockTypeEnum'][number]['key'],
        AllEnumsQuery['enums']['TutorialInformationPageBlockTypeEnum'][number]
    > | undefined;
    iconMapping: Record<
        AllEnumsQuery['enums']['IconEnum'][number]['key'],
        AllEnumsQuery['enums']['IconEnum'][number]
    > | undefined;
    overlayLayerTypeMapping: Record<
        AllEnumsQuery['enums']['OverlayLayerTypeEnum'][number]['key'],
        AllEnumsQuery['enums']['OverlayLayerTypeEnum'][number]
    > | undefined;
    tutorialStatusMapping: Record<
        AllEnumsQuery['enums']['TutorialStatusEnum'][number]['key'],
        AllEnumsQuery['enums']['TutorialStatusEnum'][number]
    > | undefined;
}

export const defaultAllEnumsValue: EnumsContextProps = {
    validateObjectSourceTypeOptions: [],
    validateImageSourceTypeOptions: [],
    projectStatusOptions: [],
    projectTypeOptions: [],
    rasterTileServerNameOptions: [],
    vectorTileServerNameOptions: [],
    tutorialInformationPageBlockTypeOptions: [],
    iconOptions: [],
    overlayLayerTypeOptions: [],
    tutorialStatusOptions: [],

    validateObjectSourceTypeMapping: undefined,
    validateImageSourceTypeMapping: undefined,
    projectStatusMapping: undefined,
    projectTypeMapping: undefined,
    rasterTileServerNameMapping: undefined,
    vectorTileServerNameMapping: undefined,
    tutorialInformationPageBlockTypeMapping: undefined,
    iconMapping: undefined,
    overlayLayerTypeMapping: undefined,
    tutorialStatusMapping: undefined,
};

const EnumsContext = createContext<EnumsContextProps>(defaultAllEnumsValue);

export default EnumsContext;
