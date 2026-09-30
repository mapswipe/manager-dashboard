import {
    PiDownloadSimple,
    PiFileArchive,
    PiFileCsv,
    PiFileText,
    PiMapTrifold,
} from 'react-icons/pi';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import SmartLink from '#base/components/SmartLink';
import ButtonLayout from '#components/ButtonLayout';
import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import List from '#components/List';
import ListLayout from '#components/ListLayout';
import Tag from '#components/Tag';
import TextOutput from '#components/TextOutput';
import { AssetMimetypeEnum } from '#generated/types/graphql';
import {
    formatFileSize,
    getAvailableExports,
    type ProjectExports,
} from '#utils/common';

import styles from './styles.module.css';

type ExportItem = ReturnType<typeof getAvailableExports>[number];

interface FileTypeDetail {
    icon: React.ReactNode;
    label: string;
}

const fileTypeDetails: Partial<Record<AssetMimetypeEnum, FileTypeDetail>> = {
    [AssetMimetypeEnum.Gzip]: { icon: <PiFileArchive />, label: 'GZIP' },
    [AssetMimetypeEnum.Csv]: { icon: <PiFileCsv />, label: 'CSV' },
    [AssetMimetypeEnum.Geojson]: { icon: <PiMapTrifold />, label: 'GeoJSON' },
    [AssetMimetypeEnum.Json]: { icon: <PiFileText />, label: 'JSON' },
    [AssetMimetypeEnum.Plaintext]: { icon: <PiFileText />, label: 'TXT' },
};

function getFileTypeDetails(mimetype: AssetMimetypeEnum | null | undefined) {
    if (isNotDefined(mimetype)) {
        return { icon: <PiFileText />, label: undefined };
    }
    return fileTypeDetails[mimetype] ?? { icon: <PiFileText />, label: mimetype };
}

interface ExportListItemProps {
    className?: string;
    item: ExportItem;
}

function ExportListItem(props: ExportListItemProps) {
    const {
        className,
        item,
    } = props;

    const fileType = getFileTypeDetails(item.mimetype);

    return (
        <div className={_cs(styles.exportItem, className)}>
            <InlineLayout
                spacing="md"
                withPadding
                withCenterAlign
                start={(
                    <Tag
                        className={styles.icon}
                        colorVariant="primary"
                    >
                        {fileType.icon}
                    </Tag>
                )}
                childrenContainerClassName={styles.details}
                end={(
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`Download ${item.name}`}
                        aria-label={`Download ${item.label}`}
                        download
                    >
                        <ButtonLayout
                            className={styles.actionIcon}
                            styleVariant="transparent"
                            spacing="xs"
                        >
                            <PiDownloadSimple />
                        </ButtonLayout>
                    </a>
                )}
            >
                <ListLayout
                    layout="block"
                    spacing="xs"
                    withFullWidth
                >
                    <TextOutput
                        className={styles.label}
                        value={item.label}
                        withEllipsizedOverflow
                    />
                    <InlineLayout
                        className={styles.meta}
                        spacing="xs"
                        withCenterAlign
                        start={isDefined(fileType.label) && (
                            <Tag
                                className={styles.format}
                                colorVariant="text"
                                spacing="sm"
                            >
                                {fileType.label}
                            </Tag>
                        )}
                    >
                        {item.fileSize > 0 && formatFileSize(item.fileSize)}
                        {isDefined(item.documentationUrl) && (
                            <span className={styles.separator}>·</span>
                        )}
                        {isDefined(item.documentationUrl) && (
                            <SmartLink
                                className={styles.docsLink}
                                external
                                href={item.documentationUrl}
                                title={`Documentation for ${item.label}`}
                                colorVariant="text"
                                spacing="2xs"
                                withoutPadding
                                withLinkIcon
                            >
                                Docs
                            </SmartLink>
                        )}
                    </InlineLayout>

                </ListLayout>
            </InlineLayout>
        </div>
    );
}

const exportKeySelector = (item: ExportItem) => item.key;

interface Props {
    project: ProjectExports;
}

function ProjectExportsList(props: Props) {
    const { project } = props;

    const availableExports = getAvailableExports(project);

    if (availableExports.length === 0) {
        return null;
    }

    const exportRendererParams = (_: string, item: ExportItem): ExportListItemProps => ({
        item,
    });

    return (
        <Container
            heading="Exports"
            headingLevel={5}
            withHeaderBorder
        >
            <ListLayout
                layout="grid"
                spacing="sm"
                minGridColumnSize="18rem"
                numPreferredGridColumns={3}
            >
                <List
                    data={availableExports}
                    keySelector={exportKeySelector}
                    renderer={ExportListItem}
                    rendererParams={exportRendererParams}
                />
            </ListLayout>
        </Container>
    );
}

export default ProjectExportsList;
