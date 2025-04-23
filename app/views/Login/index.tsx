import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    ApolloError,
    gql,
    useMutation,
} from '@apollo/client';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    nonFieldError,
    ObjectSchema,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import UserContext from '#base/context/UserContext';
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

    const { setUser } = useContext(UserContext);

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

            try {
                const result = await loginToGql({
                    variables: { username: finalValues.email, password: finalValues.password },
                });

                if (isDefined(result) && isDefined(result.data)) {
                    setUser({
                        id: result.data.login.id,
                        displayName: result.data.login.displayName,
                    });
                }
            } catch (loginError) {
                if (loginError instanceof ApolloError) {
                    setError({ [nonFieldError]: loginError.message });
                } else {
                    // eslint-disable-next-line no-console
                    console.error(loginError);
                }
            }
        }

        login();
    }, [loginToGql, setError, setUser]);

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
