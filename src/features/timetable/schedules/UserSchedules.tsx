import { AttachmentIcon, InfoIcon } from '@chakra-ui/icons';
import { Avatar, Box, Button, Center, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList, Progress, Stack, Tag, TagLabel, Text, Tooltip, useToast } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { dateFormat } from 'app/settings';
import { DeleteConfirmation, useTable } from 'components';
import { ApiAlert } from 'components/controls';
import { Location, ScheduleAdmin, Task } from 'features/types';
import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import { MdOutlinePictureAsPdf } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { getErrorMessage, useDeleteScheduleMutation, useGetSchedulesQuery } from '../timetableApi';
import { IconName } from '@fortawesome/fontawesome-svg-core';

library.add(fas);

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
    const locations = data.map(d => d.location);
    const uniqueLocations = locations.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.title === value.title
        ))
    );

    const toast = useToast();
    const [deleteSchedule, { isLoading: isDeleting }] = useDeleteScheduleMutation();

    const [id, setId] = useState('');
    const [displayConfirmationModal, setDisplayConfirmationModal] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');

    const showDeleteModal = useCallback(async (id: string, title: string) => {
        setId(id);
        setDeleteMessage(title);
        setDisplayConfirmationModal(true);
    }, []);

    const hideConfirmationModal = () => {
        setDisplayConfirmationModal(false);
    }

    const submitDelete = async (id: string) => {
        try {
            await deleteSchedule(id).unwrap();
            toast({
                title: 'Buchung erfolgreich gelöscht',
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
                    {isTransferred === 'JA' ? <AttachmentIcon color='green.500' fontSize='1.25rem' /> : null}
                </Center>
            }
        }),
        columnHelper.accessor('location', {
            header: 'Ort',
            cell: info => {
                const { icon, title, color } = info.getValue()
                const myIcon = icon as IconName;
                return (
                    <Tag size={'lg'} w={'100%'} variant={'outline'} fontWeight={'normal'} color='black' fontSize={'var(--chakra-fontSizes-sm)'} boxShadow={`0 0 0px 1px ${color}`}>
                        {icon && <Avatar
                            bg={color}
                            color='white'
                            size='xs'
                            ml={-1} mr={2}
                            icon={<FontAwesomeIcon icon={['fas', myIcon]} size='lg' />}
                        />}
                        <TagLabel>{title}</TagLabel>
                    </Tag>
                )
            },
            filterFn: (row, columnId, value) => {
                let rowValue = row.getValue(columnId) as Location;
                return rowValue.title === value;
            },
            sortingFn: (colA, colB, columnId) => {
                let columnA = (colA.getValue(columnId) as Location);
                let columnB = (colB.getValue(columnId) as Location);
                return columnA.title.localeCompare(columnB.title);
            }
        }),
        columnHelper.accessor('task', {
            header: 'Tätigkeit',
            cell: info => {
                const { title, color, icon } = info.getValue();
                const myIcon = icon as IconName;
                return (
                    <Tag size={'lg'} w={'100%'} variant={'outline'} fontWeight={'normal'} color='black' fontSize={'var(--chakra-fontSizes-sm)'} boxShadow={`0 0 0px 1px ${color}`}>
                        {icon && <Avatar
                            bg={color}
                            color='white'
                            size='xs'
                            ml={-1} mr={2}
                            icon={<FontAwesomeIcon icon={['fas', myIcon]} size='lg' />}
                        />}
                        <TagLabel>{title}</TagLabel>
                    </Tag>
                )
            },
            filterFn: (row, columnId, value) => {
                let rowValue = row.getValue(columnId) as Task;
                return rowValue.title === value;
            },
            sortingFn: (colA, colB, columnId) => {
                let columnA = (colA.getValue(columnId) as Task);
                let columnB = (colB.getValue(columnId) as Task);

                return columnA.title.localeCompare(columnB.title)
            }
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
            cell: info => new Date(info.getValue()).toLocaleDateString('de-DE', dateFormat),
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
                const { id, isTransferred, timeFrom, task } = info.getValue();
                let message = 'Möchtest du ' + task.title + ' am ' + new Date(timeFrom).toLocaleDateString('de-DE', dateFormat) + ' wirklich löschen?'
                return (
                    <Center>
                        <Link to={`edit/${id}`}><Button size='sm' colorScheme='secondary' disabled={isTransferred}>Bearbeiten</Button></Link>
                        <Button size='sm' ml={4} colorScheme='red' disabled={isTransferred || isDeleting} onClick={() => showDeleteModal(id, message)}>Löschen</Button>
                    </Center>
                )
            },
            enableColumnFilter: false
        })
    ], [columnHelper, isDeleting, showDeleteModal])

    const {
        TblFilter, TblContainer, TblHead, TblBody, TblPagination, getSelectedRows
    } = useTable<ScheduleAdmin>(data, columns, true, [{ id: 'isTransferred', value: 'NEIN' }], true);

    const selectedRows: ScheduleAdmin[] = getSelectedRows.map(row => row.original);

    return (
        <>
            <Stack direction='column' maxW='container.xl' spacing={4} p={2} w='100%'>
                <TblFilter>
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label='PDF Options'
                            colorScheme='blue'
                            icon={<MdOutlinePictureAsPdf fontSize='1.5rem' />}
                            variant='outline'
                        />
                        <MenuList>
                            {uniqueLocations.map((location) => (
                                <Link key={location.id} to='pdf' state={{ rows: data, selectedRows, location: location }}>
                                    <MenuItem key={location.id}>
                                        <HStack alignItems='center'>
                                            <Box boxSize='2rem' borderRadius='50%' bg={location.color} />
                                            <span>{location.title}</span>
                                        </HStack>
                                    </MenuItem>
                                </Link>
                            ))}
                        </MenuList>
                    </Menu>
                </TblFilter>
                <TblContainer>
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
