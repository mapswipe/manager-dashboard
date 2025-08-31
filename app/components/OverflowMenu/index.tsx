import { IoEllipsisVertical } from 'react-icons/io5';

import PopupButton from '#components/PopupButton';

interface Props {
    children: React.ReactNode;
    persistent?: boolean;
}

function OverflowMenu(props: Props) {
    const {
        children,
        persistent,
    } = props;

    return (
        <PopupButton
            label={<IoEllipsisVertical />}
            withoutDropdownIcon
            spacing="none"
            styleVariant="action"
            persistent={persistent}
        >
            {children}
        </PopupButton>
    );
}

export default OverflowMenu;
