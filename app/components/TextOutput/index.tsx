import { useMemo } from 'react';
import {
    _cs,
    breakFormat,
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    populateFormat,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

export type DateLike = string | number | Date;

interface BaseProps {
    className?: string;
    icon?: React.ReactNode
    label?: React.ReactNode;
    value: React.ReactNode;
    description?: React.ReactNode;
    withoutLabelColon?: boolean;
}

interface BooleanProps {
    valueType: 'boolean',
    value: boolean | undefined | null;
}

interface NumberProps {
    valueType: 'number',
    value: number | undefined | null;
}

interface DateProps {
    valueType: 'date',
    value: DateLike | undefined | null;
}

interface TextProps {
    valueType: 'text',
    value: string | null | undefined;
}

interface NodeProps {
    valueType?: never;
    value?: React.ReactNode;
}

type Props = BaseProps & (
    NodeProps | TextProps | DateProps | NumberProps | BooleanProps
);

function getMaximumFractionDigits(value: number) {
    if (value < 1000) {
        return 2;
    }

    const formatter = new Intl.NumberFormat('default', { notation: 'compact' });
    const formattedParts = formatter.formatToParts(value);
    const fraction = formattedParts.find(({ type }) => type === 'fraction');

    if (isNotDefined(fraction) || isFalsyString(fraction.value)) {
        return 0;
    }

    if (Number(fraction.value) > 0.1) {
        return 1;
    }

    return 0;
}

interface FormatNumberOptions {
    currency?: boolean;
    unit?: Intl.NumberFormatOptions['unit'];
    maximumFractionDigits?: Intl.NumberFormatOptions['maximumFractionDigits'];
    compact?: boolean;
    separatorHidden?: boolean,
    language?: string,
}

function formatNumber(
    value: null | undefined,
    options?: FormatNumberOptions,
): undefined
function formatNumber(
    value: number | null | undefined,
    options?: FormatNumberOptions,
): undefined
function formatNumber(
    value: number,
    options?: FormatNumberOptions,
): string
function formatNumber(
    value: number | null | undefined,
    options?: FormatNumberOptions,
) {
    if (isNotDefined(value)) {
        return undefined;
    }

    const formattingOptions: Intl.NumberFormatOptions = {};

    if (isNotDefined(options)) {
        formattingOptions.maximumFractionDigits = getMaximumFractionDigits(value);
        return new Intl.NumberFormat('default', formattingOptions).format(value);
    }

    const {
        currency,
        unit,
        maximumFractionDigits,
        compact,
        separatorHidden,
        language,
    } = options;

    if (isTruthyString(unit)) {
        formattingOptions.unit = unit;
        formattingOptions.unitDisplay = 'short';
    }
    if (currency) {
        formattingOptions.currencyDisplay = 'narrowSymbol';
        formattingOptions.style = 'currency';
    }
    if (compact) {
        formattingOptions.notation = 'compact';
        formattingOptions.compactDisplay = 'short';
    }

    formattingOptions.useGrouping = !separatorHidden;

    if (isDefined(maximumFractionDigits)) {
        formattingOptions.maximumFractionDigits = maximumFractionDigits;
    } else {
        formattingOptions.maximumFractionDigits = getMaximumFractionDigits(value);
    }

    const newValue = new Intl.NumberFormat(language, formattingOptions)
        .format(value);

    return newValue;
}

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';

function formatDate(
    value: DateLike | null | undefined,
    format = DEFAULT_DATE_FORMAT,
) {
    if (isNotDefined(value)) {
        return undefined;
    }

    const date = new Date(value);

    // Check if valid date
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    const formattedValueList = populateFormat(breakFormat(format), date);
    // const formattedDate = formattedValueList.find((d) => d.type === 'date');

    const formattedDate = formattedValueList.map((valueItem) => valueItem.value).join('');

    // return formattedDate?.value;
    return formattedDate;
}

function TextOutput(props: Props) {
    const {
        className,
        icon,
        label,
        value,
        description,
        withoutLabelColon,
        valueType,
    } = props;

    const formattedValue = useMemo(() => {
        if (valueType === 'number') {
            return formatNumber(value);
        }

        if (valueType === 'date') {
            return formatDate(value);
        }

        return value;
    }, [value, valueType]);

    return (
        <div
            className={_cs(
                styles.textOutput,
                className,
            )}
        >
            {icon && (
                <div className={styles.icon}>
                    {icon}
                </div>
            )}
            {label && (
                <div
                    className={_cs(
                        styles.label,
                        !withoutLabelColon && styles.withColon,
                    )}
                >
                    {label}
                </div>
            )}
            <div className={styles.value}>
                {formattedValue}
            </div>
            {description && (
                <div>
                    {description}
                </div>
            )}
        </div>
    );
}

export default TextOutput;
