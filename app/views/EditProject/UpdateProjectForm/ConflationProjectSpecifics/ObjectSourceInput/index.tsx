import {
    EntriesAsList,
    getErrorObject,
    LeafError,
    ObjectError,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import TextInput from '#components/TextInput';

import { PartialConflationObjectSourceInputFields } from './schema';

interface Props {
    value: PartialConflationObjectSourceInputFields | undefined,
    error: LeafError | ObjectError<PartialConflationObjectSourceInputFields>,
    setFieldValue: (...entries: EntriesAsList<PartialConflationObjectSourceInputFields>) => void;
}

function ObjectSourceInput(props: Props) {
    const {
        value,
        error: formError,
        setFieldValue,
    } = props;

    const error = getErrorObject(formError);

    return (
        <Container
            heading="Conflation Object Source"
            headingLevel={4}
        >
            <TextInput
                label="URL for geojson"
                name="objectGeojsonUrl"
                value={value?.objectGeojsonUrl}
                error={error?.objectGeojsonUrl}
                onChange={setFieldValue}
                hint="Provide a direct link to a GeoJSON file containing your building footprint geometries."
            />
        </Container>
    );
}

export default ObjectSourceInput;
