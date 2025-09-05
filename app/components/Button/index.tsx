import ButtonLayout, { ButtonLayoutProps } from '#components/ButtonLayout';
import RawButton, { Props as RawButtonProps } from '#components/RawButton';

import styles from './styles.module.css';

export type Props<NAME> = Omit<ButtonLayoutProps, 'elementRef'> & Omit<RawButtonProps<NAME>, 'children' | 'start'> & {
    layoutElementRef?: ButtonLayoutProps['elementRef'];
};

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
        layoutElementRef,
        withFullWidth,
        spacingOffset,
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
                elementRef={layoutElementRef}
                className={className}
                start={start}
                end={end}
                startContainerClassName={startContainerClassName}
                endContainerClassName={endContainerClassName}
                childrenContainerClassName={childrenContainerClassName}
                spacing={spacing}
                spacingOffset={spacingOffset}
                colorVariant={colorVariant}
                styleVariant={styleVariant}
                withoutPadding={withoutPadding}
                disabled={disabled}
                withFullWidth={withFullWidth}
            >
                {children}
            </ButtonLayout>
        </RawButton>
    );
}

export default Button;
