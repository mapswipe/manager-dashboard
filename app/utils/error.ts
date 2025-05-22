import {
    ApolloError,
    FetchResult,
} from '@apollo/client';
import {
    getGraphQLErrorsFromResult,
    graphQLResultHasError,
} from '@apollo/client/utilities';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';

import useAlert from '#hooks/useAlert';

interface Error {
    array_errors: unknown[] | null,
    client_id: string | null,
    field: string,
    messages: unknown[] | null,
    object_errors: unknown[] | null,
    pydantic_errors: {
        input: unknown;
        loc: string[],
        msg: string,
        type: string,
    }[],
}

export function transformErrors(errors: Error[]) {
    const mappedErrors = listToMap(
        errors,
        ({ field }) => field ?? nonFieldError,
        ({
            messages,
            pydantic_errors,
            array_errors,
            object_errors,
        }) => {
            if (isDefined(messages)) {
                return messages;
            }

            if (array_errors) {
                // eslint-disable-next-line no-console
                console.error('Array errors not handled', array_errors);
            }

            if (object_errors) {
                // eslint-disable-next-line no-console
                console.error('Object errors not handled', object_errors);
            }

            if (pydantic_errors) {
                return {
                    [nonFieldError]: [
                        pydantic_errors?.map(({ msg }) => msg).join(' '),
                    ],
                };
            }

            return {
                [nonFieldError]: 'Unknown error occured',
            };
        },
    );

    return mappedErrors;
}

export function alertApolloError(
    apolloError: unknown,
    alert: ReturnType<typeof useAlert>,
) {
    if (!(apolloError instanceof ApolloError)) {
        alert.show(
            'Unkown error!',
            {
                description: 'Please see developer console for more info!',
                variant: 'danger',
                // debugMessage: JSON.stringify(apolloError, null, 2),
            },
        );

        // eslint-disable-next-line no-console
        console.error(apolloError);

        return;
    }

    if (apolloError.graphQLErrors.length !== 0) {
        alert.show(
            'Request failed!',
            {
                description: apolloError.graphQLErrors.map((error) => error.message).join(', '),
                // eslint-disable-next-line max-len
                // description: 'There\'s an error with the query, please copy the error message and contact the developer!',
                variant: 'danger',
                debugMessage: JSON.stringify(apolloError.graphQLErrors, null, 2),
            },
        );
    }

    if (apolloError.networkError) {
        alert.show(
            'Network error!',
            {
                description: 'Please make sure that you have an active internet connection!',
                variant: 'danger',
                debugMessage: JSON.stringify(apolloError.networkError, null, 2),
            },
        );
    }

    // TODO:
    // apolloError.clientErrors
    // apolloError.protocolErrors
}

export function checkAndAlertGraphQLResultError<T>(
    result: FetchResult<T>,
    alert: ReturnType<typeof useAlert>,
) {
    if (graphQLResultHasError(result)) {
        const gqlErrors = getGraphQLErrorsFromResult(result);
        const errorMessage = gqlErrors.map((gqlError) => gqlError.message).join(', ');

        alert.show(
            'Failed to update the Project!',
            {
                description: errorMessage,
                variant: 'danger',
                debugMessage: JSON.stringify(gqlErrors),
            },
        );

        return true;
    }

    return false;
}
