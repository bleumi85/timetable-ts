import { Button, Center, IconButton, Progress, Stack, useToast } from '@chakra-ui/react';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { DeleteConfirmation, useTable } from 'components';
import { ApiAlert } from 'components/controls';
import { Task } from 'features/types';
import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage, useDeleteTaskMutation, useGetTasksQuery } from '../timetableApi';

export const UserTasks: React.FC = (): JSX.Element => {
    let { data: tasks = [], isLoading, error } = useGetTasksQuery();

    if (isLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    if (error)
        return <ApiAlert error={error} />

    const sortedTasks = [...tasks].sort((a, b) => a.title.localeCompare(b.title));

    return <FormattedTable data={sortedTasks} />
}

const FormattedTable: React.FC<{ data: Task[] }> = (props): JSX.Element => {
    const { data } = props;

    const toast = useToast();
    const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

    const [id, setId] = useState('');
    const [displayConfirmationModal, setDisplayConfirmationModal] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');

    const showDeleteModal = useCallback(async (id: string, message: string) => {
        setId(id);
        setDeleteMessage(message);
        setDisplayConfirmationModal(true);
    }, []);

    const hideConfirmationModal = () => {
        setDisplayConfirmationModal(false);
    };

    const submitDelete = async (id: string) => {
        try {
            await deleteTask(id).unwrap();
            toast({
                title: 'Tätigkeit erfolgreich gelöscht',
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
        } finally {
            setDisplayConfirmationModal(false);
        }
    }

    const columnHelper = createColumnHelper<Task>();

    const columns = useMemo<ColumnDef<Task, any>[]>(() => [
        columnHelper.accessor(row => row, {
            id: 'color',
            header: () => <Center>Farbe</Center>,
            cell: info => {
                const { id, color, icon } = info.getValue();
                const myIcon = icon as IconName;
                return (
                    <Center>
                        <IconButton
                            aria-label={`color-${id}`}
                            bg={color}
                            icon={myIcon && <FontAwesomeIcon icon={['fas', myIcon]} size='lg' color='white' />}
                        />
                    </Center>
                )
            }
        }),
        columnHelper.accessor('title', { header: 'Titel' }),
        columnHelper.accessor(row => row, {
            id: 'actions',
            header: '',
            cell: info => {
                const { id, schedulesCount, title } = info.getValue();
                let message = "Möchtest du die Tätigkeit '" + title + "' wirklich löschen?"
                const disabled = schedulesCount > 0;
                return (
                    <Center>
                        <Link to={`edit/${id}`}><Button size='sm' colorScheme='secondary'>Bearbeiten</Button></Link>
                        <Button size='sm' ml={4} colorScheme='red' onClick={() => showDeleteModal(id, message)} disabled={isDeleting || disabled}>Löschen</Button>
                    </Center>
                )
            }
        }),
    ], [columnHelper, isDeleting, showDeleteModal]);

    const {
        TblFilter, TblContainer, TblHead, TblBody, TblPagination
    } = useTable<Task>(data, columns, false);

    return (
        <>
            <Stack direction='column' maxW='container.md' spacing={4} p={2} w='100%'>
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
            <DeleteConfirmation
                id={id}
                showModal={displayConfirmationModal}
                confirmModal={submitDelete}
                hideModal={hideConfirmationModal}
                message={deleteMessage}
            />
        </>
    )
}
