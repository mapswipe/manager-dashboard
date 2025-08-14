import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { Cookies } from 'react-cookie';
import { Link } from 'react-router';
import { isDefined } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import {
    FirebaseError,
    initializeApp,
} from 'firebase/app';
import {
    connectAuthEmulator,
    getAuth,
    signInWithEmailAndPassword,
} from 'firebase/auth';

import Button from '#components/Button';
import ButtonLayout from '#components/ButtonLayout';
import Container from '#components/Container';
import NonFieldError from '#components/NonFieldError';
import TextInput from '#components/TextInput';
import useAlert from '#hooks/useAlert';

import styles from './styles.module.css';

const { APP_ENVIRONMENT } = import.meta.env;
const COOKIE_NAME = `MAPSWIPE-${APP_ENVIRONMENT}-CSRFTOKEN`;
const REST_ENDPOINT = import.meta.env.APP_REST_API_DOMAIN;
const cookies = new Cookies();

async function loginUsingFirebaseToken({ token }: { token: string }) {
    try {
        const response = await fetch(`${REST_ENDPOINT}/firebase-auth/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': cookies.get(COOKIE_NAME),
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            let errorMsg = `Request failed with status ${response.status}`;
            try {
                const errorData = await response.json();

                if (errorData?.non_field_errors?.length) {
                    errorMsg = errorData.non_field_errors.join(', ');
                } else if (typeof errorData === 'object') {
                    errorMsg = Object.entries(errorData)
                        .map(([field, messages]) => {
                            if (Array.isArray(messages)) {
                                return `${field}: ${messages.join(', ')}`;
                            }
                            return `${field}: ${messages}`;
                        })
                        .join(' | ');
                }
            } catch {
                // ignore parse errors
            }

            return { error: errorMsg };
        }

        return { error: undefined };
    } catch (err: unknown) {
        return { error: String(err) || 'Unknown error' };
    }
}

// Your Firebase config
const firebaseConfig = {
    apiKey: import.meta.env.APP_FIREBASE_API_KEY,
    authDomain: import.meta.env.APP_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.APP_FIREBASE_PROJECT_ID,
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

if (APP_ENVIRONMENT === 'DEV') {
    connectAuthEmulator(auth, 'http://localhost:9099');
}

async function loginWithEmailPassword(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (err: unknown) {
        let errorMessage = 'Something went wrong, please try again.';

        if (err instanceof FirebaseError) {
            switch (err.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This user account has been disabled.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No user found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Try again later.';
                    break;
                default:
                    errorMessage = err.message; // fallback from Firebase
            }
        }

        return { user: null, error: errorMessage };
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
    const alert = useAlert();

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
            setLoginPending(true);
            const userCredential = await loginWithEmailPassword(
                finalValues.email,
                finalValues.password,
            );
            const {
                user,
                error: errorMessage,
            } = userCredential;

            if (!user || errorMessage) {
                setLoginPending(false);
                alert.show(
                    'Failed to login!',
                    {
                        description: errorMessage ?? 'Unexpected response from the server!',
                        variant: 'danger',
                    },
                );

                return;
            }

            const token = await userCredential.user.getIdToken();
            const result = await loginUsingFirebaseToken({ token });

            setLoginPending(false);

            if (isDefined(result.error)) {
                alert.show(
                    'Failed to login!',
                    {
                        description: result.error,
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
            window.location.reload();
        }

        login();
    }, [alert]);

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
                            disabled={loginPending}
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
                        disabled={loginPending}
                        autoFocus
                    />
                    <TextInput
                        name="password"
                        label="Password"
                        value={value.password}
                        onChange={setFieldValue}
                        error={error?.password}
                        type="password"
                        disabled={loginPending}
                    />
                </Container>
                <NonFieldError
                    error={error}
                />
            </form>
            {APP_ENVIRONMENT === 'DEV' && (
                <Link
                    to={`${import.meta.env.APP_REST_API_DOMAIN}/admin`}
                >
                    <ButtonLayout
                        className={styles.link}
                    >
                        or Sign-in using Admin Panel
                    </ButtonLayout>
                </Link>
            )}
        </div>
    );
}

export default Login;
