import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    greaterThanOrEqualToCondition,
    lessThanOrEqualToCondition,
    integerCondition,
    nullValue,
    ArraySchema,
    addCondition,
} from '@togglecorp/toggle-form';
import {
    TileServer,
    tileServerFieldsSchema,
} from '#components/TileServerInput';

import {
    getNoMoreThanNCharacterCondition,
    ProjectType,
    PROJECT_TYPE_BUILD_AREA,
    PROJECT_TYPE_CHANGE_DETECTION,
    PROJECT_TYPE_COMPLETENESS,
    PROJECT_TYPE_FOOTPRINT,
    IconKey,
} from '#utils/common';

export type ColorKey = 'red'
| 'pink'
| 'purple'
| 'deepPurple'
| 'indigo'
| 'blue'
| 'cyan'
| 'teal'
| 'green'
| 'lime'
| 'yellow'
| 'orange'
| 'brown'
| 'gray';

export const colorKeyToColorMap: Record<ColorKey, string> = {
    red: '#D32F2F',
    pink: '#D81B60',
    purple: '#9C27B0',
    deepPurple: '#673AB7',
    indigo: '#3F51B5',
    blue: '#1976D2',
    cyan: '#0097A7',
    teal: '#00695C',
    green: '#2E7D32',
    lime: '#9E9D24',
    yellow: '#FFD600',
    orange: '#FF9100',
    brown: '#795548',
    gray: '#757575',
};

export interface ColorOptions {
    key: ColorKey;
    label: string;
    color: string;
}

export const iconColorOptions: ColorOptions[] = [
    {
        key: 'red',
        label: 'Red',
        color: colorKeyToColorMap.red,
    },
    {
        key: 'pink',
        label: 'Pink',
        color: colorKeyToColorMap.pink,
    },
    {
        key: 'purple',
        label: 'Purple',
        color: colorKeyToColorMap.purple,
    },
    {
        key: 'deepPurple',
        label: 'Deep Purple',
        color: colorKeyToColorMap.deepPurple,
    },
    {
        key: 'indigo',
        label: 'Indigo',
        color: colorKeyToColorMap.indigo,
    },
    {
        key: 'blue',
        label: 'Blue',
        color: colorKeyToColorMap.blue,
    },
    {
        key: 'cyan',
        label: 'Cyan',
        color: colorKeyToColorMap.cyan,
    },
    {
        key: 'teal',
        label: 'Teal',
        color: colorKeyToColorMap.teal,
    },
    {
        key: 'green',
        label: 'Green',
        color: colorKeyToColorMap.green,
    },
    {
        key: 'lime',
        label: 'Lime',
        color: colorKeyToColorMap.lime,
    },
    {
        key: 'yellow',
        label: 'Yellow',
        color: colorKeyToColorMap.yellow,
    },
    {
        key: 'orange',
        label: 'Orange',
        color: colorKeyToColorMap.orange,
    },
    {
        key: 'brown',
        label: 'Brown',
        color: colorKeyToColorMap.brown,
    },
    {
        key: 'gray',
        label: 'Gray',
        color: colorKeyToColorMap.gray,
    },
];

export type InformationPageTemplateKey = '1-picture' | '2-picture' | '3-picture';
export interface InformationPageOption {
    key: InformationPageTemplateKey;
    label: string;
}

export const infoPageTemplateoptions: InformationPageOption[] = [
    {
        key: '1-picture',
        label: 'With 1 picture',
    },
    {
        key: '2-picture',
        label: 'With 2 picture',
    },
    {
        key: '3-picture',
        label: 'With 3 picture',
    },
];

interface Block {
    blockNumber: number,
    blockType: 'text' | 'image',
}

