import { useMemo } from 'react';
import {
    _cs,
    breakFormat,
    isNotDefined,
    populateFormat,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import Tooltip from '#components/Tooltip';
import useSpacingToken from '#hooks/useSpacingToken';
import {
    formatNumber,
    FormatNumberOptions,
} from '#utils/common';
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

function formatBoolean(value: boolean | null | undefined) {
    if (value === true) {
        return 'Yes';
    }

    if (value === false) {
        return 'No';
    }

    return null;
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
    emptyValueDisplay?: React.ReactNode;
    withEllipsizedOverflow?: boolean;
}

interface BooleanProps {
    valueType: 'boolean',
    value: boolean | undefined | null;
}

interface NumberProps extends FormatNumberOptions {
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
        emptyValueDisplay = '--',
        withEllipsizedOverflow,
        ...additionalOptions
    } = props;

    const spacingClassName = useSpacingToken({
        spacing,
        modes: gapSpacings,
        offset: -2,
    });

    const formattedValue = useMemo(() => {
        if (valueType === 'number') {
            return formatNumber(value, additionalOptions);
        }

        if (valueType === 'date') {
            return formatDate(value);
        }

        if (valueType === 'boolean') {
            return formatBoolean(value);
        }

        return value;
    }, [value, valueType, additionalOptions]);

    return (
        <div
            className={_cs(
                styles.textOutput,
                withWrap && styles.withWrap,
                withCenterAlign && styles.withCenterAlign,
                withEllipsizedOverflow && styles.withEllipsizedOverflow,
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
            <div
                className={styles.value}
            >
                {formattedValue ?? emptyValueDisplay}
                {withEllipsizedOverflow && (
                    <Tooltip>
                        <Container
                            heading={label}
                            headingLevel={6}
                        >
                            {formattedValue}
                        </Container>
                    </Tooltip>
                )}
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
