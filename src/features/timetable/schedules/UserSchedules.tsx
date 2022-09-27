import { AttachmentIcon, InfoIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { Avatar, Box, Button, Center, Grid, GridItem, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList, Progress, SimpleGrid, Stack, Tag, TagLabel, Text, Tooltip, useToast } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { dateFormat } from 'app/settings';
import { DeleteConfirmation, useTable } from 'components';
import { ApiAlert } from 'components/controls';
import { Location, ScheduleAdmin, Task } from 'features/types';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
import React, { useCallback, useMemo, useState } from 'react';
import { isBrowser, isMobile } from 'react-device-detect';
import { MdOutlinePictureAsPdf } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { getErrorMessage, useDeleteScheduleMutation, useGetSchedulesQuery } from '../timetableApi';
import { IconName } from '@fortawesome/fontawesome-svg-core';

const moment = extendMoment(Moment);

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
    let { data } = props;
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

    const columnsOk = useMemo<ColumnDef<ScheduleAdmin, any>[]>(() => [
        columnHelper.accessor('fileId', {
            id: 'fileIdBool',
            header: '',
            enableSorting: false,
            cell: (info) => (
                <Center>
                    {info.getValue() !== null
                        ? <Link to={`/files/${info.getValue()}`}>
                            <AttachmentIcon color='green.500' fontSize='1.25rem' />
                        </Link>
                        : null
                    }
                </Center>
            ),
            filterFn: (row, columnId, value) => {
                let rowValue: string = (!!row.getValue(columnId)).toString().toUpperCase();
                return rowValue === value
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
            header: () => <Center>Info</Center>,
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
                        <Button size='sm' ml={4} colorScheme='danger' disabled={isTransferred || isDeleting} onClick={() => showDeleteModal(id, message)}>Löschen</Button>
                    </Center>
                )
            },
            enableColumnFilter: false
        })
    ], [columnHelper, isDeleting, showDeleteModal]);

    const columnsError = useMemo<ColumnDef<ScheduleAdmin, any>[]>(() => [
        ...columnsOk,
        columnHelper.accessor('hasConflict', {
            header: 'Konflikt?',
            cell: (info) => (
                <Center>
                    {info.getValue() ? <WarningTwoIcon fontSize={'1.5rem'} color='red.500' /> : null}
                </Center>
            )
        })
    ], [columnHelper, columnsOk]);

    const hasNoConflicts = data.every(s => s.hasConflict === false);

    const columns = hasNoConflicts ? columnsOk : columnsError;

    const {
        TblFilter, TblContainer, TblHead, TblBody, TblPagination, getSelectedRows
    } = useTable<ScheduleAdmin>(data, columns, true, [{ id: 'fileIdBool', value: 'FALSE' }], true);

    const selectedRows: ScheduleAdmin[] = getSelectedRows.map(row => row.original);

    return (
        <>
            {isBrowser && <Stack direction='column' maxW='container.xl' spacing={4} p={2} w='100%'>
                <TblFilter>
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label='PDF Options'
                            colorScheme='blue'
                            icon={<MdOutlinePictureAsPdf fontSize='1.5rem' />}
                            variant='outline'
                            disabled={!hasNoConflicts}
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
            </Stack>}
            {isMobile &&
                <Stack direction={'column'} spacing={4} w={'100%'}>
                    <Link to='add'>
                        <Button colorScheme={'primary'} w={'100%'}>Buchung anlegen</Button>
                    </Link>
                    {data.filter(d => !d.isTransferred).map((schedule) => {
                        const { hasConflict, id, isTransferred, location, task, timeFrom, timeTo } = schedule;
                        const dateStart = moment(timeFrom);
                        const dateEnd = moment(timeTo);
                        const diff = dateEnd.diff(dateStart);
                        const duration = moment.utc(diff);
                        const hasHours = duration.hours() > 0;
                        const durationStr = hasHours ? duration.format('H:mm') + ' Std.' : duration.format('m') + ' Min.';
                        let message = 'Möchtest du ' + task.title + ' am ' + dateStart.format('LL') + ' wirklich löschen?'

                        return (
                            <Grid key={id} p={2} gap={2} bg={hasConflict ? 'red.200' : 'whiteAlpha.900'} boxShadow={'md'} templateColumns='repeat(3, 1fr)'>
                                <GridItem>
                                    <Text fontWeight={'bold'} textAlign={'right'}>Ort</Text>
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <Tag bg={location.color} color='white' w={'100%'}>
                                        {location.icon && <Avatar
                                            bg={location.color}
                                            color='white'
                                            size='xs'
                                            ml={-1} mr={1}
                                            icon={<FontAwesomeIcon icon={['fas', location.icon as IconName]} size='lg' />}
                                        />}
                                        <TagLabel>{location.title}</TagLabel>
                                    </Tag>
                                </GridItem>
                                <GridItem>
                                    <Text fontWeight={'bold'} textAlign={'right'}>Tätigkeit</Text>
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <Tag bg={task.color} color='white' w={'100%'}>
                                        {location.icon && <Avatar
                                            bg={task.color}
                                            color='white'
                                            size='xs'
                                            ml={-1} mr={1}
                                            icon={<FontAwesomeIcon icon={['fas', task.icon as IconName]} size='lg' />}
                                        />}
                                        <TagLabel>{task.title}</TagLabel>
                                    </Tag>
                                </GridItem>
                                <GridItem>
                                    <Text fontWeight={'bold'} textAlign={'right'}>Datum</Text>
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <Text>
                                        {dateStart.format('ddd, LL')}
                                    </Text>
                                </GridItem>
                                <GridItem>
                                    <Text fontWeight={'bold'} textAlign={'right'}>Uhrzeit</Text>
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <Text>
                                        {`${dateStart.format('LT')} bis ${dateEnd.format('LT')} Uhr`}
                                    </Text>
                                </GridItem>
                                <GridItem>
                                    <Text fontWeight={'bold'} textAlign={'right'}>Dauer</Text>
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <Text>
                                        {durationStr}
                                    </Text>
                                </GridItem>
                                <GridItem colSpan={3}>
                                    <SimpleGrid columns={2} spacing={2}>
                                        <Link to={`edit/${id}`}>
                                            <Button size='sm' colorScheme={'secondary'} variant={'outline'} w={'100%'} disabled={isTransferred}>Bearbeiten</Button>
                                        </Link>
                                        <Button size='sm' colorScheme={'danger'} variant={'outline'} disabled={isTransferred || isDeleting} onClick={() => showDeleteModal(id, message)}>Löschen</Button>
                                    </SimpleGrid>
                                </GridItem>
                            </Grid>
                        )
                    })}
                </Stack>}
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
