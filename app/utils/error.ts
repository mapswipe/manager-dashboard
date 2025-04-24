import { listToMap } from "@togglecorp/fujs";
import { nonFieldError } from "@togglecorp/toggle-form";

interface Error {
    arrayErrors: unknown[] | null,
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

// eslint-disable-next-line import/prefer-default-export
export function transformErrors(errors: Error[]) {
    const mappedErrors = listToMap(
        errors,
        ({ field }) => field,
        ({ pydantic_errors }) => ({
            [nonFieldError]: pydantic_errors.map(({ msg }) => msg).join(' '),
        }),
    );

    return mappedErrors;
}
