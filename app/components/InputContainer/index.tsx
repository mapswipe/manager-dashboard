import { _cs } from '@togglecorp/fujs';

import InlineLayout from '#components/InlineLayout';
import InputContainerLayout, { type Props as InputContainerLayoutProps } from '#components/InputContainerLayout';
import { SpacingType } from '#utils/styles';

import styles from './styles.module.css';

export interface Props extends Omit<InputContainerLayoutProps, 'children'> {
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    input: React.ReactNode;
    inputSectionRef?: React.RefObject<HTMLDivElement>;
    spacing?: SpacingType;
}

function InputContainer(props: Props) {
    const {
        className,
        icons,
        actions,
        input,
        inputSectionRef,
        spacing,
        ...inputContainerLayoutProps
    } = props;

    return (
        <InputContainerLayout
            className={_cs(styles.inputContainer, className)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inputContainerLayoutProps}
        >
            <InlineLayout
                elementRef={inputSectionRef}
                className={styles.inputSection}
                start={icons}
                end={actions}
                withPadding
                spacing={spacing}
                spacingOffset={-1}
            >
                {input}
            </InlineLayout>
        </InputContainerLayout>
    );
}

export default InputContainer;
