import { Box, Button, Center, Progress, Stack, useToast } from '@chakra-ui/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useTable } from 'components';
import { ApiAlert } from 'components/controls';
import { Location } from 'features/types';
import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteLocationMutation, useGetLocationsQuery } from '../timetableApi';

export const UserLocations: React.FC = (): JSX.Element => {
    let { data: locations = [], isLoading, error } = useGetLocationsQuery();

    if (isLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    if (error)
        return <ApiAlert error={error} />

    const sortedLocations = [...locations].sort((a, b) => a.title.localeCompare(b.title));
    locations = sortedLocations;

    return <FormattedTable data={locations} />
}

const FormattedTable: React.FC<{ data: Location[] }> = (props): JSX.Element => {
    const { data } = props;

    const toast = useToast();
    const [deleteLocation, { isLoading: isDeleting }] = useDeleteLocationMutation();

    const onDelete = useCallback(async (id: string) => {

    }, []);

    const columnHelper = createColumnHelper<Location>();

    const columns = useMemo<ColumnDef<Location, any>[]>(() => [
        columnHelper.accessor('color', {
            header: () => <Center>Farbe</Center>,
            cell: info => {
                return info.getValue() && <Center><Box w="8" h="8" borderRadius='md' bg={info.getValue()} /></Center>
            }
        }),
        columnHelper.accessor('title', { header: 'Title' }),
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
    } = useTable<Location>(data, columns, false);

    return (
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
    )
}