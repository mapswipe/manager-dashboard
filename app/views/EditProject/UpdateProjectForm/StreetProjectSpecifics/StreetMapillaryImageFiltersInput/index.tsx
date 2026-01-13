import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import Checkbox from '#components/Checkbox';
import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';
import TextInput from '#components/TextInput';

import { PartialStreetMapillaryImageFiltersInputFields } from './schema';

interface Props {
    value: PartialStreetMapillaryImageFiltersInputFields | undefined | null;
    error: LeafError | ObjectError<PartialStreetMapillaryImageFiltersInputFields>;
    setFieldValue: (
        ...entries: EntriesAsList<PartialStreetMapillaryImageFiltersInputFields>
    ) => void;
    disabled?: boolean;
}

function StreetMapillaryImageFiltersInput(props: Props) {
    const {
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    return (
        <Container
            heading="Mapillary Image Filters"
            headingLevel={4}
        >
            <ListLayout layout="grid">
                <TextInput
                    name="startTime"
                    label="Start date"
                    value={value?.startTime}
                    onChange={setFieldValue}
                    error={error?.startTime}
                    disabled={disabled}
                    hint="Choose a date range to filter images by the date they were captured at. Empty indicates that images of all capture dates are used. "
                />
                <TextInput
                    name="endTime"
                    label="End date"
                    value={value?.endTime}
                    onChange={setFieldValue}
                    error={error?.endTime}
                    disabled={disabled}
                    hint="Choose a date range to filter images by the date they were captured at. Empty indicates that images of all capture dates are used."
                />
                <TextInput
                    name="creatorId"
                    label="Image Creator ID"
                    value={value?.creatorId}
                    error={error?.creatorId}
                    onChange={setFieldValue}
                    disabled={disabled}
                    hint="Provide a valid Mapillary creator ID to filter for images belonging to a specific Mapillary user."
                />
                <TextInput
                    name="organizationId"
                    label="Mapillary Organization ID"
                    value={value?.organizationId}
                    error={error?.organizationId}
                    onChange={setFieldValue}
                    disabled={disabled}
                    hint="Provide a valid Mapillary organization ID to filter for images belonging to a specific organization. Empty indicates that no filter is set on organization."
                />
                <NumberInput
                    name="samplingThreshold"
                    label="Image Sampling Threshold"
                    value={value?.samplingThreshold}
                    error={error?.samplingThreshold}
                    onChange={setFieldValue}
                    disabled={disabled}
                    hint="What should be the minimum distance (in km) between images on the same Mapillary sequence? Empty indicates that all images on each sequence are used."
                />
            </ListLayout>
            <Checkbox
                name="isPano"
                label="Only use 360 degree panaroma images"
                value={value?.isPano}
                error={error?.isPano}
                onChange={setFieldValue}
                disabled={disabled}
                hint="If unchecked, both 360 degree panorama and classic images are used in the project"
            />
            <Checkbox
                name="randomizeOrder"
                label="Randomize the order of images in the project"
                value={value?.randomizeOrder}
                error={error?.randomizeOrder}
                onChange={setFieldValue}
                disabled={disabled}
                hint="If unchecked, tasks in the project will be in sequential order."
            />
        </Container>
    );
}

export default StreetMapillaryImageFiltersInput;
