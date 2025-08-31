import { lazy } from 'react';

import { wrap } from '#base/utils/routes';

const fourHundredFour = wrap({
    path: '*',
    title: '404',
    component: lazy(() => import('#views/FourHundredFour')),
    componentProps: {},
    visibility: 'is-anything',
    navbarVisibility: true,
});

const login = wrap({
    path: '/login/',
    title: 'Login',
    navbarVisibility: false,
    component: lazy(() => import('#views/Login')),
    componentProps: {},
    visibility: 'is-not-authenticated',
});

const home = wrap({
    path: '/',
    title: 'Home',
    navbarVisibility: true,
    component: lazy(() => import('#views/Home')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const projects = wrap({
    path: '/projects/',
    title: 'Projects',
    navbarVisibility: true,
    component: lazy(() => import('#views/Projects')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const tutorials = wrap({
    path: '/tutorials/',
    title: 'Tutorials',
    navbarVisibility: true,
    component: lazy(() => import('#views/Tutorials')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const teams = wrap({
    path: '/teams/',
    title: 'Teams',
    navbarVisibility: true,
    component: lazy(() => import('#views/Teams')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const userGroups = wrap({
    path: '/user-groups/',
    title: 'User Groups',
    navbarVisibility: true,
    component: lazy(() => import('#views/UserGroups')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const contributors = wrap({
    path: '/contributors/',
    title: 'Contributors',
    navbarVisibility: true,
    component: lazy(() => import('#views/Contributors')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const newProject = wrap({
    path: '/project/new/',
    title: 'New Project',
    navbarVisibility: true,
    component: lazy(() => import('#views/NewProject')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const editProject = wrap({
    path: '/project/:id/edit/',
    title: 'Edit project',
    navbarVisibility: true,
    component: lazy(() => import('#views/EditProject')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const newTutorial = wrap({
    path: '/tutorial/new/',
    title: 'New Tutorial',
    navbarVisibility: true,
    component: lazy(() => import('#views/NewTutorial')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const editTutorial = wrap({
    path: '/tutorial/:id/edit/',
    title: 'Edit Tutorial',
    navbarVisibility: true,
    component: lazy(() => import('#views/EditTutorial')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const routes = {
    login,
    home,
    projects,
    newProject,
    editProject,
    newTutorial,
    editTutorial,
    fourHundredFour,
    tutorials,
    teams,
    userGroups,
    contributors,
};
export default routes;
