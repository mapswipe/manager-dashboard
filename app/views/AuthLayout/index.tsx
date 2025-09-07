import { useContext } from 'react';
import {
    Navigate,
    Outlet,
} from 'react-router';

import UserContext from '#contexts/UserContext';

function AuthLayout() {
    const { authenticated } = useContext(UserContext);

    if (!authenticated) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}

export default AuthLayout;
