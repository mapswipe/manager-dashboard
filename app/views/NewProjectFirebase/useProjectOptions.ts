import { useMemo } from 'react';

import { CustomOptions } from '#views/NewTutorial/utils';

// FIXME: these typings are reusable
interface Organisation {
    name: string;
    nameKey: string;
    description?: string;
}

interface Team {
    teamName: string;
    teamToken: string;
    maxTasksPerUserPerProject?: number;
}

interface ScreenDetail {
    description: string;
    icon: string;
    title: string;
}

interface TileServerDetails {
    apiKey: string;
    credits: string;
    name: string;
    url: string;
}

interface Tutorial {
    contributorCount: number;
    exampleImage1: string;
    exampleImage2: string;
    inputGeometries?: string; // For Validate
    lookFor: string;
    name: string;
    progress: number;
    projectDetails: string;
    projectId: string;
    projectType: number;
    screens: {
        hint: ScreenDetail,
        instructions: ScreenDetail,
        success: ScreenDetail,
    }[];
    status: string; // "tutorial"?
    tileServer: TileServerDetails;
    tileServerB?: TileServerDetails; // For Compare and Completeness
    tutorialDraftId: string;
    zoomLevel: number;
    customOptions: CustomOptions;
}

function useProjectOptions(selectedProjectType: number | undefined) {
    const options = useMemo(
        () => ({
            teamOptions: [],
            teamsPending: false,
            tutorialOptions: [],
            tutorialsPending: false,
            organisationOptions: [],
            organisationsPending: false,
        }),
        [],
    );

    return options;
}

export default useProjectOptions;
