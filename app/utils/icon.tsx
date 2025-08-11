import { IconType } from 'react-icons';
import {
    IoAddOutline,
    IoAlertOutline,
    IoBanOutline,
    IoCheckmarkOutline,
    IoCloseOutline,
    IoEggOutline,
    IoEllipseOutline,
    IoFlagOutline,
    IoHandLeftOutline,
    IoHandRightOutline,
    IoHappyOutline,
    IoHeartOutline,
    IoHelpOutline,
    IoInformationOutline,
    IoPrismOutline,
    IoRefreshOutline,
    IoRemoveOutline,
    IoSadOutline,
    IoSearchOutline,
    IoShapesOutline,
    IoSquareOutline,
    IoStarOutline,
    IoThumbsDownOutline,
    IoThumbsUpOutline,
    IoTriangleOutline,
    IoWarningOutline,
} from 'react-icons/io5';
import { listToMap } from '@togglecorp/fujs';

import { IconEnum } from '#generated/types/graphql';
import oneTapIcon from '#resources/icons/1_Tap_Black.png';
import twoTapIcon from '#resources/icons/2_Tap_Black.png';
import threeTapIcon from '#resources/icons/3_Tap_Black.png';
import swipeIcon from '#resources/icons/swipeleft_icon_black.png';
import angularTapIcon from '#resources/icons/tap_icon_angular.png';
import check from '#resources/icons/tick_green_on_white.png';

function getPngIcon(src: string, alt: string) {
    const element = (props: { className?: string }) => (
        <img
            src={src}
            alt={alt}
            style={{
                height: '1em',
                width: '1em',
                objectFit: 'contain',
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );

    return element;
}

export interface IconItem {
    key: IconEnum;
    label: string;
    component: IconType;
}

export const customOptionsOnlyIconList: IconItem[] = [
    {
        key: IconEnum.AddOutline,
        label: 'Add',
        component: IoAddOutline,
    },
    {
        key: IconEnum.AlertOutline,
        label: 'Alert',
        component: IoAlertOutline,
    },
    {
        key: IconEnum.BanOutline,
        label: 'Ban',
        component: IoBanOutline,
    },
    {
        key: IconEnum.CheckmarkOutline,
        label: 'Checkmark',
        component: IoCheckmarkOutline,
    },
    {
        key: IconEnum.CloseOutline,
        label: 'Close',
        component: IoCloseOutline,
    },
    {
        key: IconEnum.EggOutline,
        label: 'Egg',
        component: IoEggOutline,
    },
    {
        key: IconEnum.EllipseOutline,
        label: 'Ellipse',
        component: IoEllipseOutline,
    },
    {
        key: IconEnum.FlagOutline,
        label: 'Flag',
        component: IoFlagOutline,
    },
    {
        key: IconEnum.HandLeftOutline,
        label: 'Hand Left',
        component: IoHandLeftOutline,
    },
    {
        key: IconEnum.HandRightOutline,
        label: 'Hand Right',
        component: IoHandRightOutline,
    },
    {
        key: IconEnum.HappyOutline,
        label: 'Happy',
        component: IoHappyOutline,
    },
    {
        key: IconEnum.HeartOutline,
        label: 'Heart',
        component: IoHeartOutline,
    },
    {
        key: IconEnum.HelpOutline,
        label: 'Help',
        component: IoHelpOutline,
    },
    {
        key: IconEnum.InformationOutline,
        label: 'Information',
        component: IoInformationOutline,
    },
    {
        key: IconEnum.PrismOutline,
        label: 'Prism',
        component: IoPrismOutline,
    },
    {
        key: IconEnum.RefreshOutline,
        label: 'Refresh',
        component: IoRefreshOutline,
    },
    {
        key: IconEnum.RemoveOutline,
        label: 'Remove',
        component: IoRemoveOutline,
    },
    {
        key: IconEnum.SadOutline,
        label: 'Sad',
        component: IoSadOutline,
    },
    {
        key: IconEnum.SearchOutline,
        label: 'Search',
        component: IoSearchOutline,
    },
    {
        key: IconEnum.ShapesOutline,
        label: 'Shapes',
        component: IoShapesOutline,
    },
    {
        key: IconEnum.SquareOutline,
        label: 'Square',
        component: IoSquareOutline,
    },
    {
        key: IconEnum.StarOutline,
        label: 'Star',
        component: IoStarOutline,
    },
    {
        key: IconEnum.ThumbsDownOutline,
        label: 'Thumbs Down',
        component: IoThumbsDownOutline,
    },
    {
        key: IconEnum.ThumbsUpOutline,
        label: 'Thumbs Up',
        component: IoThumbsUpOutline,
    },
    {
        key: IconEnum.TriangleOutline,
        label: 'Triangle',
        component: IoTriangleOutline,
    },
    {
        key: IconEnum.WarningOutline,
        label: 'Warning',
        component: IoWarningOutline,
    },
];

// Icon List for scenario pages only.
// They need to be treated diffrently as they are loaded as pngs
const scenarioOnlyIconList: IconItem[] = [
    {
        key: IconEnum.Tap,
        label: 'Tap',
        component: getPngIcon(angularTapIcon, 'tap'),
    },
    {
        key: IconEnum.Tap_1,
        label: '1-Tap',
        component: getPngIcon(oneTapIcon, 'one tap'),
    },
    {
        key: IconEnum.Tap_2,
        label: '2-Tap',
        component: getPngIcon(twoTapIcon, 'two tap'),
    },
    {
        key: IconEnum.Tap_3,
        label: '3-Tap',
        component: getPngIcon(threeTapIcon, 'three tap'),
    },
    {
        key: IconEnum.SwipeLeft,
        label: 'Swipe Left',
        component: getPngIcon(swipeIcon, 'swipe left'),
    },
    {
        key: IconEnum.Check,
        label: 'Check',
        component: getPngIcon(check, 'check'),
    },
];

export const iconList = [...scenarioOnlyIconList, ...customOptionsOnlyIconList];

export const iconMapping = listToMap(
    iconList,
    (icon) => icon.key,
    (icon) => icon.component,
);
