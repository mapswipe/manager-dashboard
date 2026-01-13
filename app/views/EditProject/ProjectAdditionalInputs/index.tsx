import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    PartialForm,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import AssetInput from '#components/domain/AssetInput';
import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';
import {
    ProcessedProjectUpdateInput,
    ProjectAssetInputTypeEnum,
    ProjectUpdateInput,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

type ProjectAdditionalInputFields = Pick<
ProjectUpdateInput & ProcessedProjectUpdateInput,
'verificationNumber'
| 'groupSize'
| 'maxTasksPerUser'
| 'image'
>

type PartialProjectAdditionalInputFields = PartialForm<
DeepNonNullable<ProjectAdditionalInputFields>
>;

interface Props {
    projectId: string;
    value: PartialProjectAdditionalInputFields | undefined;
    error: LeafError | ObjectError<PartialProjectAdditionalInputFields>;
    setFieldValue: (...entries: EntriesAsList<PartialProjectAdditionalInputFields>) => void;
    disabled?: boolean;
}

function ProjectAdditionalInputs(props: Props) {
    const {
        projectId,
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    return (
        <Container
            heading="Additional"
            withContentBackgroundAndPadding
            spacing="lg"
        >
            <ListLayout layout="grid">
                <ListLayout layout="block">
                    <NumberInput
                        label="Verification number"
                        name="verificationNumber"
                        value={value?.verificationNumber}
                        onChange={setFieldValue}
                        error={error?.verificationNumber}
                        disabled={disabled}
                        hint="How many people do you want to see every task before you consider it finished? Default is 3, but 5 or more is recommended for harder tasks. Note that the higher the number the longer the project will take to complete."
                    />
                    <NumberInput
                        label="Group size"
                        name="groupSize"
                        value={value?.groupSize}
                        onChange={setFieldValue}
                        error={error?.groupSize}
                        disabled={disabled}
                        hint="How big should an activity session be? Group size refers to the number of tasks per session."
                    />
                    <NumberInput
                        label="Max tasks per user"
                        name="maxTasksPerUser"
                        value={value?.maxTasksPerUser}
                        onChange={setFieldValue}
                        error={error?.maxTasksPerUser}
                        disabled={disabled}
                        hint="How many tasks each user is allowed to work on for this project. Empty indicates that no limit is set."
                    />
                </ListLayout>
                <AssetInput
                    projectId={projectId}
                    label="Project cover image"
                    name="image"
                    inputType={ProjectAssetInputTypeEnum.CoverImage}
                    value={value?.image}
                    onChange={setFieldValue}
                    error={error?.image}
                    disabled={disabled}
                    hint="Make sure you have the rights to use the image. It should end with .jpg or .png."
                />
            </ListLayout>
        </Container>
    );
}

export default ProjectAdditionalInputs;
