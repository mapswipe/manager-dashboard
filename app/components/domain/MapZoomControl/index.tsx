import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    MdAdd,
    MdRemove,
} from 'react-icons/md';
import {
    bound,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { MapChildContext } from '@togglecorp/re-map';
import type { RasterTileSource } from 'maplibre-gl';

import RawButton from '#components/RawButton';
import {
    getRasterMaxViewZoom,
    getRasterTileZoom,
} from '#utils/geo';

import styles from './styles.module.css';

function getTileZoomLabel(tileZoom: number, tileMinZoom: number, tileMaxZoom: number) {
    if (tileZoom < tileMinZoom) {
        return {
            label: `Below min zoom ${tileMinZoom}`,
            title: `No imagery is fetched below zoom ${tileMinZoom}`,
        };
    }
    if (tileZoom === tileMaxZoom) {
        return {
            label: `Zoom ${tileZoom} · Max zoom`,
            title: `Imagery is shown at its max zoom ${tileZoom}`,
        };
    }
    return {
        label: `Zoom ${tileZoom}`,
        title: `Imagery tiles are fetched at zoom ${tileZoom}`,
    };
}

interface Props {
    children: React.ReactNode;
}

// NOTE: Must be rendered as a child of BaseMap to read the map
function MapZoomControl(props: Props) {
    const { children } = props;

    const { map, mapStyle } = useContext(MapChildContext);
    const source = isNotDefined(mapStyle)
        ? undefined
        : map?.getSource<RasterTileSource>('base-tile-source');

    const [viewZoom, setViewZoom] = useState<number | undefined>();

    // NOTE: So that quick clicks step from the target zoom, not mid-animation
    const targetViewZoomRef = useRef<number | undefined>();

    useEffect(() => {
        if (isNotDefined(map)) {
            setViewZoom(undefined);
            return undefined;
        }

        const handleZoom = () => {
            setViewZoom(map.getZoom());
        };

        handleZoom();
        map.on('zoom', handleZoom);

        return () => {
            map.off('zoom', handleZoom);
        };
    }, [map]);

    // NOTE: Caps every zoom input, keyboard included, at the imagery's max zoom
    useEffect(() => {
        if (isNotDefined(map) || isNotDefined(source)) {
            return undefined;
        }

        const prevMaxViewZoom = map.getMaxZoom();
        map.setMaxZoom(bound(
            getRasterMaxViewZoom(source.tileSize, source.maxzoom),
            map.getMinZoom(),
            prevMaxViewZoom,
        ));

        return () => {
            map.setMaxZoom(prevMaxViewZoom);
        };
    }, [map, source]);

    const handleZoomClick = useCallback((step: number) => {
        if (isNotDefined(map)) {
            return;
        }

        const baseViewZoom = map.isEasing() && isDefined(targetViewZoomRef.current)
            ? targetViewZoomRef.current
            : map.getZoom();

        const nextViewZoom = bound(baseViewZoom + step, map.getMinZoom(), map.getMaxZoom());

        targetViewZoomRef.current = nextViewZoom;
        map.easeTo({ zoom: nextViewZoom });
    }, [map]);

    const mapLoaded = isDefined(map) && isDefined(source) && isDefined(viewZoom);

    const atMinViewZoom = mapLoaded && viewZoom <= map.getMinZoom();
    const atMaxViewZoom = mapLoaded && viewZoom >= map.getMaxZoom();

    const tileZoomLabel = mapLoaded
        ? getTileZoomLabel(
            getRasterTileZoom(viewZoom, source.tileSize, source.maxzoom),
            source.minzoom,
            source.maxzoom,
        )
        : undefined;

    return (
        <div className={styles.mapZoomControl}>
            {children}
            {isDefined(tileZoomLabel) && (
                <>
                    <div
                        className={styles.zoomLabel}
                        title={tileZoomLabel.title}
                    >
                        {tileZoomLabel.label}
                    </div>
                    <div className={styles.zoomButtons}>
                        <RawButton
                            name={1}
                            className={styles.button}
                            onClick={handleZoomClick}
                            disabled={atMaxViewZoom}
                            title="Zoom in"
                            aria-label="Zoom in"
                        >
                            <MdAdd />
                        </RawButton>
                        <RawButton
                            name={-1}
                            className={styles.button}
                            onClick={handleZoomClick}
                            disabled={atMinViewZoom}
                            title="Zoom out"
                            aria-label="Zoom out"
                        >
                            <MdRemove />
                        </RawButton>
                    </div>
                </>
            )}
        </div>
    );
}

export default MapZoomControl;
