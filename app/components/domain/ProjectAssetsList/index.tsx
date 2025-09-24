import { Fragment } from 'react/jsx-runtime';
import {
    PiArrowUpRight,
    PiDownload,
} from 'react-icons/pi';
import { isNotDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import ButtonLayout from '#components/ButtonLayout';
import Container from '#components/Container';
import { useProjectOutputAssetsQuery } from '#generated/types/graphql';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECT_ASSETS_QUERY = gql`
query ProjectOutputAssets($projectId: ID!, $pagination: OffsetPaginationInput!) {
    projectAssets(
        pagination: $pagination
        filters: {projectId: {exact: $projectId}, type: {exact: OUTPUT}, exportType: {exact: AREA_OF_INTEREST}}
    ) {
        results {
            file {
                url
                name
            }
            id
            projectId
            type
            mimetype
        }
    }
}
`;

interface Props {
    projectId: string | undefined;
}

function ProjectAssetsList(props: Props) {
    const { projectId } = props;

    const [{
        data: projectAssetsResponse,
    }] = useProjectOutputAssetsQuery({
        variables: {
            projectId: projectId ?? '',
            pagination: {
                offset: 0,
                limit: 10,
            },
        },
        pause: isNotDefined(projectId),
    });

    if (!projectAssetsResponse) {
        return null;
    }

    return (
        <Container
            heading="Project AOI GeoJSON"
            headingLevel={5}
            contentLayout="inline"
        >
            {projectAssetsResponse?.projectAssets.results.map((projectAsset) => (
                <Fragment key={projectAsset.id}>
                    {projectAsset.file && (
                        <a
                            href={projectAsset.file.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Download"
                            download
                        >
                            <ButtonLayout
                                start={<PiDownload />}
                            >
                                Download
                            </ButtonLayout>
                        </a>
                    )}
                    {projectAsset.file && (
                        <a
                            href={`https://geojson.io/#data=data:text/x-url,${encodeURIComponent(projectAsset.file.url)}`}
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
                    )}
                </Fragment>
            ))}
        </Container>
    );
}

export default ProjectAssetsList;
