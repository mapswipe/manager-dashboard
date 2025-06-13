import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const headingLevelToClassName: Record<HeadingLevel, string> = {
    1: styles.level1,
    2: styles.level2,
    3: styles.level3,
    4: styles.level4,
    5: styles.level5,
    6: styles.level6,
};

export interface Props {
    className?: string;
    level?: HeadingLevel;
    children: React.ReactNode;
}

function Heading(props: Props) {
    const {
        className,
        level = 3,
        children,
    } = props;

    const levelStyle = headingLevelToClassName[level];
    const HeadingTag = `h${level}` as React.ElementType;

    return (
        <HeadingTag
            className={_cs(
                styles.heading,
                levelStyle,
                className,
            )}
        >
            {children}
        </HeadingTag>
    );
}

export default Heading;
