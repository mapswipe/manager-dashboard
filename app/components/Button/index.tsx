import ButtonLayout, { Props as ButtonLayoutProps } from '#components/ButtonLayout';
import RawButton, { Props as RawButtonProps } from '#components/RawButton';

import styles from './styles.module.css';

export type Props<NAME> = Omit<ButtonLayoutProps, 'elementRef'> & Omit<RawButtonProps<NAME>, 'children' | 'start'>;

function Button<NAME>(props: Props<NAME>) {
    const {
        className,
        start,
        children,
        end,
        startContainerClassName,
        childrenContainerClassName,
        endContainerClassName,
        spacing,
        colorVariant,
        styleVariant,
        type = 'button',
        disabled,
        withoutPadding,
        ...buttonProps
    } = props;

    return (
        <RawButton
            className={styles.button}
            type={type}
            disabled={disabled}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...buttonProps}
        >
            <ButtonLayout
                className={className}
                start={start}
                end={end}
                startContainerClassName={startContainerClassName}
                endContainerClassName={endContainerClassName}
                childrenContainerClassName={childrenContainerClassName}
                spacing={spacing}
                colorVariant={colorVariant}
                styleVariant={styleVariant}
                withoutPadding={withoutPadding}
                disabled={disabled}
            >
                {children}
            </ButtonLayout>
        </RawButton>
    );
}

export default Button;
