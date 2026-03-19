import '@panoramax/web-viewer/build/index.css';
import '@panoramax/web-viewer';

import {
    useEffect,
    useMemo,
    useRef,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    imageId: string | undefined;
    url?: string | undefined | null;
}

const DEFAULT_ENDPOINT = 'https://api.panoramax.xyz/api';

function PanoramaxImagePreview({ className, imageId, url }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const endpoint = useMemo(() => {
        if (!url) return DEFAULT_ENDPOINT;
        return url.includes('mapcomplete') ? DEFAULT_ENDPOINT : `${url.replace(/\/+$/, '')}/api`;
    }, [url]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isDefined(imageId)) return () => {};
        const viewer = document.createElement('pnx-photo-viewer');
        viewer.setAttribute('endpoint', endpoint);
        viewer.setAttribute('picture', imageId);
        viewer.setAttribute('widgets', 'false');
        viewer.setAttribute('url-parameters', 'false');
        viewer.setAttribute('keyboard-shortcuts', 'false');
        viewer.setAttribute('psv-options', "{'picturesNavigation': 'pic', 'displayAnnotations': 'false'}");
        viewer.style.width = '100%';
        viewer.style.height = '100%';

        container.appendChild(viewer);

        return () => {
            container.removeChild(viewer);
        };
    }, [imageId, endpoint]);

    return (
        <div
            ref={containerRef}
            className={_cs(styles.panoramaxImagePreview, className)}
        />
    );
}

export default PanoramaxImagePreview;
