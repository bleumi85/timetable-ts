import { Button, Container, Flex, Grid, GridItem, Heading, Progress, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
import { DatePicker, Select } from 'components/controls';
import { getErrorMessage, useAddScheduleMutation, useGetScheduleQuery, useUpdateScheduleMutation } from 'features/timetable';
import { Location, ScheduleRequest, SelectOption, Task, User, UserRoles } from 'features/types';
import { Form, Formik, FormikHelpers } from 'formik';
import { history } from 'helpers';
import moment, { Moment } from 'moment';
import React, { useMemo, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import * as Yup from 'yup';

export const AdminSchedulesForm: React.FC = (): JSX.Element => {
    const { id } = useParams();
    const isAddMode = !id;

    const toast = useToast();

    const { data, isLoading } = useGetScheduleQuery(id);
    const { data: { accounts = [], locations = [], tasks = [] } }
        = useOutletContext<{ data: { accounts: User[], locations: Location[], tasks: Task[] } }>();
    const [addSchedule] = useAddScheduleMutation();
    const [updateSchedule] = useUpdateScheduleMutation();

    const [duration, setDuration] = useState<Moment>(
        data?.timeFrom && data?.timeTo ? moment.utc(moment(data?.timeTo).diff(moment(data?.timeFrom))) : moment('2000-01-01')
    );

    useMemo(() => {
        if (data) {
            const t = data.timeFrom && data.timeTo ? moment.utc(moment(data.timeTo).diff(moment(data.timeFrom))) : moment('2000-01-01')
            setDuration(t);
        } else {
            setDuration(moment('2000-01-01 01:00:00'))
        }
    }, [data]);

    const accountOptions: SelectOption[] = useMemo(() => {
        return accounts
            .filter((account) => account.role === UserRoles.User)
            .map((account) => {
                return { id: account.id, title: `${account.lastName}, ${account.firstName}` }
            })
    }, [accounts]);

    const locationOptions: SelectOption[] = useMemo(() => locations.map((location) => {
        return { id: location.id, title: location.title }
    }).sort((a, b) => a.title.localeCompare(b.title)), [locations]);

    const taskOptions: SelectOption[] = useMemo(() => tasks.map((task) => {
        return { id: task.id, title: task.title }
    }).sort((a, b) => a.title.localeCompare(b.title)), [tasks]);

    if (isLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    const onDateChange = (timeFrom: Date | null, timeTo: Date | null) => {
        let duration = moment('2000-01-01');
        if (timeFrom && timeTo) {
            let tStart = moment(timeFrom);
            let tEnd = moment(timeTo);
            let diff = tEnd.diff(tStart);
            duration = moment.utc(diff);
        }
        setDuration(duration)
    }

    const initialValues: ScheduleRequest = {
        id: data?.id,
        accountId: data?.accountId ?? '',
        locationId: data?.locationId ?? '',
        taskId: data?.taskId ?? '',
        timeFrom: data?.timeFrom ? new Date(data.timeFrom) : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 8),
        timeTo: data?.timeTo ? new Date(data.timeTo) : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 9),
        isTransferred: data?.isTransferred ?? false,
        remark: data?.remark ?? ''
    }

    const validationSchema = Yup.object().shape({
        accountId: Yup.string().required('Account ist Pflichtfeld'),
        locationId: Yup.string().required('Ort ist Pflichtfeld'),
        taskId: Yup.string().required('T??tigkeit ist Pflichtfeld'),
        timeFrom: Yup.date().typeError('Das ist kein Datum mit einer Uhrzeit').nullable().required('Start ist Pflichtfeld'),
        timeTo: Yup.date()
            .min(Yup.ref('timeFrom'), 'Ende kann nicht vor Start liegen')
            .typeError('Das ist kein Datum mit einer Uhrzeit')
            .nullable()
            .required('Ende ist Pflichtfeld')
            .test(
                "",
                "Start und Ende sollten am selben Tag sein",
                (val, props) => {
                    const timeTo = moment(val);
                    const timeFrom = moment(props.parent.timeFrom);
                    return timeFrom.isSame(timeTo, 'day');
                }
            )
    });

    const onSubmit = async (values: ScheduleRequest, { setSubmitting }: FormikHelpers<ScheduleRequest>) => {
        try {
            isAddMode ? await addSchedule(values).unwrap() : await updateSchedule({ ...values, id }).unwrap();
            history.navigate && history.navigate('/admin/schedules');
        } catch (err) {
            const errMsg = getErrorMessage(err);
            toast({
                title: `Buchung konnte nicht ${isAddMode ? 'erstellt' : 'aktualisiert'} werden`,
                description: errMsg,
                status: 'error',
                duration: 4000,
                isClosable: true
            })
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxW='container.md' bg='whiteAlpha.900' boxShadow='md' p={0}>
            <Heading size='md' bg='secondary.500' color='white' px={4} py={2}>Buchung {isAddMode ? 'anlegen' : 'bearbeiten'}</Heading>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                {({ errors, touched, isSubmitting, values, setFieldValue, handleChange }) => (
                    <Form style={{ padding: 'var(--chakra-space-4)' }}>
                        <Grid templateColumns='repeat(6, 1fr)' gap={4} mb={6}>
                            <GridItem colSpan={6}>
                                <Select
                                    name='accountId'
                                    value={values.accountId}
                                    onChange={handleChange}
                                    options={accountOptions}
                                    error={touched.accountId && errors.accountId}
                                />
                            </GridItem>
                            <GridItem colSpan={[6, 6, 3]} >
                                <DatePicker
                                    name='timeFrom'
                                    selected={values.timeFrom}
                                    onChange={(date) => { onDateChange(date, values.timeTo); setFieldValue('timeFrom', date) }}
                                    error={touched.timeFrom && errors.timeFrom}
                                />
                            </GridItem>
                            <GridItem colSpan={[6, 6, 3]} >
                                <DatePicker
                                    name='timeFrom'
                                    selected={values.timeTo}
                                    onChange={(date) => { onDateChange(values.timeFrom, date); setFieldValue('timeTo', date) }}
                                    error={touched.timeTo && errors.timeTo}
                                />
                            </GridItem>
                            <GridItem colSpan={[6, 6, 2]}>
                                <Select
                                    name='locationId'
                                    value={values.locationId}
                                    onChange={handleChange}
                                    options={locationOptions}
                                    error={touched.locationId && errors.locationId}
                                />
                            </GridItem>
                            <GridItem colSpan={[6, 6, 2]}>
                                <Select
                                    name='taskId'
                                    value={values.taskId}
                                    onChange={handleChange}
                                    options={taskOptions}
                                    error={touched.taskId && errors.taskId}
                                />
                            </GridItem>
                            <GridItem colSpan={[6, 6, 2]} border='1px solid' borderColor='gray.200' borderRadius='md' display='flex' alignItems='center' justifyContent='center' maxH="10">
                                <Flex>
                                    <Text fontWeight='bold' mr={2}>Dauer: </Text>
                                    <Text>{duration.hours() > 0 ? duration.format('H:mm') + ' Std.' : duration.format('m') + ' Min.'}</Text>
                                </Flex>
                            </GridItem>
                            <GridItem colSpan={6}>
                                <Textarea
                                    name='remark'
                                    value={values.remark}
                                    onChange={handleChange}
                                    size='sm'
                                    resize='none'
                                />
                            </GridItem>
                        </Grid>
                        <Stack direction='row' justifyContent='flex-end' px={6} spacing={4}>
                            <Link to='..'>
                                <Button colorScheme='red' variant='outline'>Abbrechen</Button>
                            </Link>
                            <Button colorScheme='telegram' type='submit' disabled={isSubmitting}>OK</Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </Container>
    )
}