export const infoPageBlocksMap: Record<InformationPageTemplateKey, Block[]> = {
    '1-picture': [
        {
            blockNumber: 1,
            blockType: 'text',
        },
        {
            blockNumber: 2,
            blockType: 'image',
        },
    ],
    '2-picture': [
        {
            blockNumber: 1,
            blockType: 'text',
        },
        {
            blockNumber: 2,
            blockType: 'image',
        },
        {
            blockNumber: 3,
            blockType: 'text',
        },
        {
            blockNumber: 4,
            blockType: 'image',
        },
    ],
    '3-picture': [
        {
            blockNumber: 1,
            blockType: 'text',
        },
        {
            blockNumber: 2,
            blockType: 'image',
        },
        {
            blockNumber: 3,
            blockType: 'text',
        },
        {
            blockNumber: 4,
            blockType: 'image',
        },
        {
            blockNumber: 5,
            blockType: 'text',
        },
        {
            blockNumber: 6,
            blockType: 'image',
        },
    ],
};

export type TutorialTasks = GeoJSON.FeatureCollection<GeoJSON.Geometry, {
    groupId: string;
    reference: number;
    screen: number;
    taskId: string;
    // eslint-disable-next-line
    tile_x: number;
    // eslint-disable-next-line
    tile_y: number;
    // eslint-disable-next-line
    tile_z: number;
}>;

export type CustomOptions = {
    optionId: number;
    title: string;
    value: number;
    description: string;
    icon: IconKey;
    iconColor: string;
    subOptions: {
        subOptionsId: number;
        description: string;
        value: number;
    }[];
}[];

export type InformationPages = {
    pageNumber: number;
    title: string;
    blocks: {
        blockNumber: number;
        blockType: 'image' | 'text';
        textDescription?: string;
        imageFile?: File;
    }[];
}[];

export interface TutorialFormType {
    lookFor: string;
    name: string;
    tileServer: TileServer;
    scenarioPages: {
        scenarioId: number;
        hint: {
            description: string;
            icon: IconKey;
            title: string;
        };
        instruction: {
            description: string;
            icon: IconKey;
            title: string;
        };
        success: {
            description: string;
            icon: IconKey;
            title: string;
        };
    }[];
    tutorialTasks?: TutorialTasks,
    exampleImage1: File;
    exampleImage2: File;
    projectType: ProjectType;
    tileServerB?: TileServer,
    zoomLevel?: number;
    customOptions?: CustomOptions;
    informationPages: InformationPages;
}

export type PartialTutorialFormType = PartialForm<
    Omit<TutorialFormType, 'exampleImage1' | 'exampleImage2'> & {
        exampleImage1?: File;
        exampleImage2?: File;
    },
    // NOTE: we do not want to change File and FeatureCollection to partials
    'image' |'tutorialTasks' | 'exampleImage1' | 'exampleImage2' | 'scenarioId' | 'optionId' | 'subOptionsId' | 'pageNumber' | 'blockNumber' | 'blockType' | 'imageFile'
>;

type TutorialFormSchema = ObjectSchema<PartialTutorialFormType>;
type TutorialFormSchemaFields = ReturnType<TutorialFormSchema['fields']>;

export type ScenarioPagesType = NonNullable<PartialTutorialFormType['scenarioPages']>[number];
type ScenarioPagesSchema = ObjectSchema<ScenarioPagesType, PartialTutorialFormType>;
type ScenarioPagesFormSchemaFields = ReturnType<ScenarioPagesSchema['fields']>;

type ScenarioPagesFormSchema = ArraySchema<ScenarioPagesType, PartialTutorialFormType>;
type ScenarioPagesFormSchemaMember = ReturnType<ScenarioPagesFormSchema['member']>;

export type CustomOptionType = NonNullable<PartialTutorialFormType['customOptions']>[number];
type CustomOptionSchema = ObjectSchema<CustomOptionType, PartialTutorialFormType>;
export type CustomOptionSchemaFields = ReturnType<CustomOptionSchema['fields']>

export type CustomOptionFormSchema = ArraySchema<CustomOptionType, PartialTutorialFormType>;
export type CustomOptionFormSchemaMember = ReturnType<CustomOptionFormSchema['member']>;

