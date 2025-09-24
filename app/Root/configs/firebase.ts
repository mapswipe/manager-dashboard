import { isDefined } from '@togglecorp/fujs';
import { initializeApp } from 'firebase/app';
import {
    connectAuthEmulator,
    getAuth,
} from 'firebase/auth';

const apiKey = import.meta.env.APP_FIREBASE_API_KEY;
const authDomain = import.meta.env.APP_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.APP_FIREBASE_PROJECT_ID;

const authEmulatorUrl = import.meta.env.APP_FIREBASE_AUTH_EMULATOR_URL;

const firebaseConfig = isDefined(apiKey) && isDefined(authDomain) && isDefined(projectId)
    ? {
        apiKey: import.meta.env.APP_FIREBASE_API_KEY,
        authDomain: import.meta.env.APP_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.APP_FIREBASE_PROJECT_ID,
    } : undefined;

export const firebaseApp = isDefined(firebaseConfig)
    ? initializeApp(firebaseConfig)
    : undefined;

export const firebaseAuth = isDefined(firebaseConfig)
    ? getAuth(firebaseApp)
    : undefined;

const { APP_ENVIRONMENT } = import.meta.env;

if (APP_ENVIRONMENT === 'DEV' && isDefined(firebaseAuth) && isDefined(authEmulatorUrl)) {
    connectAuthEmulator(firebaseAuth, authEmulatorUrl);
}
