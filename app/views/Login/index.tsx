import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    nonFieldError,
    ObjectSchema,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import {
    CombinedError,
    gql,
} from 'urql';

import Button from '#components/Button';
import Container from '#components/Container';
import NonFieldError from '#components/NonFieldError';
import TextInput from '#components/TextInput';
import UserContext from '#contexts/UserContext';
import { useLoginMutation } from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import {
    alertCombinedError,
    checkAndAlertGraphQLResultError,
} from '#utils/error';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGIN_MUTATION = gql`
mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
        id
        displayName
    }
}
`;

interface LoginFormFields {
    email?: string | undefined;
    password?: string | undefined;
}

type LoginFormSchema = ObjectSchema<LoginFormFields>;
type LoginFormSchemaFields = ReturnType<LoginFormSchema['fields']>
const loginFormSchema: LoginFormSchema = {
    fields: (): LoginFormSchemaFields => ({
        email: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        password: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

const defaultLoginFormValue: LoginFormFields = {};

function Login() {
    const { setUser } = useContext(UserContext);
    const alert = useAlert();

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(loginFormSchema, { value: defaultLoginFormValue });

    const error = getErrorObject(formError);

    const [
        { fetching: pending },
        loginToGql,
    ] = useLoginMutation();

    const handleFormSubmission = useCallback((finalValues: LoginFormFields) => {
        async function login() {
            if (!finalValues || !finalValues.email || !finalValues.password) {
                alert.show(
                    'Failed to login!',
                    {
                        description: 'Please make sure you\'ve entered both email and password',
                        variant: 'danger',
                    },
                );
                return;
            }

            try {
                const result = await loginToGql({
                    username: finalValues.email,
                    password: finalValues.password,
                });

                if (checkAndAlertGraphQLResultError(result, alert)) {
                    return;
                }

                if (isNotDefined(result.data)) {
                    alert.show(
                        'Failed to login!',
                        {
                            description: 'Unexpectected response from the server!',
                            variant: 'danger',
                        },
                    );

                    return;
                }

                alert.show(
                    'Login successful!',
                    {
                        description: 'Navigating to home page.',
                        variant: 'success',
                    },
                );
                setUser({
                    id: result.data.login.id,
                    displayName: result.data.login.displayName,
                });
            } catch (combinedError) {
                alertCombinedError(combinedError, alert);

                if (combinedError instanceof CombinedError) {
                    setError({ [nonFieldError]: combinedError.message });
                }
            }
        }

        login();
    }, [loginToGql, setError, setUser, alert]);

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    return (
        <div className={styles.login}>
            <form
                onSubmit={handleSubmitButtonClick}
                className={styles.form}
            >
                <Container
                    heading="Login to Manager Dashboard"
                    withHeaderBorder
                    withShadow
                    withBackground
                    withPadding
                    spacing="lg"
                    footerActions={(
                        <Button
                            type="submit"
                            name={undefined}
                            disabled={pending}
                            colorVariant="accent"
                        >
                            Login
                        </Button>
                    )}
                >
                    <TextInput
                        name="email"
                        label="Email"
                        value={value?.email}
                        error={error?.email}
                        onChange={setFieldValue}
                        disabled={pending}
                        autoFocus
                    />
                    <TextInput
                        name="password"
                        label="Password"
                        value={value.password}
                        onChange={setFieldValue}
                        error={error?.password}
                        type="password"
                        disabled={pending}
                    />
                    <NonFieldError
                        error={error}
                    />
                </Container>
            </form>
        </div>
    );
}

export default Login;
