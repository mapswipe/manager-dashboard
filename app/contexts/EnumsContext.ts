import { createContext } from 'react';

import { AllEnumsQuery } from '#generated/types/graphql';

export interface EnumsContextProps {
    validateObjectSourceTypeOptions: AllEnumsQuery['enums']['ValidateObjectSourceTypeEnum'],
    projectStatusOptions: AllEnumsQuery['enums']['ProjectStatusEnum'],
    projectTypeOptions: AllEnumsQuery['enums']['ProjectTypeEnum'],
    tutorialInformationPageBlockTypeOptions: AllEnumsQuery['enums']['TutorialInformationPageBlockTypeEnum'],
    iconOptions: AllEnumsQuery['enums']['IconEnum'],
    overlayLayerTypeOptions: AllEnumsQuery['enums']['OverlayLayerTypeEnum'],
    tutorialStatusOptions: AllEnumsQuery['enums']['TutorialStatusEnum'],
    firebasePushStatusOptions: AllEnumsQuery['enums']['FirebasePushStatusEnum'],
    subGridSizeOptions: AllEnumsQuery['enums']['SubGridSizeEnum'],

    validateObjectSourceTypeMapping: Record<
        AllEnumsQuery['enums']['ValidateObjectSourceTypeEnum'][number]['key'],
        AllEnumsQuery['enums']['ValidateObjectSourceTypeEnum'][number]
    > | undefined;
    projectStatusMapping: Record<
        AllEnumsQuery['enums']['ProjectStatusEnum'][number]['key'],
        AllEnumsQuery['enums']['ProjectStatusEnum'][number]
    > | undefined;
    projectTypeMapping: Record<
        AllEnumsQuery['enums']['ProjectTypeEnum'][number]['key'],
        AllEnumsQuery['enums']['ProjectTypeEnum'][number]
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
    firebasePushStatusMapping: Record<
        AllEnumsQuery['enums']['FirebasePushStatusEnum'][number]['key'],
        AllEnumsQuery['enums']['FirebasePushStatusEnum'][number]
    > | undefined;
}

export const defaultAllEnumsValue: EnumsContextProps = {
    validateObjectSourceTypeOptions: [],
    projectStatusOptions: [],
    projectTypeOptions: [],
    tutorialInformationPageBlockTypeOptions: [],
    iconOptions: [],
    overlayLayerTypeOptions: [],
    tutorialStatusOptions: [],
    firebasePushStatusOptions: [],
    subGridSizeOptions: [],

    validateObjectSourceTypeMapping: undefined,
    projectStatusMapping: undefined,
    projectTypeMapping: undefined,
    tutorialInformationPageBlockTypeMapping: undefined,
    iconMapping: undefined,
    overlayLayerTypeMapping: undefined,
    tutorialStatusMapping: undefined,
    firebasePushStatusMapping: undefined,
};

const EnumsContext = createContext<EnumsContextProps>(defaultAllEnumsValue);

export default EnumsContext;
