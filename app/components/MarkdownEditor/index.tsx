import React, {
    RefObject,
    useCallback,
    useId,
} from 'react';
import Markdown from 'react-mde';
import { _cs } from '@togglecorp/fujs';

import RawTextArea, { RawTextAreaProps } from '#components/RawTextArea';

import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import MarkdownPreview from '../MarkdownPreview';

import styles from './styles.module.css';

const MarkdownTextArea = React.forwardRef<
    RawTextAreaProps<unknown>,
    React.HTMLProps<HTMLTextAreaElement>
>((props, ref) => {
    const {
        // eslint-disable-next-line react/prop-types
        name,
        // eslint-disable-next-line react/prop-types
        value,
        // eslint-disable-next-line react/prop-types
        onChange,
        ...otherProps
    } = props;

    const handleChange: RawTextAreaProps<unknown>['onChange'] = (_, __, e) => {
        if (e) {
            onChange?.(e);
        }
    };

    return (
        <RawTextArea
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            name={name}
            value={value as RawTextAreaProps<unknown>['value']}
            onChange={handleChange}
            elementRef={ref as RefObject<HTMLTextAreaElement> ?? undefined}
        />
    );
});

interface MarkdownEditorProps<NAME extends string> {
    name: NAME;
    className?: string;
    readOnly?: boolean;
    disabled?: boolean;
    value: string | null | undefined;
    onChange?:(newVal: string | undefined, name: NAME) => void;
}

export type Props<NAME extends string> = Omit<InputContainerProps, 'input' | 'inputId'> & MarkdownEditorProps<NAME>;

function MarkdownEditor<const NAME extends string>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        actions,
        className,
        disabled,
        error,
        hint,
        icons,
        label,
        readOnly,
    } = props;

    const inputId = useId();

    const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>('write');
    const handleValueChange = useCallback(
        (newVal: string) => {
            if (!disabled && !readOnly && onChange) {
                onChange(newVal, name);
            }
        },
        [name, onChange, disabled, readOnly],
    );

    const generateMarkdownPreview = useCallback((markdown: string | undefined) => (
        Promise.resolve(
            <MarkdownPreview
                markdown={markdown ?? ''}
            />,
        )
    ), []);

    return (
        <InputContainer
            inputId={inputId}
            className={_cs(styles.markdownEditor, className)}
            disabled={disabled}
            error={error}
            hint={hint}
            icons={icons}
            label={label}
            readOnly={readOnly}
            actions={actions}
            input={!readOnly ? (
                <Markdown
                    value={value ?? ''}
                    selectedTab={selectedTab}
                    onTabChange={setSelectedTab}
                    onChange={handleValueChange}
                    generateMarkdownPreview={generateMarkdownPreview}
                    readOnly={disabled}
                    disablePreview
                    textAreaComponent={MarkdownTextArea}
                    classes={{
                        reactMde: styles.reactMde,
                        textArea: styles.textArea,
                        toolbar: styles.toolbar,
                    }}
                />
            ) : (
                <MarkdownPreview
                    markdown={value || '-'}
                />
            )}
        />
    );
}

export default MarkdownEditor;
