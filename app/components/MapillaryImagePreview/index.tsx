import {
    useEffect,
    useRef,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { Viewer } from 'mapillary-js';

import styles from './styles.module.css';

interface Props {
    className?: string;
    imageId: string | undefined;
}

function MapillaryImagePreview(props: Props) {
    const {
        className,
        imageId,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer>();

    useEffect(() => {
        if (containerRef.current && isDefined(imageId)) {
            viewerRef.current = new Viewer({
                accessToken: import.meta.env.APP_MAPILLARY_API_KEY,
                container: containerRef.current,
                imageId,
            });
        }
    }, [imageId]);

    return (
        <div
            ref={containerRef}
            className={_cs(styles.mapillaryImagePreview, className)}
        />
    );
}

export default MapillaryImagePreview;
