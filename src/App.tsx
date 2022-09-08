import { Container } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { Nav, Page404, PrivateRoute } from 'components';
import { Login, Profile } from 'features/account';
import { authActions } from 'features/account/authSlice';
import { Admin, AdminMain } from 'features/admin';
import { AdminAccounts, AdminAccountsForm } from 'features/admin/accounts';
import { AdminLocations, AdminLocationsForm } from 'features/admin/locations';
import { AdminSchedules, AdminSchedulesForm } from 'features/admin/schedules';
import { AdminTasks, AdminTasksForm } from 'features/admin/tasks';
import { UserLocations, UserLocationsForm } from 'features/timetable/locations';
import { UserSchedules, UserSchedulesForm, UserSchedulesPDF } from 'features/timetable/schedules';
import { UserTasks, UserTasksForm } from 'features/timetable/tasks';
import { UserRoles } from 'features/types';
import { history } from 'helpers';
import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

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
            setShowAdmin(authUser.role === UserRoles.Admin);
        } else {
            setShowAdmin(false);
        }
    }, [authUser]);

    return (
        <>
            <Nav authUser={authUser} showAdmin={showAdmin} logOut={logOut} />
            <Container maxW='container.2xl' display='flex' justifyContent='center' p={history.location?.pathname === '/404' ? 0 : 4}>
                <Routes>
                    <Route
                        path='/'
                        element={<PrivateRoute><div>Home</div></PrivateRoute>}
                    />
                    <Route
                        path='404'
                        element={<Page404 />}
                    />
                    <Route path='account'>
                        <Route
                            path='login'
                            element={<Login />}
                        />
                        <Route
                            path='profile'
                            element={<PrivateRoute>
                                <Profile authUser={authUser} />
                            </PrivateRoute>}
                        />
                    </Route>
                    <Route
                        path='admin'
                        element={<PrivateRoute roles={[UserRoles.Admin]}><Admin /></PrivateRoute>}
                    >
                        <Route index element={<AdminMain />} />
                        <Route path='accounts'>
                            <Route index element={<AdminAccounts />} />
                            <Route path='add' element={<AdminAccountsForm />} />
                            <Route path='edit/:id' element={<AdminAccountsForm />} />
                            <Route path='*' element={<Navigate to='/admin/accounts' />} />
                        </Route>
                        <Route path='locations'>
                            <Route index element={<AdminLocations />} />
                            <Route path='add' element={<AdminLocationsForm />} />
                            <Route path='edit/:id' element={<AdminLocationsForm />} />
                            <Route path='*' element={<Navigate to='/admin/locations' />} />
                        </Route>
                        <Route path='schedules'>
                            <Route index element={<AdminSchedules />} />
                            <Route path='add' element={<AdminSchedulesForm />} />
                            <Route path='edit/:id' element={<AdminSchedulesForm />} />
                            <Route path='*' element={<Navigate to='/admin/schedules' />} />
                        </Route>
                        <Route path='tasks'>
                            <Route index element={<AdminTasks />} />
                            <Route path='add' element={<AdminTasksForm />} />
                            <Route path='edit/:id' element={<AdminTasksForm />} />
                            <Route path='*' element={<Navigate to='/admin/locations' />} />
                        </Route>
                    </Route>
                    <Route path='locations'>
                        <Route index element={<UserLocations />} />
                        <Route path='add' element={<UserLocationsForm authUser={authUser} />} />
                        <Route path='edit/:id' element={<UserLocationsForm authUser={authUser} />} />
                        <Route path='*' element={<Navigate to='/locations' />} />
                    </Route>
                    <Route path='schedules'>
                        <Route index element={<UserSchedules />} />
                        <Route path='add' element={<UserSchedulesForm authUser={authUser} />} />
                        <Route path='edit/:id' element={<UserSchedulesForm authUser={authUser} />} />
                        <Route path='pdf' element={<UserSchedulesPDF />} />
                        <Route path='*' element={<Navigate to='/schedules' />} />
                    </Route>
                    <Route path='tasks'>
                        <Route index element={<UserTasks />} />
                        <Route path='add' element={<UserTasksForm authUser={authUser} />} />
                        <Route path='edit/:id' element={<UserTasksForm authUser={authUser} />} />
                        <Route path='*' element={<Navigate to='/tasks' />} />
                    </Route>
                    <Route path='*' element={<Navigate to='/404' />} />
                </Routes>
            </Container>
        </>
    );
};

export default App;