import { Button, Heading, Stack } from '@chakra-ui/react';
import { useGetAccountsQuery } from 'features/timetable';
import { history } from 'helpers';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export const Admin: React.FC = (): JSX.Element => {
    const pathname = history.location?.pathname;

    return (
        <Stack direction='column' w='100%' spacing={4} border='1px solid green'>
            <Heading color='primary.500'>Admin-Bereich</Heading>
            <Stack direction='row' spacing={4}>
                <Link to='accounts'>
                    <Button minW='150px' colorScheme={pathname?.includes('accounts') ? 'secondary' : 'primary'}>Accounts</Button>
                </Link>
                <Link to='locations'>
                    <Button minW='150px' colorScheme={pathname?.includes('locations') ? 'secondary' : 'primary'}>Orte</Button>
                </Link>
                <Link to='tasks'>
                    <Button minW='150px' colorScheme={pathname?.includes('tasks') ? 'secondary' : 'primary'}>Tätigkeiten</Button>
                </Link>
                <Link to='schedules'>
                    <Button minW='150px' colorScheme={pathname?.includes('schedules') ? 'secondary' : 'primary'}>Buchungen</Button>
                </Link>
            </Stack>
            <OutletContainer />
        </Stack>
    )
}

const OutletContainer: React.FC = (): JSX.Element => {
    const { data: accounts, isLoading: accountsIsLoading, error: accountsError } = useGetAccountsQuery();

    return (
        <Outlet context={{
            data: { accounts },
            isLoading: { accountsIsLoading },
            error: { accountsError }
        }} />
    )
}