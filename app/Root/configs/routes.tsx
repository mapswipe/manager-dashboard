type Visibility = 'is-authenticated' | 'is-not-authenticated' | 'is-anything';

export interface RouteConfig {
    index?: boolean;
    path?: string;
    load: () => Promise<{ default: () => React.JSX.Element | null }>;
    visibility: Visibility;
}

const login: RouteConfig = {
    path: '/login/',
    load: () => import('#views/Login'),
    visibility: 'is-not-authenticated',
};

const home: RouteConfig = {
    index: true,
    // path: '/',
    load: () => import('#views/Home'),
    visibility: 'is-authenticated',
};

const projects: RouteConfig = {
    path: '/projects/',
    load: () => import('#views/Projects'),
    visibility: 'is-authenticated',
};

const tutorials: RouteConfig = {
    path: '/tutorials/',
    load: () => import('#views/Tutorials'),
    visibility: 'is-authenticated',
};

const teams: RouteConfig = {
    path: '/teams/',
    load: () => import('#views/Teams'),
    visibility: 'is-authenticated',
};

const userGroups: RouteConfig = {
    path: '/user-groups/',
    load: () => import('#views/UserGroups'),
    visibility: 'is-authenticated',
};

const contributors: RouteConfig = {
    path: '/contributors/',
    load: () => import('#views/Contributors'),
    visibility: 'is-authenticated',
};

const newProject: RouteConfig = {
    path: '/project/new/',
    load: () => import('#views/NewProject'),
    visibility: 'is-authenticated',
};

const editProject: RouteConfig = {
    path: '/project/:id/edit/',
    load: () => import('#views/EditProject'),
    visibility: 'is-authenticated',
};

const newTutorial: RouteConfig = {
    path: '/tutorial/new/',
    load: () => import('#views/NewTutorial'),
    visibility: 'is-authenticated',
};

const editTutorial: RouteConfig = {
    path: '/tutorial/:id/edit/',
    load: () => import('#views/EditTutorial'),
    visibility: 'is-authenticated',
};

const fourHundredFour: RouteConfig = {
    path: '*',
    load: () => import('#views/FourHundredFour'),
    visibility: 'is-anything',
};

const routes = {
    login,

    home,
    projects,
    newProject,
    editProject,
    newTutorial,
    editTutorial,
    tutorials,
    teams,
    userGroups,
    contributors,

    fourHundredFour,
};

export type RouteKeys = keyof typeof routes;

export default routes;
