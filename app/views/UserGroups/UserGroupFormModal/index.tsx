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
    type ContributorUserGroupCreateInput,
    ContributorUserGroupUpdateInput,
    useContributorUserGroupDetailsQuery,
    useCreateContributeUserGroupMutation,
    useUpdateUserGroupMutation,
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
const CREATE_USER_GROUPS = gql`
${OPERATION_INFO_FRAGMENT}
mutation CreateContributeUserGroup($data: ContributorUserGroupCreateInput!) {
    createContributorUserGroup(data: $data) {
        ... on ContributorUserGroupTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                id
                name
                description
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
const USER_GROUP_UPDATE_MUTATION = gql`
${OPERATION_INFO_FRAGMENT}
mutation UpdateUserGroup($id: ID!, $data: ContributorUserGroupUpdateInput!) {
    updateContributorUserGroup(pk: $id, data: $data) {
        ... on ContributorUserGroupTypeMutationResponseType {
            __typename
            errors
            ok
            result {
                id
                name
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
const USER_GROUP_DETAILS_QUERY = gql`
query contributorUserGroupDetails($id: ID!) {
    contributorUserGroup(id: $id) {
        clientId
        id
        modifiedBy {
            id
            displayName
        }
        modifiedAt
        name
        description
    }
}
`;

type UserGroupInput = Pick<ContributorUserGroupCreateInput
    & ContributorUserGroupUpdateInput, 'clientId' | 'name' | 'description'
>;

type PartialUserGroupCreateInputFields = PartialForm<
    DeepNonNullable<UserGroupInput>,
    'clientId'
>

type UserGroupCreateFormSchema = ObjectSchema<PartialUserGroupCreateInputFields>;

const schema: UserGroupCreateFormSchema = {
    fields: (): ReturnType<UserGroupCreateFormSchema['fields']> => ({
        clientId: {},
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {
            requiredValidation: requiredStringCondition,
        },
    }),
};

interface Props {
    userGroupId?: string;
    onClose: (_?: undefined) => void;
    onUpdate: () => void;
}

function UserGroupFormModal(props: Props) {
    const {
        onClose,
        onUpdate,
        userGroupId,
    } = props;

    const alert = useAlert();

    const [
        { fetching: createUserGroupPending },
        createUserGroup,
    ] = useCreateContributeUserGroupMutation();

    const [
        { fetching: updateUserGroupPending },
        updateUserGroup,
    ] = useUpdateUserGroupMutation();

    const [{
        data: userGroupQueryResponse,
    }] = useContributorUserGroupDetailsQuery({
        variables: { id: userGroupId ?? '' },
    });

    const defaultFormValue = useMemo<PartialUserGroupCreateInputFields>(() => ({
        clientId: ulid(),
    }), []);

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
        if (isNotDefined(userGroupQueryResponse)) {
            return;
        }

        const {
            contributorUserGroup: {
                name,
                description,
                clientId,
            },
        } = userGroupQueryResponse;

        if (isNotDefined(clientId)) {
            return;
        }

        setValue({
            clientId,
            description,
            name,
        });
    }, [userGroupQueryResponse, setValue]);

    const handleFormSubmission = useCallback(
        async (submittedValues: PartialUserGroupCreateInputFields) => {
            const finalValue = submittedValues as UserGroupInput;
            if (isNotDefined(userGroupId)) {
                try {
                    const result = await createUserGroup({
                        data: finalValue,
                    });

                    if (checkAndAlertGraphQLResultError(result, alert)) {
                        return;
                    }

                    if (isNotDefined(result.data)
                        // eslint-disable-next-line no-underscore-dangle
                        || result.data.createContributorUserGroup.__typename !== 'ContributorUserGroupTypeMutationResponseType'
                    ) {
                        alert.show(
                            'Failed to create the User Group!',
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
                        result: createUserGroupResult,
                    } = result.data.createContributorUserGroup;

                    if (!ok || !createUserGroupResult) {
                        alert.show(
                            'Failed to create the User Group!',
                            {
                                description: 'Please fix the errors and try again!',
                                variant: 'danger',
                            },
                        );
                        setError(transformErrors(errors));
                        return;
                    }

                    alert.show(
                        'User Group created successfully!',
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
                const result = await updateUserGroup({
                    id: userGroupId,
                    data: finalValue,
                });

                if (checkAndAlertGraphQLResultError(result, alert)) {
                    return;
                }

                if (isNotDefined(result.data)
                    // eslint-disable-next-line no-underscore-dangle
                    || result.data.updateContributorUserGroup.__typename !== 'ContributorUserGroupTypeMutationResponseType'

                ) {
                    alert.show(
                        'Failed to create the User Group!',
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
                } = result.data.updateContributorUserGroup;

                if (!ok || !updateOrganizationResult) {
                    alert.show(
                        'Failed to update the User Group!',
                        {
                            description: 'Please fix the errors and try again!',
                            variant: 'danger',
                        },
                    );
                    setError(transformErrors(errors));
                    return;
                }

                alert.show(
                    'User Group updated successfully!',
                    {
                        variant: 'success',
                    },
                );

                onUpdate();
            } catch (apolloError) {
                alertCombinedError(apolloError, alert);
            }
        },
        [userGroupId, createUserGroup, alert, onUpdate, setError, updateUserGroup],
    );

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const inputsDisabled = createUserGroupPending || updateUserGroupPending;
    const actionsDisabled = inputsDisabled;

    return (
        <Modal
            onClose={onClose}
            heading={isDefined(userGroupId) ? 'Update User Group' : 'Add User Group'}
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
                    {isDefined(userGroupId) ? 'Update User Group' : 'Add User Group'}
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
                disabled={inputsDisabled}
            />
            <TextArea
                value={value?.description}
                name="description"
                label="Description"
                onChange={setFieldValue}
                error={error?.description}
                disabled={inputsDisabled}
            />
        </Modal>
    );
}

export default UserGroupFormModal;
