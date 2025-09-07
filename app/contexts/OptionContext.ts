import { createContext } from 'react';

import {
    GetOrganizationQuery,
    GetProjectQuery,
    GetTutorialQuery,
    GetUserQuery,
} from '#generated/types/graphql';

type UserOption = NonNullable<NonNullable<GetUserQuery['users']>['results']>[number];
type OrganizationOption = NonNullable<NonNullable<GetOrganizationQuery['organizations']>['results']>[number];
type TutorialOption = NonNullable<NonNullable<GetTutorialQuery['tutorials']>['results']>[number];
type ProjectOption = NonNullable<NonNullable<GetProjectQuery['projects']>['results']>[number];

/*
interface X {
    [key: string]: { id: string }[] | null | undefined;
}
*/

export interface Options {
    user?: UserOption[] | null;
    organization?: OrganizationOption[] | null;
    tutorial?: TutorialOption[] | null;
    project?: ProjectOption[] | null;
}

interface OptionContext {
    options: Options;
    setOptions: React.Dispatch<React.SetStateAction<Options>>;
}

const OptionContext = createContext<OptionContext>({
    options: {},
    setOptions: (options: unknown) => {
        // eslint-disable-next-line no-console
        console.warn('Trying to set options to ', options);
    },
});

export default OptionContext;
