import MarkdownView, { MarkdownViewProps } from 'react-showdown';
import { _cs } from '@togglecorp/fujs';

import { defaultMarkdownPreviewOptions } from '#utils/common';

import styles from './styles.module.css';

export default function MarkdownPreview(props: MarkdownViewProps) {
    const {
        options: markdownOptionsFromProps,
        className,
        ...otherProps
    } = props;
    return (
        <MarkdownView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(styles.markdownPreview, className)}
            options={markdownOptionsFromProps ?? defaultMarkdownPreviewOptions}
        />
    );
}
