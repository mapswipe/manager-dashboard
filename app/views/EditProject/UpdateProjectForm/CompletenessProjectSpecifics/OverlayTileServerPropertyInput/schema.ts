import {
    addCondition,
    nullValue,
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import {
    OverlayLayerTypeEnum,
    ProjectOverlayTileServerConfigInput,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

import { overlayRasterTileConfigFormSchema } from './OverlayRasterTileConfigInput/schema';
import overlayVectorTileConfigFormSchema, { defaultOverlayVectorTileConfigInputValue } from './OverlayVectorTileConfigInput/schema';

export type PartialOverlayTileServerPropertyInputFields = PartialForm<
    DeepNonNullable<ProjectOverlayTileServerConfigInput>
>;

type OverlayTileServerPropertyFormSchema = ObjectSchema<
    PartialOverlayTileServerPropertyInputFields
>;

type OverlayTileServerPropertyFormFields = ReturnType<
    OverlayTileServerPropertyFormSchema['fields']
>;

// eslint-disable-next-line max-len
export const defaultOverlayTileServerPropertyInputValue: PartialOverlayTileServerPropertyInputFields = {
    type: OverlayLayerTypeEnum.VectorTile,
    vector: defaultOverlayVectorTileConfigInputValue,
};

const overlayTileServerPropertySchema: OverlayTileServerPropertyFormSchema = {
    fields: (value): OverlayTileServerPropertyFormFields => {
        const baseSchema: OverlayTileServerPropertyFormFields = {
            type: {
                required: true,
            },
        };

        const schema = addCondition(
            baseSchema,
            value,
            ['type'],
            ['raster', 'vector'],
            (): OverlayTileServerPropertyFormFields => {
                if (value?.type === OverlayLayerTypeEnum.RasterTile) {
                    return {
                        raster: overlayRasterTileConfigFormSchema,
                        vector: { forceValue: nullValue },
                    };
                }

                if (value?.type === OverlayLayerTypeEnum.VectorTile) {
                    return {
                        vector: overlayVectorTileConfigFormSchema,
                        raster: { forceValue: nullValue },
                    };
                }

                return {};
            },
        );

        return schema;
    },
};

export default overlayTileServerPropertySchema;
