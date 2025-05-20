import MarkdownView, { MarkdownViewProps } from 'react-showdown';

import { defaultMarkdownPreviewOptions } from '#utils/common';

export default function MarkdownPreview(props: MarkdownViewProps) {
    const {
        options: markdownOptionsFromProps,
        ...otherProps
    } = props;
    return (
        <MarkdownView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            options={markdownOptionsFromProps ?? defaultMarkdownPreviewOptions}
        />
    );
}
