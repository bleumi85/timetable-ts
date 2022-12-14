import { Box, Button, Center, Progress, Stack, useToast } from '@chakra-ui/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useTable } from 'components';
import { ApiAlert } from 'components/controls';
import { getErrorMessage, useDeleteTaskMutation } from 'features/timetable';
import { Task } from 'features/types';
import React, { useCallback, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

type OutletProps = {
    data: { tasks: Task[] },
    isLoading: { tasksIsLoading: boolean },
    error: { tasksError: any }
}

export const AdminTasks: React.FC = (): JSX.Element => {
    const { data, isLoading, error } = useOutletContext<OutletProps>();

    const tableData = useMemo<Task[]>(() => data.tasks, [data.tasks]);

    if (isLoading.tasksIsLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    if (error.tasksError)
        return <ApiAlert error={error.tasksError} />

    return <FormattedTable data={tableData} />
}

const FormattedTable: React.FC<{ data: Task[] }> = (props): JSX.Element => {
    const { data } = props;

    const toast = useToast();
    const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

    const onDelete = useCallback(async (id: string) => {
        try {
            await deleteTask(id).unwrap();
            toast({
                title: 'Ort erfolgreich gelöscht',
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
    }, [deleteTask, toast]);

    const columnHelper = createColumnHelper<Task>();

    const columns = useMemo<ColumnDef<Task, any>[]>(() => [
        columnHelper.accessor('color', {
            header: () => <Center>Farbe</Center>,
            cell: info => {
                return info.getValue() && <Center><Box w="8" h="8" borderRadius='md' bg={info.getValue()} /></Center>
            }
        }),
        columnHelper.accessor('title', { header: 'Titel' }),
        columnHelper.accessor(row => row, {
            id: 'actions',
            header: '',
            cell: info => {
                const { id, schedulesCount } = info.getValue();
                const disabled = schedulesCount > 0;
                return (
                    <Center>
                        <Link to={`edit/${id}`}><Button size='sm' colorScheme='secondary'>Bearbeiten</Button></Link>
                        <Button size='sm' ml={4} colorScheme='red' onClick={() => onDelete(id)} disabled={isDeleting || disabled}>Löschen</Button>
                    </Center>
                )
            }
        }),
    ], [columnHelper, isDeleting, onDelete]);

    const {
        TblFilter, TblContainer, TblHead, TblBody, TblPagination
    } = useTable<Task>(data, columns, false);

    return (
        <Stack direction='column' maxW='container.lg' spacing={4} p={2} >
            <TblFilter />
            <TblContainer>
                <colgroup>
                    <col width='10%' />
                    <col width='40%' />
                    <col width='50%' />
                </colgroup>
                <TblHead />
                <TblBody />
            </TblContainer>
            <TblPagination />
        </Stack>
    )
}