import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import rasterTileServerFormSchema, { defaultRasterTileServerInputValue } from '#components/domain/RasterTileServerInput/schema';
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
    opacity: 0.5,
    tileServer: defaultRasterTileServerInputValue,
};

export const overlayRasterTileConfigFormSchema: OverlayRasterTileConfigFormSchema = {
    fields: (): OverlayRasterTileConfigFormFields => ({
        opacity: {},
        tileServer: rasterTileServerFormSchema,
    }),
};
