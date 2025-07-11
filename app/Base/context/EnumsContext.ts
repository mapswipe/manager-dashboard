import { createContext } from 'react';

import { AllEnumsQuery } from '#generated/types/graphql';

export const defaultAllEnumsValue: AllEnumsQuery['enums'] = {
    ValidateObjectSourceTypeEnum: [],
    ProjectStatusEnum: [],
    ProjectTypeEnum: [],
    RasterTileServerNameEnum: [],
    VectorTileServerNameEnum: [],
    TutorialInformationPageBlockTypeEnum: [],
    TutorialScenarioIconEnum: [],
    OverlayLayerTypeEnum: [],
};

const EnumsContext = createContext<AllEnumsQuery['enums']>(defaultAllEnumsValue);

export default EnumsContext;
