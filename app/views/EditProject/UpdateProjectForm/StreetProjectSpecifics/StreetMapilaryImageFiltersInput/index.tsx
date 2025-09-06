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

import { PartialStreetMapilaryImageFiltersInputFields } from './schema';

interface Props {
    value: PartialStreetMapilaryImageFiltersInputFields | undefined | null;
    error: LeafError | ObjectError<PartialStreetMapilaryImageFiltersInputFields>;
    setFieldValue: (
        ...entries: EntriesAsList<PartialStreetMapilaryImageFiltersInputFields>
    ) => void;
    disabled?: boolean;
}

function StreetMapilaryImageFiltersInput(props: Props) {
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
                />
                <TextInput
                    name="endTime"
                    label="End date"
                    value={value?.endTime}
                    onChange={setFieldValue}
                    error={error?.endTime}
                    disabled={disabled}
                />
                <TextInput
                    name="creatorId"
                    label="Image Creator ID"
                    value={value?.creatorId}
                    error={error?.creatorId}
                    onChange={setFieldValue}
                    disabled={disabled}
                />
                <TextInput
                    name="organizationId"
                    label="Mapillary Organization ID"
                    value={value?.organizationId}
                    error={error?.organizationId}
                    onChange={setFieldValue}
                    disabled={disabled}
                />
                <NumberInput
                    name="samplingThreshold"
                    label="Image Sampling Threshold"
                    value={value?.samplingThreshold}
                    error={error?.samplingThreshold}
                    onChange={setFieldValue}
                    disabled={disabled}
                />
            </ListLayout>
            <Checkbox
                name="isPano"
                label="Only use 360 degree panaroma images"
                value={value?.isPano}
                // error={error?.isPano}
                onChange={setFieldValue}
                disabled={disabled}
            />
            <Checkbox
                name="randomizeOrder"
                label="Randomize the order of images in the project"
                value={value?.randomizeOrder}
                // error={error?.randomizeOrder}
                onChange={setFieldValue}
                disabled={disabled}
            />
        </Container>
    );
}

export default StreetMapilaryImageFiltersInput;
