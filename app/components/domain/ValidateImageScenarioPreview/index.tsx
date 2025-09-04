import {
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { PartialForm } from '@togglecorp/toggle-form';

import { PartialCustomOptionInputFields } from '#components/domain/CustomOptionInput/schema';
import CustomOptionPreview from '#components/domain/CustomOptionsPreview';
import Icon from '#components/domain/Icon';
import MobilePreview from '#components/MobilePreview';
import { TutorialScenarioPageCreateInput } from '#generated/types/graphql';

import styles from './styles.module.css';

interface Props {
    className?: string;
    projectInstruction: string | undefined | null;
    customOptions: PartialCustomOptionInputFields[] | undefined;
    scenario: PartialForm<TutorialScenarioPageCreateInput> | undefined;
}

function ValidateImageScenarioPreview(props: Props) {
    const {
        className,
        scenario,
        projectInstruction,
        customOptions,
    } = props;

    const imgRef = useRef<HTMLImageElement>(null);
    const task = scenario?.tasks?.[0]?.projectTypeSpecifics?.validateImage;
    const [bbox, setBbox] = useState<{
        x: number,
        y: number,
        width: number,
        height: number
    } | undefined>();

    useLayoutEffect(() => {
        if (isNotDefined(imgRef.current)) {
            setBbox(undefined);
            return;
        }

        if (isNotDefined(task?.annotation?.bbox)) {
            setBbox(undefined);
            return;
        }

        const imageWidth = task.width ?? imgRef.current.naturalWidth;
        const imageHeight = task.height ?? imgRef.current.naturalHeight;

        const containerWidth = imgRef.current.clientWidth;
        const containerHeight = imgRef.current.clientHeight;

        const containerAspectRatio = containerWidth / containerHeight;
        const imageAspectRatio = imageWidth / imageHeight;

        const renderedHeight = imageAspectRatio > containerAspectRatio
            ? containerWidth / imageAspectRatio
            : containerHeight;

        const renderedWidth = containerAspectRatio > imageAspectRatio
            ? containerHeight * imageAspectRatio
            : containerWidth;

        const yExcess = containerHeight - renderedHeight;
        const xExcess = containerWidth - renderedWidth;

        const [x1, y1, w, h] = task.annotation.bbox;

        const cx = (x1 / imageWidth) * renderedWidth + xExcess / 2;
        const cy = (y1 / imageHeight) * renderedHeight + yExcess / 2;
        const cw = (w / imageWidth) * renderedWidth;
        const ch = (h / imageHeight) * renderedHeight;

        setBbox({
            x: cx,
            y: cy,
            width: cw,
            height: ch,
        });
    }, [task]);

    return (
        <div className={_cs(styles.validateImageScenarioPreview, className)}>
            <MobilePreview
                heading={projectInstruction}
                popupIcons={<Icon value={scenario?.instructionsIcon} />}
                popupTitle={scenario?.instructionsTitle || '{title}'}
                popupDescription={scenario?.instructionsDescription || '{description}'}
                contentClassName={styles.content}
            >
                <div className={styles.imageWrapper}>
                    <img
                        ref={imgRef}
                        className={styles.taskImage}
                        src={task?.url}
                        alt={task?.fileName}
                    />
                    {isDefined(bbox) && (
                        <svg className={styles.bboxSvg}>
                            <rect
                                className={styles.bboxRect}
                                x={bbox.x}
                                y={bbox.y}
                                width={bbox.width}
                                height={bbox.height}
                            />
                        </svg>
                    )}
                </div>
                <CustomOptionPreview
                    value={customOptions}
                />
            </MobilePreview>
        </div>
    );
}

export default ValidateImageScenarioPreview;
