import { useContext } from 'react';
import {
    Navigate,
    Outlet,
} from 'react-router';

import UserContext from '#contexts/UserContext';

function GuestLayout() {
    const { authenticated } = useContext(UserContext);

    if (authenticated) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
}

export default GuestLayout;
