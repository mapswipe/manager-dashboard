import { IoEllipsisVertical } from 'react-icons/io5';

import PopupButton from '#components/PopupButton';

interface Props {
    children: React.ReactNode;
}

function OverflowMenu(props: Props) {
    const { children } = props;

    return (
        <PopupButton
            name={undefined}
            label={<IoEllipsisVertical />}
            arrowHidden
            spacing="none"
            styleVariant="action"
        >
            {children}
        </PopupButton>
    );
}

export default OverflowMenu;
