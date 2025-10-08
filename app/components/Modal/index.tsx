import { IoMdClose } from 'react-icons/io';
import { _cs } from '@togglecorp/fujs';

import BodyBackdrop from '#components/BodyBackdrop';
import Button from '#components/Button';
import Container, { type ContainerProps } from '#components/Container';

import styles from './styles.module.css';

interface Props extends Omit<ContainerProps, 'withBackground' | 'withPadding' | 'withContentBackgroundAndPadding' | 'withShadow'> {
    onClose?: () => void;
    // closeOnBlur?: boolean;
    // closeOnEscape?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    withAutoHeight?: boolean;
}

function Modal(props: Props) {
    const {
        className,
        onClose,
        headerActions,
        withAutoHeight = false,
        contentClassName,
        size = 'md',
        ...otherProps
    } = props;

    return (
        <BodyBackdrop>
            <Container
                className={_cs(
                    styles.modal,
                    size === 'xs' && styles.xsSize,
                    size === 'sm' && styles.smSize,
                    size === 'md' && styles.mdSize,
                    size === 'lg' && styles.lgSize,
                    size === 'xl' && styles.xlSize,
                    withAutoHeight && styles.withAutoHeight,
                    className,
                )}
                contentClassName={_cs(styles.content, contentClassName)}
                withBackground
                withShadow
                withPadding
                headerActions={(
                    <>
                        {headerActions}
                        {onClose && (
                            <Button
                                className={styles.closeButton}
                                onClick={onClose}
                                styleVariant="action"
                                name={undefined}
                            >
                                <IoMdClose />
                            </Button>
                        )}
                    </>
                )}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
            />
        </BodyBackdrop>
    );
}

export default Modal;
