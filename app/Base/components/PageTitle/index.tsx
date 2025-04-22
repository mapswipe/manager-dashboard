import { useEffect } from 'react';

interface Props {
    value: string;
}

function PageTitle(props: Props) {
    const { value } = props;
    useEffect(
        () => {
            document.title = value;
        },
        [value],
    );
    return null;
}

export default PageTitle;
