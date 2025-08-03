import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    PartialForm,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import NumberInput from '#components/NumberInput';
import OrganizationSelectInput from '#components/selections/OrganizationSelectInput';
import TeamSelectInput from '#components/selections/TeamSelectInput';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';
import {
    ProjectCreateInput,
    ProjectUpdateInput,
} from '#generated/types/graphql';
import { DeepNonNullable } from '#utils/types';

type ProjectGeneralInputFields = Pick<
ProjectCreateInput | ProjectUpdateInput,
'description'
| 'topic'
| 'lookFor'
| 'additionalInfoUrl'
| 'projectNumber'
| 'region'
| 'requestingOrganization'
| 'team'
>

type PartialProjectGeneralInputFields = PartialForm<
    DeepNonNullable<ProjectGeneralInputFields>
>;

interface Props {
    value: PartialProjectGeneralInputFields | undefined;
    error: LeafError | ObjectError<PartialProjectGeneralInputFields>;
    setFieldValue: (...entries: EntriesAsList<PartialProjectGeneralInputFields>) => void;
    disabled?: boolean;
}

function ProjectGeneralInputs(props: Props) {
    const {
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    return (
        <Container
            heading="General"
            withContentBackgroundAndPadding
            withHeaderBorder
            spacing="lg"
        >
            <TextInput
                label="Project topic"
                name="topic"
                value={value?.topic}
                onChange={setFieldValue}
                error={error?.topic}
                disabled={disabled}
            />
            <ListLayout layout="grid">
                <TextInput
                    label="Project region"
                    name="region"
                    value={value?.region}
                    onChange={setFieldValue}
                    error={error?.region}
                    disabled={disabled}
                />
                <NumberInput
                    label="Project number"
                    name="projectNumber"
                    value={value?.projectNumber}
                    onChange={setFieldValue}
                    error={error?.projectNumber}
                    disabled={disabled}
                />
            </ListLayout>
            <TextArea
                label="Project description"
                name="description"
                value={value?.description}
                onChange={setFieldValue}
                error={error?.description}
                rows={4}
                disabled={disabled}
            />
            <ListLayout
                layout="grid"
                spacing="lg"
            >
                <OrganizationSelectInput
                    label="Requesting organization"
                    name="requestingOrganization"
                    value={value?.requestingOrganization}
                    onChange={setFieldValue}
                    error={error?.requestingOrganization}
                    disabled={disabled}
                />
                <TextInput
                    label="Additional info URL"
                    name="additionalInfoUrl"
                    value={value?.additionalInfoUrl}
                    onChange={setFieldValue}
                    error={error?.additionalInfoUrl}
                    disabled={disabled}
                />
                <TextInput
                    label="Look for"
                    name="lookFor"
                    value={value?.lookFor}
                    onChange={setFieldValue}
                    error={error?.lookFor}
                    disabled={disabled}
                />
                <TeamSelectInput
                    label="Select Team (Private)"
                    name="team"
                    hint="Please note that if selected, this project will only be visible to the team members"
                    value={value?.team}
                    onChange={setFieldValue}
                    error={error?.team}
                    disabled={disabled}
                />
            </ListLayout>
        </Container>
    );
}

export default ProjectGeneralInputs;
