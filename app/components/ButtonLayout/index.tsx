import { _cs } from '@togglecorp/fujs';

import InlineLayout, { type Props as InlineLayoutProps } from '#components/InlineLayout';

import styles from './styles.module.css';

type ButtonColorVariant = 'text' | 'text-on-dark' | 'primary' | 'accent' | 'success' | 'danger';
type ButtonStyleVariant = 'outline' | 'filled' | 'transparent' | 'action';

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
    action: styles.styleVariantAction,
};

export interface Props extends Omit<InlineLayoutProps, 'withPadding'> {
    colorVariant?: ButtonColorVariant;
    styleVariant?: ButtonStyleVariant;
    withoutPadding?: boolean;
    disabled?: boolean;
}

function ButtonLayout(props: Props) {
    const {
        colorVariant = 'text',
        styleVariant = 'outline',
        spacingOffset = -1,
        className,
        withoutPadding = false,
        disabled,
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
                className,
            )}
            spacingOffset={spacingOffset}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inlineLayoutProps}
        />
    );
}

export default ButtonLayout;
