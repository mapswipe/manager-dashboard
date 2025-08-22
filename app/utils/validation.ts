import { type } from 'arktype';

export const CocoObjectImage = type({
    id: type.number,
    lisence: type.string.optional(),
    coco_url: type.string.optional(),
    flickr_url: type.string.optional(),
    // FIXME: this should be required?
    width: type.number.optional(),
    // FIXME: this should be required?
    height: type.number.optional(),
    file_name: type.string,
    // FIXME: this should be required?
    date_captured: type.string.optional(),
});

export const CocoAnnotationType = type({
    id: type.number,
    image_id: type.number,
    category_id: type.number.optional(),
    iscrowd: type.number.optional(),
    // segmentation: type.number.array().array().optional(),
    area: type.number.optional(),
    bbox: [
        type.number,
        type.number,
        type.number,
        type.number,
    ],
});

export const CocoCategoryType = type({
    supercategory: type.string.optional(),
    id: type.number,
    name: type.string,
});

export const CocoType = type({
    images: CocoObjectImage.array(),
    annotations: CocoAnnotationType.array().optional(),
    categories: CocoCategoryType.array().optional(),
});
