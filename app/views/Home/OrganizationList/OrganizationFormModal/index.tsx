import {
    useCallback,
    useMemo,
} from 'react';
import {
    gql,
    useMutation,
} from '@apollo/client';
import { isNotDefined } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import { ulid } from 'ulid';

import Button from '#components/Button';
import Modal from '#components/Modal';
import NonFieldError from '#components/NonFieldError';
import TextArea from '#components/TextArea';
import TextInput from '#components/TextInput';
import {
    CreateOrganizationMutation,
    CreateOrganizationMutationVariables,
    OrganizationCreateInput,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    alertApolloError,
    checkAndAlertGraphQLResultError,
    transformErrors,
} from '#utils/error';
import { DeepNonNullable } from '#utils/types';

const ORGANIZATION_MUTATION = gql`
mutation CreateOrganization($data: OrganizationCreateInput!) {
    createOrganization(data: $data) {
        ... on OrganizationTypeMutationResponseType {
            errors
            ok
            result {
                id
                name
                clientId
            }
        }
    }
}
`;

type PartialOrganizationCreateInputFields = PartialForm<
    DeepNonNullable<OrganizationCreateInput>,
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
    }),
};

interface Props {
    onClose: () => void;
    onUpdate: () => void;
}

function OrganizationFormModal(props: Props) {
    const {
        onClose,
        onUpdate,
    } = props;

    const alert = useAlert();

    const defaultFormValue = useMemo<PartialOrganizationCreateInputFields>(() => ({
        clientId: ulid(),
    }), []);

    const [
        createOrganization,
    ] = useMutation<CreateOrganizationMutation, CreateOrganizationMutationVariables>(
        ORGANIZATION_MUTATION,
    );

    const {
        value,
        setFieldValue,
        error: formError,
        validate,
        setError,
    } = useForm(schema, { value: defaultFormValue });

    const error = getErrorObject(formError);

    const handleFormSubmission = useCallback(
        async (submittedValues: PartialOrganizationCreateInputFields) => {
            const finalValue = submittedValues as OrganizationCreateInput;
            try {
                const result = await createOrganization({ variables: { data: finalValue } });

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
                alertApolloError(apolloError, alert);
            }
        },
        [createOrganization, alert, setError, onUpdate],
    );

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    return (
        <Modal
            onClose={onClose}
            heading="Add Organization"
            withHeaderBorder
            withFooterBorder
            spacing="lg"
            footerActions={(
                <Button
                    name={undefined}
                    colorVariant="accent"
                    styleVariant="filled"
                    spacing="sm"
                    onClick={handleSubmitButtonClick}
                >
                    Add Organization
                </Button>
            )}
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
            />
            <TextArea
                value={undefined}
                name="description"
                label="Description"
                disabled
            />
        </Modal>
    );
}

export default OrganizationFormModal;
