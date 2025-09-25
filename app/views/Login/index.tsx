import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Cookies } from 'react-cookie';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    nonFieldError,
    ObjectSchema,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import { type } from 'arktype';
import { FirebaseError } from 'firebase/app';
import {
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import {
    CombinedError,
    gql,
} from 'urql';

import { firebaseAuth } from '#base/configs/firebase';
import Button from '#components/Button';
import Checkbox from '#components/Checkbox';
import Container from '#components/Container';
import NonFieldError from '#components/NonFieldError';
import PageLayout from '#components/PageLayout';
import TextInput from '#components/TextInput';
import UserContext from '#contexts/UserContext';
import {
    useLoginMutation,
    useMeQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import { resolveUrl } from '#utils/common';
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

const { APP_ENVIRONMENT } = import.meta.env;
const COOKIE_NAME = `MAPSWIPE-${APP_ENVIRONMENT}-CSRFTOKEN`;
const REST_ENDPOINT = import.meta.env.APP_REST_API_DOMAIN;
const cookies = new Cookies();

const UNKNOWN_ERROR = 'Unknown error occured';

function transformTokenError(response: unknown) {
    const ErrorLeaf = type.string.array().or(type.string).pipe(
        (leafError) => {
            if (Array.isArray(leafError)) {
                return leafError.join(', ');
            }

            return leafError;
        },
    );

    const ServerError = type({
        token: ErrorLeaf.optional(),
        non_field_errors: ErrorLeaf.optional(),
    }).pipe((error) => Object.values(error).join('; '));

    const errorMessage = ServerError(response);

    if (errorMessage instanceof type.errors) {
        return UNKNOWN_ERROR;
    }

    return errorMessage;
}

function transformFirebaseError(err: FirebaseError) {
    switch (err.code) {
        case 'auth/invalid-email':
            return 'Invalid email format.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
            return 'No user found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Try again later.';
        default:
            return err.message;
    }
}

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
    const [loginPending, setLoginPending] = useState(false);
    const [bypassFirebaseLogin, setBypassFirebaseLogin] = useState(false);
    const alert = useAlert();
    const { setUser } = useContext(UserContext);

    const [{
        fetching: meResponseLoading,
        data: meResponseData,
    }, fetchUserData] = useMeQuery({
        pause: true,
    });

    const [
        { fetching: pendingGqlLogin },
        loginToGql,
    ] = useLoginMutation();

    useEffect(() => {
        if (!meResponseLoading && isDefined(meResponseData?.me)) {
            setUser(meResponseData.me);
        }
    }, [setUser, meResponseData, meResponseLoading]);

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(loginFormSchema, { value: defaultLoginFormValue });

    const error = getErrorObject(formError);

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

            if (bypassFirebaseLogin) {
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
                            // description: 'Navigating to home page.',
                            variant: 'success',
                        },
                    );
                    setUser({
                        id: result.data.login.id,
                        displayName: result.data.login.displayName,
                    });

                    return;
                } catch (combinedError) {
                    alertCombinedError(combinedError, alert);

                    if (combinedError instanceof CombinedError) {
                        setError({ [nonFieldError]: combinedError.message });
                    }

                    return;
                }
            }

            if (isNotDefined(firebaseAuth)) {
                alert.show(
                    'System error!',
                    {
                        description: 'Firebase authentication is not configured properly, please contact the admin!',
                        variant: 'danger',
                    },
                );

                return;
            }

            setLoginPending(true);

            try {
                const userCredential = await signInWithEmailAndPassword(
                    firebaseAuth,
                    finalValues.email,
                    finalValues.password,
                );

                const { user } = userCredential;
                const token = await user.getIdToken();

                const requestOptions: RequestInit = {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': cookies.get(COOKIE_NAME),
                    },
                    body: JSON.stringify({ token }),
                };

                const response = await fetch(
                    resolveUrl(REST_ENDPOINT, 'firebase-auth/'),
                    requestOptions,
                );

                if (!response.ok) {
                    if (isDefined(firebaseAuth)) {
                        await signOut(firebaseAuth);
                    }

                    const responseJson = await response.json();

                    setLoginPending(false);

                    const errorMessage = transformTokenError(responseJson);

                    alert.show(
                        'Failed to login!',
                        {
                            description: errorMessage,
                            variant: 'danger',
                        },
                    );

                    return;
                }

                setLoginPending(false);
                fetchUserData();

                alert.show(
                    'Login successful!',
                    {
                        // description: 'Fetching user details',
                        variant: 'success',
                    },
                );
            } catch (ex) {
                setLoginPending(false);
                let errorMessage = UNKNOWN_ERROR;

                if (ex instanceof FirebaseError) {
                    errorMessage = transformFirebaseError(ex);
                }

                alert.show(
                    'Failed to login!',
                    {
                        description: errorMessage,
                        variant: 'danger',
                    },
                );

                setError({
                    [nonFieldError]: errorMessage,
                });
            }
        }

        login();
    }, [alert, bypassFirebaseLogin, fetchUserData, loginToGql, setError, setUser]);

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const pending = loginPending || meResponseLoading || pendingGqlLogin;

    return (
        <PageLayout
            heading="Manager Dashboard"
            className={styles.login}
        >
            <form
                onSubmit={handleSubmitButtonClick}
                className={styles.form}
            >
                <Container
                    heading="Login"
                    withHeaderBorder
                    withShadow
                    withBackground
                    withPadding
                    spacing="lg"
                    pending={pending}
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
                    <NonFieldError
                        error={error}
                    />
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
                    {APP_ENVIRONMENT === 'DEV' && (
                        <Checkbox
                            name="undefined"
                            label="Bypass firebase auth"
                            value={bypassFirebaseLogin}
                            onChange={setBypassFirebaseLogin}
                        />
                    )}
                </Container>
            </form>
        </PageLayout>
    );
}

export default Login;
