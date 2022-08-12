import { Button, Heading, Stack } from '@chakra-ui/react';
import { useGetAccountsQuery, useGetLocationsQuery, useGetTasksQuery } from 'features/timetable';
import { history } from 'helpers';
import React from 'react';
import { MdHouse, MdSchedule, MdTask } from 'react-icons/md';
import { Link, Outlet } from 'react-router-dom';

export const Admin: React.FC = (): JSX.Element => {
    const pathname = history.location?.pathname;

    return (
        <Stack direction='column' w='100%' spacing={4} border='1px solid green'>
            <Heading color='primary.500'>Admin-Bereich</Heading>
            <Stack direction='row' spacing={4}>
                <Link to='accounts'>
                    <Button
                        minW='150px'
                        colorScheme={pathname?.includes('accounts') ? 'secondary' : 'primary'}
                    >
                        Accounts
                    </Button>
                </Link>
                <Link to='schedules'>
                    <Button
                        minW='150px'
                        colorScheme={pathname?.includes('schedules') ? 'secondary' : 'primary'}
                        leftIcon={<MdSchedule fontSize='1.4rem' />}
                    >
                        Buchungen
                    </Button>
                </Link>
                <Link to='locations'>
                    <Button
                        minW='150px'
                        colorScheme={pathname?.includes('locations') ? 'secondary' : 'primary'}
                        leftIcon={<MdHouse fontSize='1.4rem' />}
                    >
                        Orte
                    </Button>
                </Link>
                <Link to='tasks'>
                    <Button
                        minW='150px'
                        colorScheme={pathname?.includes('tasks') ? 'secondary' : 'primary'}
                        leftIcon={<MdTask fontSize='1.4rem' />}
                    >
                        Tätigkeiten
                    </Button>
                </Link>
            </Stack>
            <OutletContainer />
        </Stack>
    )
}

const OutletContainer: React.FC = (): JSX.Element => {
    const { data: accounts, isLoading: accountsIsLoading, error: accountsError } = useGetAccountsQuery();
    const { data: locations, isLoading: locationsIsLoading, error: locationsError } = useGetLocationsQuery();
    const { data: tasks, isLoading: tasksIsLoading, error: tasksError } = useGetTasksQuery();

    /* if (tasksError)
        return <pre>{JSON.stringify(tasksError, null, 2)}</pre>

    return (
        <pre>{JSON.stringify(tasks, null, 2)}</pre>
    ) */

    return (
        <Outlet context={{
            data: { accounts, locations, tasks },
            isLoading: { accountsIsLoading, locationsIsLoading, tasksIsLoading },
            error: { accountsError, locationsError, tasksError }
        }} />
    )
}