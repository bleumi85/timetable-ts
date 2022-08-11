import { Container } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { Nav, PrivateRoute } from 'components';
import { Login } from 'features/account';
import { authActions } from 'features/account/authSlice';
import { history } from 'helpers';
import React, { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

const App: React.FC = (): JSX.Element => {
    const [showAdmin, setShowAdmin] = useState(false);
    const { user: authUser } = useAppSelector((state) => state.auth);

    // init custom history object to allow navigation from 
    // anywhere in the react app (inside or outside components)
    history.navigate = useNavigate();
    history.location = useLocation();

    const dispatch = useAppDispatch();

    const logOut = useCallback(() => {
        dispatch(authActions.logout())
    }, [dispatch]);

    useEffect(() => {
        if (authUser) {
            setShowAdmin(authUser.role === 'Admin');
        } else {
            setShowAdmin(false);
        }
    }, [authUser]);

    return (
        <>
            <Nav authUser={authUser} showAdmin={showAdmin} logOut={logOut} />
            <Container maxW='container.2xl' display='flex' justifyContent='center' p={4} border='3px solid tomato'>
                <Routes>
                    <Route
                        path='/'
                        element={<PrivateRoute><div>Home</div></PrivateRoute>}
                    />
                    <Route path='account'>
                        <Route path='login' element={<Login />} />
                    </Route>
                </Routes>
            </Container>
        </>
    );
};

export default App;