interface Props {
    value: string | undefined | null;
}

function ColorPreview(props: Props) {
    const {
        value,
    } = props;

    return (
        <div
            style={{
                backgroundColor: value ?? undefined,
                width: '1rem',
                height: '1rem',
            }}
        />
    );
}

export default ColorPreview;
