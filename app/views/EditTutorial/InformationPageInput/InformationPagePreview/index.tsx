import { useMemo } from 'react';

import TutorialAssetPreview from '#components/domain/TutorialAssetPreview';
import Heading from '#components/Heading';
import InlineLayout from '#components/InlineLayout';
import MarkdownPreview from '#components/MarkdownPreview';
import MobilePreview from '#components/MobilePreview';
import {
    IconEnum,
    ProjectTypeEnum,
    TutorialInformationPageBlockTypeEnum,
} from '#generated/types/graphql';
import { iconMapping } from '#utils/icon';

import { PartialInformationPageInputFields } from '../schema';

import styles from './styles.module.css';

interface Props {
    value: PartialInformationPageInputFields;
    lookFor: string | undefined;
    projectType: ProjectTypeEnum | undefined;
}

export default function InformationPagePreview(props: Props) {
    const {
        value,
        lookFor,
        projectType,
    } = props;

    const heading = useMemo(() => {
        if (projectType === ProjectTypeEnum.Validate) {
            return `Does the shape outline a ${lookFor}?`;
        }

        return 'You are looking for:';
    }, [lookFor, projectType]);

    const description = useMemo(() => {
        if (projectType === ProjectTypeEnum.Validate) {
            return null;
        }

        return lookFor;
    }, [lookFor, projectType]);

    const SwipeLeftIcon = iconMapping[IconEnum.SwipeLeft];

    return (
        <MobilePreview
            className={styles.informationPreview}
            heading={heading}
            headerDescription={description}
            contentClassName={styles.content}
        >
            <Heading
                className={styles.heading}
                level={5}
            >
                {value?.title || `{page title ${value.pageNumber}}`}
            </Heading>
            {value?.blocks?.map((page) => {
                if (page.blockType === TutorialInformationPageBlockTypeEnum.Text) {
                    return (
                        <MarkdownPreview
                            key={page.blockNumber}
                            markdown={page.text || '{block}'}
                        />
                    );
                }

                if (page.blockType === TutorialInformationPageBlockTypeEnum.Image) {
                    return (
                        <TutorialAssetPreview
                            key={page.blockNumber}
                            className={styles.imagePreview}
                            rendererClassName={styles.image}
                            assetId={page.image}
                        />
                    );
                }

                return null;
            })}
            <InlineLayout
                className={styles.swipeToContinue}
                end={<SwipeLeftIcon className={styles.swipeIcon} />}
                spacing="sm"
            >
                Swipe to continue
            </InlineLayout>
        </MobilePreview>
    );
}
