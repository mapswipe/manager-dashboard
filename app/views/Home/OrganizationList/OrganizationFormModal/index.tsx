import {
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';
import { gql } from 'urql';

import Button from '#components/Button';
import Modal from '#components/Modal';
import NonFieldError from '#components/NonFieldError';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';
import {
    type OrganizationCreateInput,
    OrganizationUpdateInput,
    useCreateOrganizationMutation,
    useOrganizationDetailsQuery,
    useUpdateOrganizationMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';
import { OPERATION_INFO_FRAGMENT } from '#utils/query';
import { DeepNonNullable } from '#utils/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ORGANIZATION_CREATE_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation CreateOrganization($data: OrganizationCreateInput!) {
    createOrganization(data: $data) {
        ... on OrganizationTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                id
                name
                abbreviation
                description
                clientId
                modifiedBy {
                    id
                    displayName
                }
                modifiedAt
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ORGANIZATION_UPDATE_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation UpdateOrganization($id: ID!, $data: OrganizationUpdateInput!) {
    updateOrganization(pk: $id, data: $data) {
        ... on OrganizationTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                id
                name
                abbreviation
                description
                clientId
                modifiedBy {
                    id
                    displayName
                }
                modifiedAt
            }
        }
        ... on OperationInfo {
            ...OperationInfoFields
        }
    }
}
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ORGANIZATION_DETAILS_QUERY = gql`
query organizationDetails($id: ID!) {
    organization(id: $id) {
        clientId
        id
        modifiedBy {
            id
            displayName
        }
        modifiedAt
        name
        abbreviation
        description
    }
}
`;

type OrganizationInput = Pick<OrganizationCreateInput & OrganizationUpdateInput, 'clientId' | 'name' | 'abbreviation' | 'description'>;

type PartialOrganizationCreateInputFields = PartialForm<
    DeepNonNullable<OrganizationInput>,
    'clientId'
>

type OrganizationCreateFormSchema = ObjectSchema<PartialOrganizationCreateInputFields>;

const schema: OrganizationCreateFormSchema = {
    fields: (): ReturnType<OrganizationCreateFormSchema['fields']> => ({
        clientId: {},
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {
            requiredValidation: requiredStringCondition,
        },
        abbreviation: {
            requiredValidation: requiredStringCondition,
        },
    }),
};

interface Props {
    organizationId?: string;
    onClose: (_?: undefined) => void;
    onUpdate: () => void;
}

function OrganizationFormModal(props: Props) {
    const {
        onClose,
        onUpdate,
        organizationId,
    } = props;

    const alert = useAlert();

    const defaultFormValue = useMemo<PartialOrganizationCreateInputFields>(() => ({
        clientId: ulid(),
    }), []);

    const [
        { fetching: createOrganizationPending },
        createOrganization,
    ] = useCreateOrganizationMutation();

    const [
        { fetching: updateOrganizationPending },
        updateOrganization,
    ] = useUpdateOrganizationMutation();

    const [{
        data: organizationQueryResponse,
    }] = useOrganizationDetailsQuery({
        variables: { id: organizationId ?? '' },
    });

    const {
        value,
        setFieldValue,
        error: formError,
        validate,
        setError,
        setValue,
    } = useForm(schema, { value: defaultFormValue });

    const error = getErrorObject(formError);

    useEffect(() => {
        if (isNotDefined(organizationQueryResponse)) {
            return;
        }

        const {
            organization: {
                name,
                clientId,
                abbreviation,
                description,
            },
        } = organizationQueryResponse;

        if (isNotDefined(clientId)) {
            return;
        }

        setValue({
            clientId,
            abbreviation: abbreviation ?? undefined,
            description: description ?? undefined,
            name,
        });
    }, [organizationQueryResponse, setValue]);

    const handleFormSubmission = useCallback(
        async (submittedValues: PartialOrganizationCreateInputFields) => {
            const finalValue = submittedValues as OrganizationInput;
            if (isNotDefined(organizationId)) {
                try {
                    const result = await createOrganization({
                        data: finalValue,
                    });

                    if (checkAndAlertGraphQLResultError(result, alert)) {
                        return;
                    }

                    if (isNotDefined(result.data)
                        // eslint-disable-next-line no-underscore-dangle
                        || result.data.createOrganization.__typename !== 'OrganizationTypeMutationResponseType'
                    ) {
                        alert.show(
                            'Failed to create the Organization!',
                            {
                                description: 'Unexpectected response from the server!',
                                variant: 'danger',
                            },
                        );

                        return;
                    }

                    const {
                        ok,
                        errors,
                        result: createOrganizationResult,
                    } = result.data.createOrganization;

                    if (!ok || !createOrganizationResult) {
                        alert.show(
                            'Failed to create the Organization!',
                            {
                                description: 'Please fix the errors and try again!',
                                variant: 'danger',
                            },
                        );
                        setError(transformErrors(errors));
                        return;
                    }

                    alert.show(
                        'Organization created successfully!',
                        {
                            variant: 'success',
                        },
                    );

                    onUpdate();
                } catch (apolloError) {
                    alertCombinedError(apolloError, alert);
                }

                return;
            }

            try {
                const result = await updateOrganization({
                    id: organizationId,
                    data: finalValue,
                });

                if (checkAndAlertGraphQLResultError(result, alert)) {
                    return;
                }

                if (isNotDefined(result.data)
                    // eslint-disable-next-line no-underscore-dangle
                    || result.data.updateOrganization.__typename !== 'OrganizationTypeMutationResponseType'
                ) {
                    alert.show(
                        'Failed to create the Organization!',
                        {
                            description: 'Unexpectected response from the server!',
                            variant: 'danger',
                        },
                    );

                    return;
                }

                const {
                    ok,
                    errors,
                    result: updateOrganizationResult,
                } = result.data.updateOrganization;

                if (!ok || !updateOrganizationResult) {
                    alert.show(
                        'Failed to update the Organization!',
                        {
                            description: 'Please fix the errors and try again!',
                            variant: 'danger',
                        },
                    );
                    setError(transformErrors(errors));
                    return;
                }

                alert.show(
                    'Organization updated successfully!',
                    {
                        variant: 'success',
                    },
                );

                onUpdate();
            } catch (apolloError) {
                alertCombinedError(apolloError, alert);
            }
        },
        [organizationId, createOrganization, alert, onUpdate, setError, updateOrganization],
    );

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const inputsDisabled = createOrganizationPending || updateOrganizationPending;
    const actionsDisabled = inputsDisabled;

    return (
        <Modal
            onClose={onClose}
            heading={isDefined(organizationId) ? 'Update Organization' : 'Add Organization'}
            withHeaderBorder
            withFooterBorder
            spacing="lg"
            footerActions={(
                <Button
                    name={undefined}
                    colorVariant="accent"
                    styleVariant="filled"
                    onClick={handleSubmitButtonClick}
                    disabled={actionsDisabled}
                >
                    {isDefined(organizationId) ? 'Update Organization' : 'Add Organization'}
                </Button>
            )}
            size="sm"
        >
            <NonFieldError
                error={error}
            />
            <TextInput
                name="name"
                label="Name"
                value={value?.name}
                onChange={setFieldValue}
                error={error?.name}
                disabled={inputsDisabled}
            />
            <TextInput
                name="abbreviation"
                label="Abbreviation"
                value={value?.abbreviation}
                onChange={setFieldValue}
                error={error?.abbreviation}
                disabled={inputsDisabled}
            />
            <TextArea
                value={value?.description}
                name="description"
                onChange={setFieldValue}
                label="Description"
                error={error?.description}
                disabled={inputsDisabled}
            />
        </Modal>
    );
}

export default OrganizationFormModal;
