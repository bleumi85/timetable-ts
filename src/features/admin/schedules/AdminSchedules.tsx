import { InfoIcon } from '@chakra-ui/icons';
import { Button, Center, Progress, Stack, Text, Tooltip } from '@chakra-ui/react';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useTable } from 'components';
import { ApiAlert } from 'components/controls';
import { ScheduleAdmin } from 'features/types';
import moment from 'moment';
import React, { useMemo } from 'react';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { Link, useOutletContext } from 'react-router-dom';

type OutletProps = {
    data: { schedules: ScheduleAdmin[] },
    isLoading: { schedulesIsLoading: boolean },
    error: { schedulesError: FetchBaseQueryError | SerializedError | undefined }
}

export const AdminSchedules: React.FC = (): JSX.Element => {
    const { data, isLoading, error } = useOutletContext<OutletProps>();

    const tableData = useMemo<ScheduleAdmin[]>(() => data.schedules, [data.schedules]);

    if (isLoading.schedulesIsLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    if (error.schedulesError)
        return <ApiAlert error={error.schedulesError} />

    return <FormattedTable data={tableData} />
}

const FormattedTable: React.FC<{ data: ScheduleAdmin[] }> = (props): JSX.Element => {
    const { data } = props;

    const columnHelper = createColumnHelper<ScheduleAdmin>();

    const columns = useMemo<ColumnDef<ScheduleAdmin, any>[]>(() => [
        columnHelper.accessor('isTransferred', {
            header: '',
            enableColumnFilter: false,
            enableSorting: false,
            cell: (info) => (
                <Center>{info.getValue()
                    ? <MdCheckBox fontSize='1.5rem' />
                    : <MdCheckBoxOutlineBlank fontSize='1.5rem' />
                }</Center>
            )
        }),
        columnHelper.accessor(row => `${row.account.lastName}, ${row.account.firstName}`, {
            id: 'account',
            header: 'Account',
        }),
        columnHelper.accessor('location.title', {
            header: 'Ort',
        }),
        columnHelper.accessor('task.title', {
            header: 'Tätigkeit',
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
        columnHelper.accessor('id', {
            header: '',
            cell: info => {
                const id = info.getValue();
                return (
                    <Center>
                        <Link to={`edit/${id}`}><Button size='sm' colorScheme='secondary'>Bearbeiten</Button></Link>
                        <Button size='sm' ml={4} colorScheme='red'>Löschen</Button>
                    </Center>
                )
            },
            enableColumnFilter: false
        })
    ], [columnHelper]);

    const {
        TblFilter, TblContainer, TblHead, TblBody, TblPagination
    } = useTable<ScheduleAdmin>(data, columns);

    return (
        <Stack direction='column' maxW='container.2xl' spacing={4} p={2} >
            <TblFilter />
            <TblContainer>
                {/* <colgroup>
                    <col width='10%' />
                    <col width='40%' />
                    <col width='50%' />
                </colgroup> */}
                <TblHead />
                <TblBody />
            </TblContainer>
            <TblPagination />
        </Stack>
    )
}