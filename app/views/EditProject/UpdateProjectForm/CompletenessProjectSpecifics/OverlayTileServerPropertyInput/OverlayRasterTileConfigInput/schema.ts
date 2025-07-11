import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import rasterTileServerFormSchema from '#components/RasterTileServerInput/schema';
import { ProjectOverlayRasterTileServerConfig } from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

export type PartialOverlayRasterTileConfigInputFields = PartialForm<
    DeepNonNullable<ProjectOverlayRasterTileServerConfig>
>;

export type OverlayRasterTileConfigFormSchema = ObjectSchema<
    PartialOverlayRasterTileConfigInputFields
>;

type OverlayRasterTileConfigFormFields = ReturnType<
    OverlayRasterTileConfigFormSchema['fields']
>;

export const defaultOverlayRasterTileConfigInputValue: PartialOverlayRasterTileConfigInputFields = {
};

export const overlayRasterTileConfigFormSchema: OverlayRasterTileConfigFormSchema = {
    fields: (): OverlayRasterTileConfigFormFields => ({
        opacity: {},
        tileServer: rasterTileServerFormSchema,
    }),
};
