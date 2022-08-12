import { Box, Button, Center, Progress, Stack, useToast } from '@chakra-ui/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useTable } from 'components';
import { ApiAlert } from 'components/controls';
import { getErrorMessage, useDeleteLocationMutation } from 'features/timetable';
import { Location } from 'features/types';
import React, { useCallback, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

type OutletProps = {
    data: { locations: Location[] },
    isLoading: { locationsIsLoading: boolean },
    error: { locationsError: any }
}

export const AdminLocations: React.FC = (): JSX.Element => {
    const { data, isLoading, error } = useOutletContext<OutletProps>();

    const tableData = useMemo<Location[]>(() => data.locations, [data.locations]);

    if (isLoading.locationsIsLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    if (error.locationsError)
        return <ApiAlert error={error.locationsError} />

    return <FormattedTable data={tableData} />
}

const FormattedTable: React.FC<{ data: Location[] }> = (props): JSX.Element => {
    const { data } = props;

    const toast = useToast();
    const [deleteLocation, { isLoading: isDeleting }] = useDeleteLocationMutation();

    const onDelete = useCallback(async (id: string) => {
        try {
            await deleteLocation(id).unwrap();
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
    }, [deleteLocation, toast]);

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