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

import { TutorialScenarioIconEnum } from '#generated/types/graphql';
import oneTapIcon from '#resources/icons/1_Tap_Black.png';
import twoTapIcon from '#resources/icons/2_Tap_Black.png';
import threeTapIcon from '#resources/icons/3_Tap_Black.png';
import swipeIcon from '#resources/icons/swipeleft_icon_black.png';
import angularTapIcon from '#resources/icons/tap_icon_angular.png';
import check from '#resources/icons/tick_green_on_white.png';

function getPngIcon(src: string, alt: string) {
    const element = () => (
        <img
            src={src}
            alt={alt}
            style={{
                height: '1em',
                width: '1em',
                objectFit: 'contain',
            }}
        />
    );

    return element;
}

export interface IconItem {
    key: TutorialScenarioIconEnum;
    label: string;
    component: IconType;
}

export const customOptionsOnlyIconList: IconItem[] = [
    {
        key: TutorialScenarioIconEnum.AddOutline,
        label: 'Add',
        component: IoAddOutline,
    },
    {
        key: TutorialScenarioIconEnum.AlertOutline,
        label: 'Alert',
        component: IoAlertOutline,
    },
    {
        key: TutorialScenarioIconEnum.BanOutline,
        label: 'Ban',
        component: IoBanOutline,
    },
    {
        key: TutorialScenarioIconEnum.CheckmarkOutline,
        label: 'Checkmark',
        component: IoCheckmarkOutline,
    },
    {
        key: TutorialScenarioIconEnum.CloseOutline,
        label: 'Close',
        component: IoCloseOutline,
    },
    {
        key: TutorialScenarioIconEnum.EggOutline,
        label: 'Egg',
        component: IoEggOutline,
    },
    {
        key: TutorialScenarioIconEnum.EllipseOutline,
        label: 'Ellipse',
        component: IoEllipseOutline,
    },
    {
        key: TutorialScenarioIconEnum.FlagOutline,
        label: 'Flag',
        component: IoFlagOutline,
    },
    {
        key: TutorialScenarioIconEnum.HandLeftOutline,
        label: 'Hand Left',
        component: IoHandLeftOutline,
    },
    {
        key: TutorialScenarioIconEnum.HandRightOutline,
        label: 'Hand Right',
        component: IoHandRightOutline,
    },
    {
        key: TutorialScenarioIconEnum.HappyOutline,
        label: 'Happy',
        component: IoHappyOutline,
    },
    {
        key: TutorialScenarioIconEnum.HeartOutline,
        label: 'Heart',
        component: IoHeartOutline,
    },
    {
        key: TutorialScenarioIconEnum.HelpOutline,
        label: 'Help',
        component: IoHelpOutline,
    },
    {
        key: TutorialScenarioIconEnum.InformationOutline,
        label: 'Information',
        component: IoInformationOutline,
    },
    {
        key: TutorialScenarioIconEnum.PrismOutline,
        label: 'Prism',
        component: IoPrismOutline,
    },
    {
        key: TutorialScenarioIconEnum.RefreshOutline,
        label: 'Refresh',
        component: IoRefreshOutline,
    },
    {
        key: TutorialScenarioIconEnum.RemoveOutline,
        label: 'Remove',
        component: IoRemoveOutline,
    },
    {
        key: TutorialScenarioIconEnum.SadOutline,
        label: 'Sad',
        component: IoSadOutline,
    },
    {
        key: TutorialScenarioIconEnum.SearchOutline,
        label: 'Search',
        component: IoSearchOutline,
    },
    {
        key: TutorialScenarioIconEnum.ShapesOutline,
        label: 'Shapes',
        component: IoShapesOutline,
    },
    {
        key: TutorialScenarioIconEnum.SquareOutline,
        label: 'Square',
        component: IoSquareOutline,
    },
    {
        key: TutorialScenarioIconEnum.StarOutline,
        label: 'Star',
        component: IoStarOutline,
    },
    {
        key: TutorialScenarioIconEnum.ThumbsDownOutline,
        label: 'Thumbs Down',
        component: IoThumbsDownOutline,
    },
    {
        key: TutorialScenarioIconEnum.ThumbsUpOutline,
        label: 'Thumbs Up',
        component: IoThumbsUpOutline,
    },
    {
        key: TutorialScenarioIconEnum.TriangleOutline,
        label: 'Triangle',
        component: IoTriangleOutline,
    },
    {
        key: TutorialScenarioIconEnum.WarningOutline,
        label: 'Warning',
        component: IoWarningOutline,
    },
];

// Icon List for scenario pages only.
// They need to be treated diffrently as they are loaded as pngs
const scenarioOnlyIconList: IconItem[] = [
    {
        key: TutorialScenarioIconEnum.Tap,
        label: 'Tap',
        component: getPngIcon(angularTapIcon, 'tap'),
    },
    {
        key: TutorialScenarioIconEnum.Tap_1,
        label: '1-Tap',
        component: getPngIcon(oneTapIcon, 'one tap'),
    },
    {
        key: TutorialScenarioIconEnum.Tap_2,
        label: '2-Tap',
        component: getPngIcon(twoTapIcon, 'two tap'),
    },
    {
        key: TutorialScenarioIconEnum.Tap_3,
        label: '3-Tap',
        component: getPngIcon(threeTapIcon, 'three tap'),
    },
    {
        key: TutorialScenarioIconEnum.SwipeLeft,
        label: 'Swipe Left',
        component: getPngIcon(swipeIcon, 'swipe left'),
    },
    {
        key: TutorialScenarioIconEnum.Check,
        label: 'Check',
        component: getPngIcon(check, 'check'),
    },
];

export const combinedIconList = [...scenarioOnlyIconList, ...customOptionsOnlyIconList];

export const iconMap = listToMap(
    combinedIconList,
    (icon) => icon.key,
    (icon) => icon.component,
);
