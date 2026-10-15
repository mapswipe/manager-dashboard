import {
    useContext,
    useEffect,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { MapChildContext } from '@togglecorp/re-map';

const CORS_WARNING = 'Tiles from this server could not be loaded in the browser. Check that the URL is correct. If it is, the server is blocking requests from this site (CORS), so the imagery is only hidden in browser-based clients and you can still save the project.';

async function isTileCorsBlocked(url: string) {
    try {
        await fetch(url, { cache: 'no-store' });
        return false;
    } catch {
        try {
            await fetch(url, { mode: 'no-cors', cache: 'no-store' });
            return true;
        } catch {
            return false;
        }
    }
}

interface Props {
    sourceId: string;
    tileUrl: string | undefined;
    onChange: (warning: string | undefined) => void;
}

function TileCorsErrorWatcher(props: Props) {
    const {
        sourceId,
        tileUrl,
        onChange,
    } = props;

    const { map } = useContext(MapChildContext);

    useEffect(() => {
        if (isNotDefined(map) || isNotDefined(tileUrl)) {
            return undefined;
        }

        let done = false;
        const probedUrls = new Set<string>();

        const check = (url: string) => {
            if (done || probedUrls.has(url)) {
                return;
            }
            probedUrls.add(url);
            isTileCorsBlocked(url).then((blocked) => {
                if (blocked && !done) {
                    done = true;
                    onChange(CORS_WARNING);
                }
            });
        };

        const handleError = (e: maplibregl.ErrorEvent & { sourceId?: string }) => {
            const { status, url } = (e.error ?? {}) as { status?: number, url?: string };
            if (e.sourceId === sourceId && status === 0 && isDefined(url)) {
                check(url);
            }
        };

        map.on('error', handleError);

        return () => {
            done = true;
            map.off('error', handleError);
            onChange(undefined);
        };
    }, [map, sourceId, tileUrl, onChange]);

    return null;
}

export default TileCorsErrorWatcher;
