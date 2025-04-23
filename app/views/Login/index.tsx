import {
    useCallback,
    useMemo,
} from 'react';
import {
    gql,
    useMutation,
} from '@apollo/client';
import { _cs } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    nonFieldError,
    ObjectSchema,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import Button from '#components/Button';
import TextInput from '#components/TextInput';
import {
    LoginMutation,
    LoginMutationVariables,
} from '#generated/types/graphql';
import mapSwipeLogo from '#resources/images/mapswipe-logo.svg';

import styles from './styles.module.css';

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

interface Props {
    className?: string;
}

function Login(props: Props) {
    const {
        className,
    } = props;

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(loginFormSchema, { value: defaultLoginFormValue });
    const error = getErrorObject(formError);

    const [
        loginToGql,
        { loading: pending },
    ] = useMutation<LoginMutation, LoginMutationVariables>(LOGIN_MUTATION);

    const handleFormSubmission = useCallback((finalValues: LoginFormFields) => {
        async function login() {
            if (!finalValues || !finalValues.email || !finalValues.password) {
                // eslint-disable-next-line no-console
                console.error('Email or password is not defined');
                return;
            }

            loginToGql({
                variables: { username: finalValues.email, password: finalValues.password },
            });

            /*
            try {
                setPending(true);

                const auth = getAuth();
                await signInWithEmailAndPassword(
                    auth,
                    finalValues.email as string,
                    finalValues.password as string,
                );
                // NOTE: we will udpate the current user on <Init />
                if (!mountedRef.current) {
                    return;
                }
                setPending(false);
            } catch (submissionError) {
                // eslint-disable-next-line no-console
                console.error(submissionError);

                if (!mountedRef.current) {
                    return;
                }

                const errorCode = (submissionError as AuthError).code;

                if (errorCode === AuthErrorCodes.USER_DELETED) {
                    setError((prevError) => ({
                        ...getErrorObject(prevError),
                        email: 'User not found',
                    }));
                }

                if (errorCode === AuthErrorCodes.INVALID_EMAIL) {
                    setError((prevError) => ({
                        ...getErrorObject(prevError),
                        email: 'Invalid email',
                    }));
                }

                if (errorCode === AuthErrorCodes.INVALID_PASSWORD) {
                    setError((prevError) => ({
                        ...getErrorObject(prevError),
                        password: 'Invalid password',
                    }));
                }

                setError((prevError) => ({
                    ...getErrorObject(prevError),
                    [nonFieldError]: 'Failed to authenticate',
                }));

                setPending(false);
            }
                */
        }

        login();
    }, [loginToGql]);

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    return (
        <div className={_cs(styles.login, className)}>
            <div className={styles.container}>
                <div className={styles.appBrand}>
                    <img
                        className={styles.logo}
                        src={mapSwipeLogo}
                        alt="MapSwipe"
                    />
                    <div className={styles.text}>
                        Manager Dashboard
                    </div>
                </div>
                <form
                    className={styles.loginFormContainer}
                    onSubmit={handleSubmitButtonClick}
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
                    {error?.[nonFieldError] && (
                        <div className={styles.errorMessage}>
                            {error?.[nonFieldError]}
                        </div>
                    )}
                    <div className={styles.actions}>
                        <Button
                            type="submit"
                            name={undefined}
                            disabled={pending}
                        >
                            Login
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
