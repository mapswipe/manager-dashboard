import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    PartialForm,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import MarkdownEditor from '#components/MarkdownEditor';
import NumberInput from '#components/NumberInput';
import OrganizationSelectInput from '#components/selections/OrganizationSelectInput';
import TeamSelectInput from '#components/selections/TeamSelectInput';
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
| 'projectInstruction'
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
            spacing="lg"
        >
            <TextInput
                label="Project topic"
                name="topic"
                value={value?.topic}
                onChange={setFieldValue}
                error={error?.topic}
                disabled={disabled}
                hint="Enter the topic of your project."
            />
            <ListLayout layout="grid">
                <TextInput
                    label="Project region"
                    name="region"
                    value={value?.region}
                    onChange={setFieldValue}
                    error={error?.region}
                    disabled={disabled}
                    hint="Enter name of your project Region"
                />
                <NumberInput
                    label="Project number"
                    name="projectNumber"
                    value={value?.projectNumber}
                    onChange={setFieldValue}
                    error={error?.projectNumber}
                    disabled={disabled}
                    hint="Is this project part of a bigger campaign with multiple projects?"
                />
            </ListLayout>
            <MarkdownEditor
                label="Project description"
                name="description"
                value={value?.description}
                onChange={setFieldValue}
                error={error?.description}
                disabled={disabled}
                hint="Enter the description for your project. (markdown syntax is supported)"
            />
            <ListLayout
                layout="grid"
                spacing="lg"
            >
                <OrganizationSelectInput
                    label="Organization"
                    name="requestingOrganization"
                    value={value?.requestingOrganization}
                    onChange={setFieldValue}
                    error={error?.requestingOrganization}
                    disabled={disabled}
                    hint="Which group, institution or community is requesting this project?"
                />
                <TextInput
                    label="Additional info URL"
                    name="additionalInfoUrl"
                    value={value?.additionalInfoUrl}
                    onChange={setFieldValue}
                    error={error?.additionalInfoUrl}
                    disabled={disabled}
                    hint="Provide an optional link to a resource with additional information on the project (only visible in the MapSwipe web app)"
                />
                <TextInput
                    label="Instruction"
                    name="projectInstruction"
                    value={value?.projectInstruction}
                    onChange={setFieldValue}
                    error={error?.projectInstruction}
                    disabled={disabled}
                    hint="Provide a brief instruction for the user (e.g. Is there a building?)"
                />
                <TextInput
                    label="Look for (legacy)"
                    name="lookFor"
                    value={value?.lookFor}
                    onChange={setFieldValue}
                    error={error?.lookFor}
                    hint="What should the users look for (e.g. buildings, cars, trees)? Note: This field is used only for legacy app as a fallback for 'Instruction'"
                    disabled={disabled}
                />
                <TeamSelectInput
                    label="Select Team (Private)"
                    name="team"
                    hint="Select the team for which this project should be displayed. If selected, this project will only be visible to the team members"
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
