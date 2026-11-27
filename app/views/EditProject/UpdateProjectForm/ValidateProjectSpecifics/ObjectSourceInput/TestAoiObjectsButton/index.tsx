import {
    useCallback,
    useEffect,
} from 'react';
import {
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import { gql } from 'urql';

import Button from '#components/Button';
import { useTestAoiObjectsQuery } from '#generated/types/graphql';

import {
    getObjectSourceTestResult,
    type ObjectSourceTestResult,
} from '../utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_AOI_OBJECTS_QUERY = gql`
query TestAoiObjects($assetId: ID!, $projectId: ID!, $ohsomeFilter: String!) {
    testAoiObjects(assetId: $assetId, projectId: $projectId, ohsomeFilter: $ohsomeFilter) {
        __typename
        ok
        error
        objectCount
        assetId
        projectId
        ohsomeFilter
    }
}
`;

interface Props {
    projectId: string;
    aoiGeometry: string | undefined;
    ohsomeFilter: string | undefined;
    disabled?: boolean;
    onPendingChange: (pending: boolean) => void;
    onTestComplete: (result: ObjectSourceTestResult) => void;
}

// NOTE: The ohsome test of an uploaded AOI is optional and not saved
function TestAoiObjectsButton(props: Props) {
    const {
        projectId,
        aoiGeometry,
        ohsomeFilter,
        disabled,
        onPendingChange,
        onTestComplete,
    } = props;

    const [
        {
            data,
            fetching,
            error,
        },
        triggerTest,
    ] = useTestAoiObjectsQuery({
        variables: {
            projectId,
            assetId: aoiGeometry ?? '',
            ohsomeFilter: ohsomeFilter ?? '',
        },
        pause: true,
    });

    useEffect(() => {
        if (fetching || (isNotDefined(data) && isNotDefined(error))) {
            return;
        }
        onPendingChange(false);
        onTestComplete(getObjectSourceTestResult(data?.testAoiObjects, error));
    // NOTE: Only report when a test finishes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetching, data, error]);

    const handleClick = useCallback(() => {
        if (!isTruthyString(aoiGeometry)) {
            onTestComplete({ ok: false, message: 'Please upload the AOI geometry first' });
            return;
        }
        if (!isTruthyString(ohsomeFilter)) {
            onTestComplete({ ok: false, message: 'Please enter an ohsome filter first' });
            return;
        }
        onPendingChange(true);
        triggerTest({ requestPolicy: 'network-only' });
    }, [aoiGeometry, ohsomeFilter, triggerTest, onPendingChange, onTestComplete]);

    return (
        <Button
            name={undefined}
            onClick={handleClick}
            disabled={disabled || fetching}
        >
            {fetching ? 'Testing AOI on ohsome...' : 'Test AOI on ohsome'}
        </Button>
    );
}

export default TestAoiObjectsButton;
