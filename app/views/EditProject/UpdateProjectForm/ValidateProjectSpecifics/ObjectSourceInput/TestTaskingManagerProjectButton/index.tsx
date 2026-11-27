import { useCallback } from 'react';
import { isTruthyString } from '@togglecorp/fujs';
import { gql } from 'urql';

import Button from '#components/Button';
import { useTestTaskingManagerProjectMutation } from '#generated/types/graphql';
import { OPERATION_INFO_FRAGMENT } from '#utils/query';

import {
    getObjectSourceTestResult,
    type ObjectSourceTestResult,
} from '../utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_TASKING_MANAGER_PROJECT_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation TestTaskingManagerProject($projectId: ID!, $hotTmId: String!, $ohsomeFilter: String!) {
    testTaskingManagerProject(projectId: $projectId, hotTmId: $hotTmId, ohsomeFilter: $ohsomeFilter) {
        ... on TestValidateTaskingManagerProjectResponse {
            __typename
            ok
            error
            objectCount
            aoiGeometryAsset {
                id
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

interface Props {
    projectId: string;
    taskingManagerProjectId: string | undefined;
    ohsomeFilter: string | undefined;
    disabled?: boolean;
    onPendingChange: (pending: boolean) => void;
    onTestComplete: (result: ObjectSourceTestResult) => void;
}

function TestTaskingManagerProjectButton(props: Props) {
    const {
        projectId,
        taskingManagerProjectId,
        ohsomeFilter,
        disabled,
        onPendingChange,
        onTestComplete,
    } = props;

    const [{ fetching }, triggerTest] = useTestTaskingManagerProjectMutation();

    const handleClick = useCallback(async () => {
        if (!isTruthyString(taskingManagerProjectId)) {
            onTestComplete({ ok: false, message: 'Please enter a Tasking Manager project ID first' });
            return;
        }
        if (!isTruthyString(ohsomeFilter)) {
            onTestComplete({ ok: false, message: 'Please enter an ohsome filter first' });
            return;
        }

        onPendingChange(true);
        const { data, error } = await triggerTest({
            projectId,
            hotTmId: taskingManagerProjectId,
            ohsomeFilter,
        });
        onPendingChange(false);
        onTestComplete(getObjectSourceTestResult(data?.testTaskingManagerProject, error));
    }, [
        projectId,
        taskingManagerProjectId,
        ohsomeFilter,
        triggerTest,
        onPendingChange,
        onTestComplete,
    ]);

    return (
        <Button
            name={undefined}
            onClick={handleClick}
            disabled={disabled || fetching}
        >
            {fetching ? 'Validating AOI...' : 'Validate AOI'}
        </Button>
    );
}

export default TestTaskingManagerProjectButton;
