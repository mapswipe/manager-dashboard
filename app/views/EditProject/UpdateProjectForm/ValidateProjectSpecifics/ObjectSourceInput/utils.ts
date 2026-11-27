import { isNotDefined } from '@togglecorp/fujs';
import { CombinedError } from 'urql';

import {
    TestAoiObjectsQuery,
    TestObjectGeojsonUrlMutation,
    TestTaskingManagerProjectMutation,
} from '#generated/types/graphql';
import { getErrorMessageAndDescriptionForCombinedError } from '#utils/error';

export type ObjectSourceTestResult = (
    | { ok: true, objectCount: number, aoiGeometry: string | undefined }
    | { ok: false, message: string }
);

type ObjectSourceTestResponse = TestAoiObjectsQuery['testAoiObjects']
    | TestObjectGeojsonUrlMutation['testObjectGeojsonUrl']
    | TestTaskingManagerProjectMutation['testTaskingManagerProject'];

// NOTE: Shared by the tests of all 3 object source types
export function getObjectSourceTestResult(
    testResponse: ObjectSourceTestResponse | undefined,
    requestError: CombinedError | undefined,
): ObjectSourceTestResult {
    // eslint-disable-next-line no-underscore-dangle
    if (testResponse?.__typename === 'OperationInfo') {
        return {
            ok: false,
            message: testResponse.messages.map(({ message }) => message).join(', '),
        };
    }

    if (
        isNotDefined(testResponse)
        || !testResponse.ok
        || isNotDefined(testResponse.objectCount)
    ) {
        const requestErrorMessage = requestError
            && getErrorMessageAndDescriptionForCombinedError(requestError).description;
        return {
            ok: false,
            message: testResponse?.error
                ?? requestErrorMessage
                ?? 'Something unexpected has occurred',
        };
    }

    return {
        ok: true,
        objectCount: testResponse.objectCount,
        // eslint-disable-next-line no-underscore-dangle
        aoiGeometry: testResponse.__typename === 'TestValidateAoiObjectsResponse'
            ? undefined
            : testResponse.aoiGeometryAsset?.id,
    };
}
