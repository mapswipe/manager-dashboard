import {
    useCallback,
    useMemo,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
    PartialForm,
} from '@togglecorp/toggle-form';
import { gql } from 'urql';

import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import MarkdownEditor from '#components/MarkdownEditor';
import NumberInput from '#components/NumberInput';
import OrganizationSelectInput from '#components/selections/OrganizationSelectInput';
import TeamSelectInput from '#components/selections/TeamSelectInput';
import TextInput from '#components/TextInput';
import {
    ProjectCreateInput,
    ProjectNameInput,
    ProjectTypeEnum,
    ProjectUpdateInput,
    useProjectNameQuery,
} from '#generated/types/graphql';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { DeepNonNullable } from '#utils/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECT_NAME_QUERY = gql`
query ProjectName($params: ProjectNameInput) {
    projectName(params: $params)
}
`;

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

const hintText: Record<
    keyof ProjectGeneralInputFields,
    Record<ProjectTypeEnum, string | undefined>
> = {
    description: {
        [ProjectTypeEnum.Find]: 'Enter the description for your project. (markdown syntax is supported)',
        [ProjectTypeEnum.Compare]: 'Enter the description for your project. (markdown syntax is supported)',
        [ProjectTypeEnum.Validate]: 'Enter the description for your project. (markdown syntax is supported)',
        [ProjectTypeEnum.ValidateImage]: 'Enter the description for your project. (markdown syntax is supported)',
        [ProjectTypeEnum.Completeness]: 'Enter the description for your project. (markdown syntax is supported)',
        [ProjectTypeEnum.Street]: 'Enter the description for your project. (markdown syntax is supported)',
        [ProjectTypeEnum.Conflation]: 'Enter the description for your project. (markdown syntax is supported)',
    },
    topic: {
        [ProjectTypeEnum.Find]: 'Enter the title of your project.',
        [ProjectTypeEnum.Compare]: 'Enter the title of your project.',
        [ProjectTypeEnum.Validate]: 'Enter the title of your project.',
        [ProjectTypeEnum.ValidateImage]: 'Enter the title of your project.',
        [ProjectTypeEnum.Completeness]: 'Enter the title of your project.',
        [ProjectTypeEnum.Street]: 'Enter the title of your project.',
        [ProjectTypeEnum.Conflation]: 'Enter the title of your project.',
    },
    projectInstruction: {
        [ProjectTypeEnum.Find]: 'What should the users look for (e.g. You are looking for: buildings, destroyed buildings, cars, trees, etc.)',
        [ProjectTypeEnum.Compare]: 'What should the users look to compare (e.g. You should identify where forest coverage has  declined)',
        [ProjectTypeEnum.Validate]: 'What should the users look to validate (e.g. Does the mapped outline match the building footprint?)',
        [ProjectTypeEnum.ValidateImage]: 'What should the users look to assess? (e.g., You are looking for trees)',
        [ProjectTypeEnum.Completeness]: undefined,
        [ProjectTypeEnum.Street]: undefined,
        [ProjectTypeEnum.Conflation]: undefined,
    },
    lookFor: {
        [ProjectTypeEnum.Find]: '[This field is used only for legacy app!] What should the users look for? (e.g., buildings, cars, trees)',
        [ProjectTypeEnum.Compare]: '[This field is used only for legacy app!] What should the users look for? (e.g., buildings, cars, trees)',
        [ProjectTypeEnum.Validate]: '[This field is used only for legacy app!] What should the users look for? (e.g., buildings, cars, trees)',
        [ProjectTypeEnum.ValidateImage]: '[This field is used only for legacy app!] What should the users look for? (e.g., buildings, cars, trees)',
        [ProjectTypeEnum.Completeness]: '[This field is used only for legacy app!] What should the users look for? (e.g., buildings, cars, trees)',
        [ProjectTypeEnum.Street]: '[This field is used only for legacy app!] What should the users look for? (e.g., buildings, cars, trees)',
        [ProjectTypeEnum.Conflation]: '[This field is used only for legacy app!] What should the users look for? (e.g., buildings, cars, trees)',
    },
    additionalInfoUrl: {
        [ProjectTypeEnum.Find]: 'Provide an optional link to a resource with additional information on the project (only visible in the MapSwipe web app)',
        [ProjectTypeEnum.Compare]: 'Provide an optional link to a resource with additional information on the project (only visible in the MapSwipe web app)',
        [ProjectTypeEnum.Validate]: 'Provide an optional link to a resource with additional information on the project (only visible in the MapSwipe web app)',
        [ProjectTypeEnum.ValidateImage]: 'Provide an optional link to a resource with additional information on the project (only visible in the MapSwipe web app)',
        [ProjectTypeEnum.Completeness]: 'Provide an optional link to a resource with additional information on the project (only visible in the MapSwipe web app)',
        [ProjectTypeEnum.Street]: 'Provide an optional link to a resource with additional information on the project (only visible in the MapSwipe web app)',
        [ProjectTypeEnum.Conflation]: 'Provide an optional link to a resource with additional information on the project (only visible in the MapSwipe web app)',
    },
    projectNumber: {
        [ProjectTypeEnum.Find]: 'Is this project part of a bigger campaign with multiple projects? If so, increment this number up by one each time you create a new project in the series. ',
        [ProjectTypeEnum.Compare]: 'Is this project part of a bigger campaign with multiple projects? If so, increment this number up by one each time you create a new project in the series. ',
        [ProjectTypeEnum.Validate]: 'Is this project part of a bigger campaign with multiple projects? If so, increment this number up by one each time you create a new project in the series. ',
        [ProjectTypeEnum.ValidateImage]: 'Is this project part of a bigger campaign with multiple projects? If so, increment this number up by one each time you create a new project in the series. ',
        [ProjectTypeEnum.Completeness]: 'Is this project part of a bigger campaign with multiple projects? If so, increment this number up by one each time you create a new project in the series. ',
        [ProjectTypeEnum.Street]: 'Is this project part of a bigger campaign with multiple projects? If so, increment this number up by one each time you create a new project in the series. ',
        [ProjectTypeEnum.Conflation]: 'Is this project part of a bigger campaign with multiple projects? If so, increment this number up by one each time you create a new project in the series. ',
    },
    region: {
        [ProjectTypeEnum.Find]: 'Enter the region/location of your project (eg: City, Country)',
        [ProjectTypeEnum.Compare]: 'Enter the region/location of your project (eg: City, Country)',
        [ProjectTypeEnum.Validate]: 'Enter the region/location of your project (eg: City, Country)',
        [ProjectTypeEnum.ValidateImage]: 'Enter the region/location of your project (eg: City, Country)',
        [ProjectTypeEnum.Completeness]: 'Enter the region/location of your project (eg: City, Country)',
        [ProjectTypeEnum.Street]: 'Enter the region/location of your project (eg: City, Country)',
        [ProjectTypeEnum.Conflation]: 'Enter the region/location of your project (eg: City, Country)',
    },
    requestingOrganization: {
        [ProjectTypeEnum.Find]: 'Which group, institution or community is requesting this project?',
        [ProjectTypeEnum.Compare]: 'Which group, institution or community is requesting this project?',
        [ProjectTypeEnum.Validate]: 'Which group, institution or community is requesting this project?',
        [ProjectTypeEnum.ValidateImage]: 'Which group, institution or community is requesting this project?',
        [ProjectTypeEnum.Completeness]: 'Which group, institution or community is requesting this project?',
        [ProjectTypeEnum.Street]: 'Which group, institution or community is requesting this project?',
        [ProjectTypeEnum.Conflation]: 'Which group, institution or community is requesting this project?',
    },
    team: {
        [ProjectTypeEnum.Find]: 'Please note that if \'private\', this project will only be visible to the assigned team members. Data results will still be public.',
        [ProjectTypeEnum.Compare]: 'Please note that if \'private\', this project will only be visible to the assigned team members. Data results will still be public.',
        [ProjectTypeEnum.Validate]: 'Please note that if \'private\', this project will only be visible to the assigned team members. Data results will still be public.',
        [ProjectTypeEnum.ValidateImage]: 'Please note that if \'private\', this project will only be visible to the assigned team members. Data results will still be public.',
        [ProjectTypeEnum.Completeness]: 'Please note that if \'private\', this project will only be visible to the assigned team members. Data results will still be public.',
        [ProjectTypeEnum.Street]: 'Please note that if \'private\', this project will only be visible to the assigned team members. Data results will still be public.',
        [ProjectTypeEnum.Conflation]: 'Please note that if \'private\', this project will only be visible to the selected  team members. Data results will still be public.',
    },
};

type PartialProjectGeneralInputFields = PartialForm<
    DeepNonNullable<ProjectGeneralInputFields>
>;

interface Props {
    projectType: ProjectTypeEnum | undefined;
    value: PartialProjectGeneralInputFields | undefined;
    error: LeafError | ObjectError<PartialProjectGeneralInputFields>;
    setFieldValue: (...entries: EntriesAsList<PartialProjectGeneralInputFields>) => void;
    disabled?: boolean | (keyof ProjectGeneralInputFields)[];
}

function ProjectGeneralInputs(props: Props) {
    const {
        projectType,
        value,
        error: formError,
        setFieldValue,
        disabled,
    } = props;

    const projectNameParams = useMemo(() => {
        if (isNotDefined(value?.topic)
            || isNotDefined(projectType)
            || isNotDefined(value.requestingOrganization)
            || isNotDefined(value.region)
            || isNotDefined(value.projectNumber)
        ) {
            return undefined;
        }

        return {
            projectType,
            topic: value.topic,
            requestingOrganizationId: value.requestingOrganization,
            region: value.region,
            projectNumber: value.projectNumber,
        } satisfies ProjectNameInput;
    }, [value, projectType]);

    const debouncedProjectNameParams = useDebouncedValue(projectNameParams);

    const [{
        data: projectNameResult,
    }] = useProjectNameQuery({
        variables: {
            params: debouncedProjectNameParams,
        },
        pause: isNotDefined(debouncedProjectNameParams),
    });

    const error = getErrorObject(formError);

    const getHint = useCallback((field: keyof ProjectGeneralInputFields) => {
        if (isNotDefined(projectType) || isNotDefined(field)) {
            return undefined;
        }

        return hintText[field][projectType];
    }, [projectType]);

    const isDisabled = useCallback((field: keyof ProjectGeneralInputFields) => {
        if (isNotDefined(disabled)) {
            return false;
        }

        if (Array.isArray(disabled)) {
            return disabled.includes(field);
        }

        return disabled;
    }, [disabled]);

    return (
        <Container
            heading="General"
            withContentBackgroundAndPadding
            spacing="lg"
        >
            <ListLayout layout="grid">
                <TextInput
                    label="Project topic"
                    name="topic"
                    value={value?.topic}
                    onChange={setFieldValue}
                    error={error?.topic}
                    disabled={isDisabled('topic')}
                    hint={getHint('topic')}
                />
                <TextInput
                    label="Project region"
                    name="region"
                    value={value?.region}
                    onChange={setFieldValue}
                    error={error?.region}
                    disabled={isDisabled('region')}
                    hint={getHint('region')}
                />
                <NumberInput
                    label="Project number"
                    name="projectNumber"
                    value={value?.projectNumber}
                    onChange={setFieldValue}
                    error={error?.projectNumber}
                    disabled={isDisabled('projectNumber')}
                    hint={getHint('projectNumber')}
                />
                <OrganizationSelectInput
                    label="Organization"
                    name="requestingOrganization"
                    value={value?.requestingOrganization}
                    onChange={setFieldValue}
                    error={error?.requestingOrganization}
                    disabled={isDisabled('requestingOrganization')}
                    hint={getHint('requestingOrganization')}
                />
            </ListLayout>
            <TextInput
                label="Project name (readonly)"
                name={undefined}
                value={projectNameResult?.projectName}
                placeholder="Please select all the fields above to see the preview"
                hint="We will generate your project name based on your inputs above."
                readOnly
            />
            <MarkdownEditor
                label="Project description"
                name="description"
                value={value?.description}
                onChange={setFieldValue}
                error={error?.description}
                disabled={isDisabled('description')}
                hint={getHint('description')}
            />
            <ListLayout
                layout="grid"
                spacing="lg"
            >
                {/*
                    Remove instruction and lookFor inputs if project type is conflation,
                    as values are hard-coded on form submission
                */}
                {projectType !== ProjectTypeEnum.Conflation && (
                    <>
                        <TextInput
                            label="Instruction"
                            name="projectInstruction"
                            value={value?.projectInstruction}
                            onChange={setFieldValue}
                            error={error?.projectInstruction}
                            disabled={isDisabled('projectInstruction')}
                            hint={getHint('projectInstruction')}
                        />
                        <TextInput
                            label="Look for (legacy)"
                            name="lookFor"
                            value={value?.lookFor}
                            onChange={setFieldValue}
                            error={error?.lookFor}
                            hint={getHint('lookFor')}
                            disabled={isDisabled('lookFor')}
                        />
                    </>
                )}
                <TeamSelectInput
                    label="Select Team (Private)"
                    name="team"
                    hint={getHint('team')}
                    value={value?.team}
                    onChange={setFieldValue}
                    error={error?.team}
                    disabled={isDisabled('team')}
                />
                <TextInput
                    label="Additional info URL"
                    name="additionalInfoUrl"
                    value={value?.additionalInfoUrl}
                    onChange={setFieldValue}
                    error={error?.additionalInfoUrl}
                    disabled={isDisabled('additionalInfoUrl')}
                    hint={getHint('additionalInfoUrl')}
                />
            </ListLayout>
        </Container>
    );
}

export default ProjectGeneralInputs;
