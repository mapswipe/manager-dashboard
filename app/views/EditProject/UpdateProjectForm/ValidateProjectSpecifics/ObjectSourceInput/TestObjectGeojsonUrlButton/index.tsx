import { useCallback } from 'react';
import { isTruthyString } from '@togglecorp/fujs';
import { gql } from 'urql';

import Button from '#components/Button';
import { useTestObjectGeojsonUrlMutation } from '#generated/types/graphql';
import { OPERATION_INFO_FRAGMENT } from '#utils/query';

import {
    getObjectSourceTestResult,
    type ObjectSourceTestResult,
} from '../utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_OBJECT_GEOJSON_URL_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation TestObjectGeojsonUrl($projectId: ID!, $objectGeojsonUrl: String!) {
    testObjectGeojsonUrl(projectId: $projectId, objectGeojsonUrl: $objectGeojsonUrl) {
        ... on TestValidateObjectGeojsonUrlResponse {
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
    objectGeojsonUrl: string | undefined;
    disabled?: boolean;
    onPendingChange: (pending: boolean) => void;
    onTestComplete: (result: ObjectSourceTestResult) => void;
}

function TestObjectGeojsonUrlButton(props: Props) {
    const {
        projectId,
        objectGeojsonUrl,
        disabled,
        onPendingChange,
        onTestComplete,
    } = props;

    const [{ fetching }, triggerTest] = useTestObjectGeojsonUrlMutation();

    const handleClick = useCallback(async () => {
        if (!isTruthyString(objectGeojsonUrl)) {
            onTestComplete({ ok: false, message: 'Please enter a GeoJSON URL first' });
            return;
        }

        onPendingChange(true);
        const { data, error } = await triggerTest({
            projectId,
            objectGeojsonUrl,
        });
        onPendingChange(false);
        onTestComplete(getObjectSourceTestResult(data?.testObjectGeojsonUrl, error));
    }, [projectId, objectGeojsonUrl, triggerTest, onPendingChange, onTestComplete]);

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

export default TestObjectGeojsonUrlButton;
