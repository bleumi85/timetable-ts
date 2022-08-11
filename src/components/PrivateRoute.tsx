import { useAppSelector } from 'app/hooks';
import { UserRoles } from 'features/types';
import React from 'react';
import { Navigate } from 'react-router-dom';

type PrivateRouteProps = {
    children: React.ReactElement;
    roles?: UserRoles[]
}

export const PrivateRoute: React.FC<PrivateRouteProps> = (props): JSX.Element => {
    const { children, roles } = props;
    const { user: authUser } = useAppSelector((state) => state.auth);

    if (!authUser) {
        // not logged in so redirect to login page with the return url
        return <Navigate to='/account/login' />
    }

    // check if route is restricted by role
    if (roles && roles.indexOf(authUser.role) === -1) {
        // role not authorized so redirect to home page
        return <Navigate to='/' />
    }

    // authorized so return child component
    return children;
}