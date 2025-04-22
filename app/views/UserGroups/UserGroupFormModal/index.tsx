import {
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    MdOutlinePublishedWithChanges,
    MdOutlineUnpublished,
} from 'react-icons/md';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    analyzeErrors,
    createSubmitHandler,
    getErrorObject,
    ObjectSchema,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import {
    equalTo,
    getDatabase,
    orderByChild,
    push as pushToDatabase,
    query,
    ref as databaseRef,
    set as setToDatabase,
} from 'firebase/database';

import UserContext from '#base/context/UserContext';
import AnimatedSwipeIcon from '#components/AnimatedSwipeIcon';
import Button from '#components/Button';
import Modal from '#components/Modal';
import TextInput from '#components/TextInput';
import useMountedRef from '#hooks/useMountedRef';
import { getNoMoreThanNCharacterCondition } from '#utils/common';
import { getValueFromFirebase } from '#utils/firebase';

import styles from './styles.module.css';

interface UserGroupFormFields {
    name?: string | undefined;
    description?: string | undefined;
}

type UserGroupFormSchema = ObjectSchema<UserGroupFormFields>;
type UserGroupFormSchemaFields = ReturnType<UserGroupFormSchema['fields']>

const MAX_CHARS_NAME = 40;
const MAX_CHARS_DESCRIPTION = 100;

const userGroupFormSchema: UserGroupFormSchema = {
    fields: (): UserGroupFormSchemaFields => ({
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
            validations: [getNoMoreThanNCharacterCondition(MAX_CHARS_NAME)],
        },
        description: {
            required: true,
            requiredValidation: requiredStringCondition,
            validations: [getNoMoreThanNCharacterCondition(MAX_CHARS_DESCRIPTION)],
        },
    }),
};

const defaultUserGroupFormValue: UserGroupFormFields = {};

interface Props {
    className?: string;
    onCloseButtonClick?: () => void;
}

function UserGroupFormModal(props: Props) {
    const {
        className,
        onCloseButtonClick,
    } = props;

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
    } = useForm(userGroupFormSchema, { value: defaultUserGroupFormValue });

    const mountedRef = useMountedRef();
    const { user } = useContext(UserContext);

    const error = getErrorObject(formError);
    const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'success' | 'failed' | undefined>(undefined);
    const [nonFieldError, setNonFieldError] = useState<string | undefined>();

    const handleFormSubmission = useCallback((finalValues: UserGroupFormFields) => {
        async function submitToFirebase() {
            setSubmissionStatus('pending');
            try {
                const db = getDatabase();
                const userGroupsRef = databaseRef(db, 'v2/userGroups/');
                const nameKey = finalValues?.name?.toLowerCase() as string;

                const prevUserGroupQuery = query(
                    userGroupsRef,
                    orderByChild('nameKey'),
                    equalTo(nameKey),
                );

                const snapshot = await getValueFromFirebase(prevUserGroupQuery);

                if (snapshot.exists()) {
                    setError((prevValue) => ({
                        ...getErrorObject(prevValue),
                        name: 'A group with this name already exists, please use a different name (Please note that the name comparision is not case sensitive)',
                    }));
                    setSubmissionStatus(undefined);
                    return;
                }

                const newUserGroupRef = await pushToDatabase(userGroupsRef);
                const newKey = newUserGroupRef.key;
                if (!mountedRef.current) {
                    return;
                }

                if (!newKey) {
                    setNonFieldError('Failed to push new key for user group');
                    setSubmissionStatus('failed');
                    return;
                }

                const uploadData = {
                    ...finalValues,
                    nameKey,
                    createdAt: (new Date()).getTime(),
                    createdBy: user?.id,
                };

                const putUserGroupRef = databaseRef(db, `v2/userGroups/${newKey}`);
                await setToDatabase(putUserGroupRef, uploadData);
                if (!mountedRef.current) {
                    return;
                }

                setSubmissionStatus('success');
            } catch (submissionError) {
                // eslint-disable-next-line no-console
                console.error(submissionError);
                if (!mountedRef.current) {
                    return;
                }
                setSubmissionStatus('failed');
            }
        }

        submitToFirebase();
    }, [user, setError, mountedRef]);

    const handleSubmitButtonClick = useMemo(
        () => createSubmitHandler(validate, setError, handleFormSubmission),
        [validate, setError, handleFormSubmission],
    );

    const hasErrors = analyzeErrors(error);

    return (
        <Modal
            className={_cs(styles.userGroupFormModal, className)}
            heading="New User Group"
            footer={(
                <>
                    {isNotDefined(submissionStatus) && (
                        <Button
                            className={styles.submitButton}
                            name={undefined}
                            onClick={handleSubmitButtonClick}
                            disabled={submissionStatus === 'pending'}
                        >
                            Submit
                        </Button>
                    )}
                    {submissionStatus === 'failed' && (
                        <Button
                            className={styles.submitButton}
                            name={undefined}
                            onClick={setSubmissionStatus}
                        >
                            Back to Form
                        </Button>
                    )}
                    {submissionStatus === 'success' && (
                        <Button
                            className={styles.submitButton}
                            name={undefined}
                            onClick={onCloseButtonClick}
                        >
                            Okay
                        </Button>
                    )}
                </>
            )}
            bodyClassName={styles.body}
            footerClassName={styles.footer}
            onCloseButtonClick={onCloseButtonClick}
        >
            {isNotDefined(submissionStatus) && (
                <>
                    {nonFieldError && (
                        <div className={styles.nonFieldError}>
                            {nonFieldError}
                        </div>
                    )}
                    {!nonFieldError && hasErrors && (
                        <div className={styles.errorMessage}>
                            Please correct all the errors below!
                        </div>
                    )}
                    <TextInput
                        label="Name"
                        name={'name' as const}
                        value={value?.name}
                        onChange={setFieldValue}
                        error={error?.name}
                        hint={`Enter the name of new user group that you want to create (${MAX_CHARS_NAME} chars max)`}
                        disabled={submissionStatus === 'pending'}
                        autoFocus
                    />
                    <TextInput
                        label="Description"
                        name={'description' as const}
                        value={value?.description}
                        onChange={setFieldValue}
                        error={error?.description}
                        hint={`Enter a short description for the user group (${MAX_CHARS_DESCRIPTION} chars max)`}
                        disabled={submissionStatus === 'pending'}
                    />
                </>
            )}
            {isDefined(submissionStatus) && (
                <div className={styles.status}>
                    {submissionStatus === 'pending' && (
                        <>
                            <AnimatedSwipeIcon className={styles.swipeIcon} />
                            <div className={styles.message}>
                                Submitting User Group...
                            </div>
                        </>
                    )}
                    {submissionStatus === 'success' && (
                        <>
                            <MdOutlinePublishedWithChanges className={styles.successIcon} />
                            <div className={styles.postSubmissionMessage}>
                                User Group added successfully!
                            </div>
                        </>
                    )}
                    {submissionStatus === 'failed' && (
                        <>
                            <MdOutlineUnpublished className={styles.failureIcon} />
                            <div className={styles.postSubmissionMessage}>
                                Failed to add the User Group!
                                Please make sure that you have an active internet connection
                                and enough permission to perform this action
                            </div>
                        </>
                    )}
                </div>
            )}
        </Modal>
    );
}

export default UserGroupFormModal;
