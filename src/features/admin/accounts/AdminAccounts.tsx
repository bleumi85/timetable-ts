import { CheckIcon } from '@chakra-ui/icons';
import { Button, Center, Progress, Stack, useToast } from '@chakra-ui/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useTable } from 'components';
import { ApiAlert } from 'components/controls';
import { getErrorMessage, useDeleteAccountMutation } from 'features/timetable';
import { User } from 'features/types';
import React, { useCallback, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

type OutletProps = {
    data: { accounts: User[] },
    isLoading: { accountsIsLoading: boolean },
    error: { accountsError: any }
}

export const AdminAccounts: React.FC = (): JSX.Element => {
    const { data, isLoading, error } = useOutletContext<OutletProps>();

    const tableData = useMemo<User[]>(() => data.accounts, [data.accounts]);

    if (isLoading.accountsIsLoading) {
        return <Progress w='100%' isIndeterminate colorScheme='primary' />
    }

    if (error.accountsError) {
        return <ApiAlert error={error.accountsError} />
    }

    return <FormattedTable data={tableData} />
}

const FormattedTable: React.FC<{ data: User[] }> = (props): JSX.Element => {
    const { data } = props;

    const toast = useToast();
    const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

    const onDelete = useCallback(async (id: string) => {
        try {
            await deleteAccount(id).unwrap();
            toast({
                title: 'Account erfolgreich gelöscht',
                status: 'success',
                duration: 2000,
                isClosable: true
            })
        } catch (err) {
            const errMsg = getErrorMessage(err);
            toast({
                title: 'Löschen nicht möglich',
                description: errMsg,
                status: 'error',
                duration: 4000,
                isClosable: true
            })
        }
    }, [deleteAccount, toast]);

    const columnHelper = createColumnHelper<User>();

    const columns = useMemo<ColumnDef<User, any>[]>(() => [
        columnHelper.accessor('isVerified', {
            header: '',
            cell: info => {
                const isVerified = info.getValue() as boolean;
                if (isVerified) return <Center><CheckIcon color='green' /></Center>;
                return null;
            },
        }),
        columnHelper.accessor(row => `${row.lastName}, ${row.firstName}`,
            {
                id: 'fullName',
                header: 'Name',
            }),
        columnHelper.accessor('email', {
            header: 'E-Mail',
        }),
        columnHelper.accessor('role', {
            header: 'Rolle',
        }),
        columnHelper.accessor('id', {
            header: '',
            cell: info => {
                const id = info.getValue();
                return (
                    <Center>
                        <Link to={`edit/${id}`}><Button size='sm' colorScheme='secondary'>Bearbeiten</Button></Link>
                        <Button size='sm' ml={4} colorScheme='red' onClick={() => onDelete(id)} disabled={isDeleting}>Löschen</Button>
                    </Center>
                )
            },
        })
    ], [columnHelper, isDeleting, onDelete]);

    const {
        TblFilter, TblContainer, TblHead, TblBody, TblPagination
    } = useTable<User>(data, columns, false)

    return (
        <Stack direction='column' maxW='container.xl' spacing={4} p={2} >
            <TblFilter />
            <TblContainer>
                <colgroup>
                    <col width='5%' />
                    <col width='27%' />
                    <col width='27%' />
                    <col width='11%' />
                    <col width='30%' />
                </colgroup>
                <TblHead />
                <TblBody />
            </TblContainer>
            <TblPagination />
        </Stack>
    )
}