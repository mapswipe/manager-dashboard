import { _cs } from '@togglecorp/fujs';

import InlineLayout, { type Props as InlineLayoutProps } from '#components/InlineLayout';

import styles from './styles.module.css';

export type ButtonColorVariant = 'text' | 'text-on-dark' | 'primary' | 'accent' | 'success' | 'danger';
export type ButtonStyleVariant = 'outline' | 'filled' | 'transparent' | 'action' | 'translucent';

const colorVariantToClassName: Record<ButtonColorVariant, string> = {
    text: styles.colorVariantText,
    primary: styles.colorVariantPrimary,
    accent: styles.colorVariantAccent,
    success: styles.colorVariantSuccess,
    danger: styles.colorVariantDanger,
    'text-on-dark': styles.colorVariantTextOnDark,
};

const styleVariantToClassName: Record<ButtonStyleVariant, string> = {
    outline: styles.styleVariantOutline,
    filled: styles.styleVariantFilled,
    transparent: styles.styleVariantTransparent,
    translucent: styles.styleVariantTranslucent,
    action: styles.styleVariantAction,
};

export interface ButtonLayoutProps extends Omit<InlineLayoutProps, 'withPadding'> {
    colorVariant?: ButtonColorVariant;
    styleVariant?: ButtonStyleVariant;
    withoutPadding?: boolean;
    disabled?: boolean;
}

function ButtonLayout(props: ButtonLayoutProps) {
    const {
        colorVariant = 'text',
        styleVariant = 'outline',
        spacingOffset = -1,
        className,
        disabled,
        children,
        withoutPadding = false,
        withFullWidth,
        ...inlineLayoutProps
    } = props;

    return (
        <InlineLayout
            withPadding={!withoutPadding}
            className={_cs(
                styles.buttonLayout,
                colorVariantToClassName[colorVariant],
                styleVariantToClassName[styleVariant],
                disabled && styles.disabled,
                withFullWidth && styles.withFullWidth,
                className,
            )}
            withFullWidth={withFullWidth}
            spacingOffset={spacingOffset}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inlineLayoutProps}
        >
            {children}
            <span className={styles.visualFeedback} />
        </InlineLayout>
    );
}

export default ButtonLayout;
