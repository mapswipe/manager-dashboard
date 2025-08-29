import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    ArrayError,
    getErrorObject,
    LeafError,
    nonFieldError,
    ObjectError,
} from '@togglecorp/toggle-form';

import styles from './styles.module.css';

interface Props<T> {
    className?: string;
    error: ArrayError<T> | ObjectError<T> | LeafError;
}

function NonFieldError<T>(props: Props<T>) {
    const {
        className,
        error,
    } = props;

    const errorMessage = getErrorObject(error)?.[nonFieldError];

    if (isNotDefined(errorMessage)) {
        return null;
    }

    return (
        <div className={_cs(styles.nonFieldError, className)}>
            {errorMessage}
        </div>
    );
}

export default NonFieldError;
