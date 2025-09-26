import {
    PiArrowUpRight,
    PiDownload,
} from 'react-icons/pi';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import ButtonLayout from '#components/ButtonLayout';
import Container from '#components/Container';
import ListLayout from '#components/ListLayout';
import { TutorialProjectDetailQuery } from '#generated/types/graphql';

interface Props {
    projectDetail: TutorialProjectDetailQuery | undefined;
}

function ProjectAssetsList(props: Props) {
    const { projectDetail } = props;

    if (isNotDefined(projectDetail?.project)) {
        return null;
    }

    const {
        aoiGeometryInputAsset,
        projectTypeSpecificOutputAsset,
    } = projectDetail.project;

    if (isNotDefined(aoiGeometryInputAsset) && isNotDefined(projectTypeSpecificOutputAsset)) {
        return null;
    }

    return (
        <Container
            heading="Project Assets"
            headingLevel={5}
            withHeaderBorder
        >
            <ListLayout layout="grid">
                {isDefined(aoiGeometryInputAsset?.file) && (
                    <Container
                        heading="AOI Geometry"
                        headingLevel={6}
                        contentLayout="inline"
                    >
                        <a
                            href={aoiGeometryInputAsset.file.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Download"
                            download
                        >
                            <ButtonLayout
                                start={<PiDownload />}
                            >
                                Download GeoJSON
                            </ButtonLayout>
                        </a>
                        <a
                            href={`https://geojson.io/#data=data:text/x-url,${encodeURIComponent(aoiGeometryInputAsset.file.url)}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Preview in geojson.io"
                        >
                            <ButtonLayout
                                end={<PiArrowUpRight />}
                            >
                                Open in geojson.io
                            </ButtonLayout>
                        </a>
                    </Container>
                )}
                {isDefined(projectTypeSpecificOutputAsset?.file) && (
                    <Container
                        heading="Processed Tasks"
                        headingLevel={6}
                        contentLayout="inline"
                    >
                        <a
                            href={projectTypeSpecificOutputAsset.file.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Download"
                            download
                        >
                            <ButtonLayout
                                start={<PiDownload />}
                            >
                                Download GeoJSON
                            </ButtonLayout>
                        </a>
                        <a
                            href={`https://geojson.io/#data=data:text/x-url,${encodeURIComponent(projectTypeSpecificOutputAsset.file.url)}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Preview in geojson.io"
                        >
                            <ButtonLayout
                                end={<PiArrowUpRight />}
                            >
                                Open in geojson.io
                            </ButtonLayout>
                        </a>
                    </Container>
                )}
            </ListLayout>
        </Container>
    );
}

export default ProjectAssetsList;
