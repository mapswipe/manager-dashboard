import { createContext } from 'react';

import { AllEnumsQuery } from '#generated/types/graphql';

export const defaultAllEnumsValue: AllEnumsQuery['enums'] = {
    ValidateObjectSourceTypeEnum: [],
    ProjectStatusEnum: [],
    ProjectTypeEnum: [],
    RasterTileServerNameEnum: [],
    VectorTileServerNameEnum: [],
    TutorialInformationPageBlockTypeEnum: [],
    IconEnum: [],
    OverlayLayerTypeEnum: [],
    TutorialStatusEnum: [],
};

const EnumsContext = createContext<AllEnumsQuery['enums']>(defaultAllEnumsValue);

export default EnumsContext;
