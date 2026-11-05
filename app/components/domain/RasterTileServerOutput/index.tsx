import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import { PiCopy } from 'react-icons/pi';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import Button from '#components/Button';
import Container, { ContainerProps } from '#components/Container';
import { rasterTileServerNameToTileInputKey } from '#components/domain/RasterTileServerInput/schema';
import TextOutput from '#components/TextOutput';
import TileServerContext from '#contexts/TileServerContext';
import {
    ProjectRasterTileServerConfig,
    RasterTileServerNameEnum,
} from '#generated/types/graphql';
import { formatNumber } from '#utils/common';

interface Props extends Omit<ContainerProps, 'children'> {
    className?: string;
    value: ProjectRasterTileServerConfig;
    // Show the zoom range saved on the layer, as BaseMap uses it for Validate
    withSavedZoomRange?: boolean;
}

function RasterTileServerOutput(props: Props) {
    const {
        heading = 'Tile server',
        className,
        value,
        withSavedZoomRange,

        headingLevel = 5,
        spacing = 'sm',

        ...containerProps
    } = props;

    const { raster: rasterTileServers } = useContext(TileServerContext);

    const rasterTileServerNameMapping = useMemo(
        () => listToMap(
            [
                ...rasterTileServers,
                { type: RasterTileServerNameEnum.Custom, label: 'Custom' },
            ],
            (item) => item.type,
            (item) => item,
        ),
        [rasterTileServers],
    );

    const {
        url,
        credits,
    } = useMemo(() => {
        const rasterTileServerMapping = listToMap(
            rasterTileServers,
            ({ type }) => type,
        );

        const { name } = value;

        if (name === RasterTileServerNameEnum.Custom) {
            return {
                url: value.custom?.url,
                credits: value.custom?.credits,
            };
        }

        return {
            url: rasterTileServerMapping[name]?.url,
            credits: rasterTileServerMapping[name]?.credits,
        };
    }, [rasterTileServers, value]);

    const zoomRange = withSavedZoomRange
        ? value[rasterTileServerNameToTileInputKey[value.name]]
        : undefined;
    const minZoom = zoomRange?.minZoom;
    const maxZoom = zoomRange?.maxZoom;

    const handleCopyUrlClick = useCallback((urlToCopy: string) => {
        navigator.clipboard.writeText(urlToCopy);
    }, []);

    return (
        <Container
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...containerProps}
            className={className}
            heading={heading}
            headingLevel={headingLevel}
            spacing={spacing}
        >
            <TextOutput
                label="Imagery server"
                value={rasterTileServerNameMapping?.[value.name].label}
                description={isDefined(url) && value.name === RasterTileServerNameEnum.Custom && (
                    <Button
                        name={url}
                        styleVariant="action"
                        spacing="sm"
                        title="Copy URL"
                        onClick={handleCopyUrlClick}
                    >
                        <PiCopy />
                    </Button>
                )}
            />
            {/*
            <TextOutput
                label="Url"
                value={url}
            />
            */}
            {withSavedZoomRange && (
                <TextOutput
                    label="Supported zoom"
                    value={(isDefined(minZoom) || isDefined(maxZoom))
                        ? `${formatNumber(minZoom) ?? '--'} to ${formatNumber(maxZoom) ?? '--'}`
                        : undefined}
                />
            )}
            <TextOutput
                label="Credits"
                value={credits}
                withEllipsizedOverflow
            />
        </Container>
    );
}

export default RasterTileServerOutput;
