import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    nonFieldError,
    ObjectError,
} from '@togglecorp/toggle-form';
import {
    CombinedError,
    OperationResult,
} from 'urql';

import useAlert from '#hooks/useAlert';

interface PydanticError {
    type: string,
    loc: string[];
    msg: string;
    input: string;
}

interface ServerError {
    array_errors: unknown[] | null,
    client_id: string | null,
    field: string,
    messages: string | string[] | null,
    object_errors: unknown[] | null,
    pydantic_errors: PydanticError[],
}

function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

type GenericObjectError = {
    [key: string]: GenericFormError;
    [nonFieldError]?: GenericFormError;
}
type GenericFormError = string | GenericObjectError;

function getFormErrorFromPydanticError(
    error: PydanticError,
): string | Record<string, GenericFormError> {
    const currentField = error.loc[0];

    if (currentField) {
        return {
            [snakeToCamel(currentField)]: getFormErrorFromPydanticError({
                ...error,
                loc: error.loc.slice(1),
            }),
        };
    }

    return error.msg;
}

export function transformErrors(errors: ServerError[]) {
    const mappedErrors: ObjectError<object> = listToMap(
        errors,
        ({ field }) => field,
        ({
            messages,
            pydantic_errors,
            array_errors,
            object_errors,
        }) => {
            if (isDefined(messages)) {
                if (Array.isArray(messages)) {
                    return messages.join(', ');
                }

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
                return pydantic_errors.map((pydantic_error) => (
                    getFormErrorFromPydanticError(pydantic_error)
                )).reduce((acc: GenericObjectError, val) => {
                    if (typeof val === 'string') {
                        acc[nonFieldError] = acc[nonFieldError] ? `${acc[nonFieldError]}, ${val}` : val;
                        return acc;
                    }

                    return {
                        ...acc,
                        ...val,
                    };
                }, {} as GenericObjectError);
            }

            return {
                [nonFieldError]: 'Unknown error occured',
            };
        },
    );

    if (isDefined(mappedErrors) && 'nonFieldErrors' in mappedErrors && isDefined(mappedErrors.nonFieldErrors)) {
        // @ts-expect-error fix typing
        mappedErrors[nonFieldError] = mappedErrors.nonFieldErrors;
    }

    return mappedErrors;
}

export function getGraphQLErrorsFromResult<T>(result: OperationResult<T>) {
    return result?.error?.graphQLErrors;
}

export function getErrorMessageFromResult<T>(result: OperationResult<T>) {
    const gqlErrors = getGraphQLErrorsFromResult(result);

    if (isNotDefined(gqlErrors) || gqlErrors.length === 0) {
        return undefined;
    }

    const errorMessage = gqlErrors.map((gqlError) => gqlError.message).join(', ');

    return errorMessage;
}

export function getErrorMessageAndDescriptionForCombinedError(
    combinedError: unknown,
) {
    if (!(combinedError instanceof CombinedError)) {
        // eslint-disable-next-line no-console
        console.error(combinedError);

        return {
            message: 'Unkown error!',
            description: 'Please see developer console for more info!',
            debugMessage: undefined,
        };
    }

    if (combinedError.graphQLErrors.length !== 0) {
        return {
            message: 'Request failed!',
            description: combinedError.graphQLErrors.map((error) => error.message).join(', '),
            debugMessage: JSON.stringify(combinedError.graphQLErrors, null, 2),
        };
    }

    if (combinedError.networkError) {
        return {
            message: 'Network error!',
            description: 'Please make sure that you have an active internet connection!',
            debugMessage: JSON.stringify(combinedError.networkError, null, 2),
        };
    }

    // eslint-disable-next-line no-console
    console.error(combinedError);
    return {
        message: 'Unkown error!',
        description: 'Please see developer console for more info!',
        debugMessage: undefined,
    };
}

export function alertCombinedError(
    combinedError: unknown,
    alert: ReturnType<typeof useAlert>,
) {
    const {
        message,
        description,
        debugMessage,
    } = getErrorMessageAndDescriptionForCombinedError(combinedError);

    alert.show(
        message,
        {
            description,
            variant: 'danger',
            debugMessage,
        },
    );
}

export function checkAndAlertGraphQLResultError<T>(
    result: OperationResult<T>,
    alert: ReturnType<typeof useAlert>,
) {
    const gqlErrors = getGraphQLErrorsFromResult(result);
    if (isDefined(gqlErrors) && gqlErrors.length > 0) {
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
