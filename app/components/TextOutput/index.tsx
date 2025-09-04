import { useMemo } from 'react';
import {
    _cs,
    breakFormat,
    isNotDefined,
    populateFormat,
} from '@togglecorp/fujs';

import useSpacingToken from '#hooks/useSpacingToken';
import { formatNumber } from '#utils/common';
import {
    gapSpacings,
    SpacingType,
} from '#utils/styles';

import styles from './styles.module.css';

export type DateLike = string | number | Date;

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

interface BaseProps {
    className?: string;
    icon?: React.ReactNode
    label?: React.ReactNode;
    value: React.ReactNode;
    description?: React.ReactNode;
    withoutLabelColon?: boolean;
    withWrap?: boolean;
    spacing?: SpacingType;
    withCenterAlign?: boolean;
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

function TextOutput(props: Props) {
    const {
        className,
        icon,
        label,
        value,
        description,
        withoutLabelColon,
        valueType,
        spacing,
        withWrap,
        withCenterAlign,
    } = props;

    const spacingClassName = useSpacingToken({
        spacing,
        modes: gapSpacings,
        offset: -2,
    });

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
                withWrap && styles.withWrap,
                withCenterAlign && styles.withCenterAlign,
                spacingClassName,
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