export type InformationPagesType = NonNullable<PartialTutorialFormType['informationPages']>[number]
type InformationPagesSchema = ObjectSchema<InformationPagesType, PartialTutorialFormType>;
type InformationPagesSchemaFields = ReturnType<InformationPagesSchema['fields']>

type InformationPagesFormSchema = ArraySchema<InformationPagesType, PartialTutorialFormType>;
type InformationPagesFormSchemaMember = ReturnType<InformationPagesFormSchema['member']>;

export type PartialInformationPagesType = PartialTutorialFormType['informationPages'];
export type PartialBlocksType = NonNullable<NonNullable<PartialInformationPagesType>[number]>['blocks'];

export const tutorialFormSchema: TutorialFormSchema = {
    fields: (value): TutorialFormSchemaFields => {
        let baseSchema: TutorialFormSchemaFields = {
            projectType: {
                required: true,
            },
            lookFor: {
                required: true,
                requiredValidation: requiredStringCondition,
                validations: [getNoMoreThanNCharacterCondition(25)],
            },
            name: {
                required: true,
                requiredValidation: requiredStringCondition,
                validations: [getNoMoreThanNCharacterCondition(100)],
            },
            tileServer: {
                fields: tileServerFieldsSchema,
            },
            scenarioPages: {
                keySelector: (key) => key.scenarioId,
                member: (): ScenarioPagesFormSchemaMember => ({
                    fields: (): ScenarioPagesFormSchemaFields => ({
                        scenarioId: {
                            required: true,
                        },
                        hint: {
                            fields: () => ({
                                title: {
                                    required: true,
                                    requiredValidation: requiredStringCondition,
                                    validations: [getNoMoreThanNCharacterCondition(20)],
                                },
                                description: {
                                    required: true,
                                    requiredValidation: requiredStringCondition,
                                    validations: [getNoMoreThanNCharacterCondition(100)],
                                },
                                icon: { required: true },
                            }),
                        },
                        instruction: {
                            fields: () => ({
                                title: {
                                    required: true,
                                    requiredValidation: requiredStringCondition,
                                    validations: [getNoMoreThanNCharacterCondition(20)],
                                },
                                description: {
                                    required: true,
                                    requiredValidation: requiredStringCondition,
                                    validations: [getNoMoreThanNCharacterCondition(100)],
                                },
                                icon: { required: true },
                            }),
                        },
                        success: {
                            fields: () => ({
                                title: {
                                    required: true,
                                    requiredValidation: requiredStringCondition,
                                    validations: [getNoMoreThanNCharacterCondition(20)],
                                },
                                description: {
                                    required: true,
                                    requiredValidation: requiredStringCondition,
                                    validations: [getNoMoreThanNCharacterCondition(100)],
                                },
                                icon: { required: true },
                            }),
                        },
                    }),
                }),
            },
            informationPages: {
                validation: (info) => {
                    if (info && info.length >= 10) {
                        return 'Information page cannot be more than 10';
                    }
                    return undefined;
                },
                keySelector: (key) => key.pageNumber,
                member: (): InformationPagesFormSchemaMember => ({
                    fields: (): InformationPagesSchemaFields => ({
                        pageNumber: { required: true },
                        title: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                            validations: [getNoMoreThanNCharacterCondition(500)],
                        },
                        blocks: {
                            keySelector: (key) => key.blockNumber,
                            member: () => ({
                                fields: (blockValue) => {
                                    let fields = {
                                        blockNumber: { required: true },
                                        blockType: { required: true },
                                    };

                                    fields = addCondition(
                                        fields,
                                        blockValue,
                                        ['blockType'],
                                        ['imageFile', 'textDescription'],
                                        (v) => {
                                            if (v?.blockType === 'text') {
                                                return {
                                                    textDescription: {
                                                        required: true,
                                                        // eslint-disable-next-line max-len
                                                        requiredValidations: requiredStringCondition,
                                                        // eslint-disable-next-line max-len
                                                        validations: [getNoMoreThanNCharacterCondition(2000)],
                                                    },
                                                    imageFile: { forceValue: nullValue },
                                                };
                                            }
                                            return {
                                                imageFile: { required: true },
                                                textDescription: { forceValue: nullValue },

                                            };
                                        },
                                    );
                                    return fields;
                                },
                            }),
                        },
                    }),
                }),
            },
            // FIXME: we do not send this anymore
            tutorialTasks: {},
            exampleImage1: {},
            exampleImage2: {},
        };

        baseSchema = addCondition(
            baseSchema,
            value,
            ['projectType'],
            ['customOptions'],
            (formValues) => {
                const customOptionField: CustomOptionFormSchema = {
                    validation: (option) => {
                        if (!option) {
                            return undefined;
                        }

                        if (option.length < 2) {
                            return 'There should be at least 2 options';
                        }

                        if (option.length > 6) {
                            return 'There shouldn\'t be more than 6 options';
                        }

                        return undefined;
                    },
                    keySelector: (key) => key.optionId,
                    member: (): CustomOptionFormSchemaMember => ({
                        fields: (): CustomOptionSchemaFields => ({
                            optionId: {
                                required: true,
                            },
                            title: {
                                required: true,
                                requiredValidation: requiredStringCondition,
                                validations: [getNoMoreThanNCharacterCondition(25)],
                            },
                            value: {
                                required: true,
                                validations: [integerCondition],
                            },
                            description: {
                                required: true,
                                requiredValidation: requiredStringCondition,
                                validations: [getNoMoreThanNCharacterCondition(100)],
                            },
                            icon: {
                                required: true,
                            },
                            iconColor: {
                                required: true,
                            },
                            subOptions: {
                                keySelector: (key) => key.subOptionsId,
                                validation: (sub) => {
                                    if (!sub || sub.length === 0) {
                                        return undefined;
                                    }

                                    if (sub.length < 2) {
                                        return 'There should be at least 2 sub options';
                                    }

                                    if (sub.length > 6) {
                                        return 'There shouldn\'t be more than 6 sub options';
                                    }

                                    return undefined;
                                },
                                member: () => ({
                                    fields: () => ({
                                        subOptionsId: {
                                            required: true,
                                        },
                                        description: {
                                            required: true,
                                            requiredValidation: requiredStringCondition,
                                            validations: [getNoMoreThanNCharacterCondition(100)],
                                        },
                                        value: {
                                            required: true,
                                            validations: [integerCondition],
                                        },
                                    }),
                                }),
                            },
                        }),
                    }),
                };

                if (formValues?.projectType === PROJECT_TYPE_FOOTPRINT) {
                    return {
                        customOptions: customOptionField,
                    };
                }
                return {
                    customOptions: { forceValue: nullValue },
                };
            },
        );
        baseSchema = addCondition(
            baseSchema,
            value,
            ['projectType'],
            ['zoomLevel'],
            (v) => (v?.projectType === PROJECT_TYPE_BUILD_AREA ? {
                zoomLevel: {
                    required: true,
                    validations: [
                        greaterThanOrEqualToCondition(14),
                        lessThanOrEqualToCondition(22),
                        integerCondition,
                    ],
                },
            } : {
                zoomLevel: { forceValue: nullValue },
            }),
        );
        baseSchema = addCondition(
            baseSchema,
            value,
            ['projectType'],
            ['zoomLevel', 'tileServerB'],
            (v) => (v?.projectType === PROJECT_TYPE_CHANGE_DETECTION
                || v?.projectType === PROJECT_TYPE_COMPLETENESS
                ? {
                    zoomLevel: {
                        required: true,
                        validations: [
                            greaterThanOrEqualToCondition(14),
                            lessThanOrEqualToCondition(22),
                            integerCondition,
                        ],
                    },
                    tileServerB: {
                        fields: tileServerFieldsSchema,
                    },
                } : {
                    zoomLevel: { forceValue: nullValue },
                    tileServerB: { forceValue: nullValue },
                }),
        );
        return baseSchema;
    },
};
