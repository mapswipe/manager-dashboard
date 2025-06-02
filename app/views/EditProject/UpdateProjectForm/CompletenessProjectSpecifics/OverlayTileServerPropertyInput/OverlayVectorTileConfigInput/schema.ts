import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import { ProjectOverlayVectorTileServerConfigInput } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import vectorTileServerFormSchema from './VectorTileServerInput/schema';

export type PartialOverlayVectorTileConfigInputFields = PartialForm<
    DeepNonNullable<ProjectOverlayVectorTileServerConfigInput>
>;

type OverlayVectorTileConfigFormSchema = ObjectSchema<
    PartialOverlayVectorTileConfigInputFields
>;

type OverlayVectorTileConfigFormFields = ReturnType<
    OverlayVectorTileConfigFormSchema['fields']
>;

export const defaultOverlayVectorTileConfigInputValue: PartialOverlayVectorTileConfigInputFields = {
    fillColor: '#ffffff',
    fillOpacity: 0.25,
    lineColor: '#ffffff',
    circleColor: '#ffffff',
    circleOpacity: 1,
    circleRadius: 3,
    lineWidth: 1,
    lineOpacity: 1,
    lineDasharray: [3, 2],
};

const overlayVectorTileConfigFormSchema: OverlayVectorTileConfigFormSchema = {
    fields: (): OverlayVectorTileConfigFormFields => ({
        circleColor: {},
        circleOpacity: {},
        circleRadius: {},
        fillColor: {},
        fillOpacity: {},
        lineColor: {},
        lineOpacity: {},
        lineWidth: {},
        lineDasharray: {},
        tileServer: vectorTileServerFormSchema,
    }),
};

export default overlayVectorTileConfigFormSchema;
