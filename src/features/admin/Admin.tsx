import { Button, Heading, Stack } from '@chakra-ui/react';
import { useGetAccountsQuery, useGetLocationsQuery, useGetSchedulesQuery, useGetTasksQuery } from 'features/timetable';
import React from 'react';
import { MdFace, MdHouse, MdSchedule, MdTask } from 'react-icons/md';
import { NavLink, Outlet } from 'react-router-dom';

export const Admin: React.FC = (): JSX.Element => {

    return (
        <Stack direction='column' w='100%' spacing={4}>
            <Heading color='primary.500'>Admin-Bereich</Heading>
            <Stack direction='row' spacing={4}>
                <NavLinkHelper to='accounts' label='Accounts' icon={<MdFace fontSize='1.5rem' />} />
                <NavLinkHelper to='schedules' label='Buchungen' icon={<MdSchedule fontSize='1.5rem' />} />
                <NavLinkHelper to='locations' label='Orte' icon={<MdHouse fontSize='1.5rem' />} />
                <NavLinkHelper to='tasks' label='Tätigkeiten' icon={<MdTask fontSize='1.5rem' />} />
            </Stack>
            <OutletContainer />
        </Stack>
    )
}

type NavLinkerHelperProps = {
    to: string;
    label: string;
    icon?: React.ReactElement;
}

const NavLinkHelper: React.FC<NavLinkerHelperProps> = (props): JSX.Element => {
    const { to, label, icon } = props;

    return (
        <NavLink to={to}>
            {({ isActive }) => (
                <Button variant={isActive ? 'solid' : 'outline'} colorScheme='primary' minW='150px' leftIcon={icon}>
                    {label}
                </Button>
            )}
        </NavLink>
    )
}

const OutletContainer: React.FC = (): JSX.Element => {
    const { data: accounts, isLoading: accountsIsLoading, error: accountsError } = useGetAccountsQuery();
    const { data: locations, isLoading: locationsIsLoading, error: locationsError } = useGetLocationsQuery();
    const { data: schedules, isLoading: schedulesIsLoading, error: schedulesError } = useGetSchedulesQuery();
    const { data: tasks, isLoading: tasksIsLoading, error: tasksError } = useGetTasksQuery();

    return (
        <Outlet context={{
            data: { accounts, locations, schedules, tasks },
            isLoading: { accountsIsLoading, locationsIsLoading, schedulesIsLoading, tasksIsLoading },
            error: { accountsError, locationsError, schedulesError, tasksError }
        }} />
    )
}