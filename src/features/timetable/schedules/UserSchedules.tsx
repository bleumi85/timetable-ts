import { EmailIcon, InfoIcon } from '@chakra-ui/icons';
import { Button, Center, IconButton, Progress, Stack, Text, Tooltip, useToast } from '@chakra-ui/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useTable } from 'components';
import { ApiAlert } from 'components/controls';
import { ScheduleAdmin } from 'features/types';
import moment from 'moment';
import React, { useCallback, useMemo } from 'react';
import { MdOutlinePictureAsPdf } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { getErrorMessage, useDeleteScheduleMutation, useGetSchedulesQuery } from '../timetableApi';

export const UserSchedules: React.FC = (): JSX.Element => {
    let { data: schedules = [], isLoading, error } = useGetSchedulesQuery();

    if (isLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    if (error)
        return <ApiAlert error={error} />

    const sortedSchedules = [...schedules];

    return <FormattedTable data={sortedSchedules} />
}

const FormattedTable: React.FC<{ data: ScheduleAdmin[] }> = (props): JSX.Element => {
    const { data } = props;

    const toast = useToast();
    const [deleteSchedule, { isLoading: isDeleting }] = useDeleteScheduleMutation();

    const onDelete = useCallback(async (id: string) => {
        try {
            await deleteSchedule(id).unwrap();
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
    }, [deleteSchedule, toast]);

    const columnHelper = createColumnHelper<ScheduleAdmin>();

    const columns = useMemo<ColumnDef<ScheduleAdmin, any>[]>(() => [
        columnHelper.accessor(row => {
            return row.isTransferred ? 'JA' : 'NEIN'
        }, {
            id: 'isTransferred',
            header: '',
            enableSorting: false,
            cell: info => {
                const isTransferred = info.getValue();
                return <Center>
                    {isTransferred === 'JA' ? <EmailIcon color='green.500' fontSize='1.25rem' /> : null}
                </Center>
            }
        }),
        columnHelper.accessor('location.title', {
            header: 'Ort'
        }),
        columnHelper.accessor('task.title', {
            header: 'Tätigkeit'
        }),
        columnHelper.accessor('remark', {
            header: () => <Center>Bemerkung</Center>,
            cell: info =>
                info.getValue() && <Center><Tooltip label={info.getValue()}>
                    <InfoIcon fontSize='1.25rem' color='primary.500' />
                </Tooltip></Center>,
            enableColumnFilter: false,
            enableSorting: false
        }),
        columnHelper.accessor('timeFrom', {
            header: 'Datum',
            cell: info => new Date(info.getValue()).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }),
            enableColumnFilter: false
        }),
        columnHelper.accessor(row => {
            const tStart = moment(row.timeFrom).format('HH:mm');
            const tEnd = moment(row.timeTo).format('HH:mm');
            return `${tStart} - ${tEnd} Uhr`
        }, {
            id: 'time',
            header: 'Zeit',
            enableColumnFilter: false,
            enableSorting: false
        }),
        columnHelper.accessor(row => {
            const tStart = moment(row.timeFrom);
            const tEnd = moment(row.timeTo);
            let diff = tEnd.diff(tStart);
            let duration = moment.utc(diff);
            let hasHours = duration.hours() > 0;
            return hasHours ? duration.format('H:mm') + ' Std.' : duration.format('m') + ' Min.'
        }, {
            id: 'duration',
            header: () => <Text textAlign='right'>Dauer</Text>,
            cell: info => <Text textAlign='right'>{info.getValue()}</Text>,
            enableColumnFilter: false,
            enableSorting: false
        }),
        columnHelper.accessor(row => row, {
            id: 'actions',
            header: '',
            cell: info => {
                const { id, isTransferred } = info.getValue();
                return (
                    <Center>
                        <Link to={`edit/${id}`}><Button size='sm' colorScheme='secondary' disabled={isTransferred}>Bearbeiten</Button></Link>
                        <Button size='sm' ml={4} colorScheme='red' disabled={isTransferred || isDeleting} onClick={() => onDelete(id)}>Löschen</Button>
                    </Center>
                )
            },
            enableColumnFilter: false
        })
    ], [columnHelper, isDeleting, onDelete])

    const {
        TblFilter, TblContainer, TblHead, TblBody, TblPagination, getSelectedRows
    } = useTable<ScheduleAdmin>(data, columns, true, [{ id: 'isTransferred', value: 'NEIN' }], true);

    const selectedRows: ScheduleAdmin[] = getSelectedRows.map(row => row.original);

    return (
        <>
            <Stack direction='column' maxW='container.xl' spacing={4} p={2} w='100%'>
                <TblFilter>
                    <Link to='pdf' state={{ data: selectedRows }}>
                        <IconButton
                            aria-label='create pdf'
                            colorScheme='blue'
                            icon={<MdOutlinePictureAsPdf fontSize='1.5rem' />}
                        />
                    </Link>
                </TblFilter>
                <TblContainer>
                    <TblHead />
                    <TblBody />
                </TblContainer>
                <TblPagination />
            </Stack>
        </>
    )
}