import { useAppSelector } from 'app/hooks';
import React from 'react';
import { Navigate } from 'react-router-dom';

export const PrivateRoute: React.FC<{children: React.ReactElement}> = (props): JSX.Element => {
    const { user: authUser } = useAppSelector((state) => state.auth);

    if (!authUser) {
        // not logged in so redirect to login page with the return url
        return <Navigate to='/account/login' />
    }

    // authorized so return child component
    return props.children;
}