import { useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';

import EnumsContext from '#base/context/EnumsContext';
import ColorPreview from '#components/ColorSelectInput/ColorPreview';
import Container, { ContainerProps } from '#components/Container';
import ListLayout from '#components/ListLayout';
import TextOutput from '#components/TextOutput';
import {
    OverlayLayerTypeEnum,
    ProjectOverlayTileServerConfig,
} from '#generated/types/graphql';

import RasterTileServerOutput from '../RasterTileServerOutput';
import VectorTileServerOutput from '../VectorTileServerOutput';

interface Props extends Omit<ContainerProps, 'children'> {
    className?: string;
    value: ProjectOverlayTileServerConfig;
}

function OverlayTileServerConfigOutput(props: Props) {
    const {
        heading = 'Overlay tile server',
        value,
        className,

        headingLevel = 5,
        spacing = 'sm',

        ...containerProps
    } = props;

    const {
        type,
        vector,
        raster,
    } = value;

    const { overlayLayerTypeMapping } = useContext(EnumsContext);

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
                label="Type"
                value={overlayLayerTypeMapping?.[type].label}
            />
            {type === OverlayLayerTypeEnum.RasterTile && isDefined(raster) && (
                <>
                    <RasterTileServerOutput
                        heading={null}
                        value={raster.tileServer}
                    />
                    <Container
                        heading="Properties"
                        headingLevel={6}
                        spacing="xs"
                    >
                        <TextOutput
                            label="Opacity"
                            value={raster.opacity}
                        />
                    </Container>
                </>
            )}
            {type === OverlayLayerTypeEnum.VectorTile && isDefined(vector) && (
                <>
                    <VectorTileServerOutput
                        label={null}
                        value={vector.tileServer}
                    />
                    <Container
                        heading="Properties"
                        headingLevel={6}
                        spacing="sm"
                    >
                        <ListLayout
                            layout="grid"
                            spacing="xs"
                        >
                            <TextOutput
                                label="Line width"
                                value={vector.lineWidth}
                            />
                            <TextOutput
                                label="Line color"
                                value={vector.lineColor}
                                description={<ColorPreview value={vector.lineColor} />}
                            />
                            <TextOutput
                                label="Line dasharray"
                                value={vector.lineDasharray}
                            />
                            <TextOutput
                                label="Line opacity"
                                value={vector.lineOpacity}
                            />
                            <TextOutput
                                label="Fill color"
                                value={vector.fillColor}
                                description={<ColorPreview value={vector.fillColor} />}
                            />
                            <TextOutput
                                label="Fill opacity"
                                value={vector.fillOpacity}
                            />
                        </ListLayout>
                    </Container>
                </>
            )}
        </Container>
    );
}

export default OverlayTileServerConfigOutput;
