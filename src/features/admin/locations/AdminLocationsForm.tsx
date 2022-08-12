import { Button, Container, Grid, GridItem, Heading, Progress, Stack, useToast } from '@chakra-ui/react';
import { ColorPicker, Input, Select } from 'components/controls';
import { getErrorMessage, useAddLocationMutation, useGetLocationQuery, useUpdateLocationMutation } from 'features/timetable';
import { LocationRequest, SelectOption, User, UserRoles } from 'features/types';
import { Form, Formik, FormikHelpers } from 'formik';
import { history } from 'helpers';
import React, { useMemo } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import * as Yup from 'yup';

export const AdminLocationsForm: React.FC = (): JSX.Element => {
    const { id } = useParams();
    const isAddMode = !id;

    const toast = useToast();

    const { data, isLoading } = useGetLocationQuery(id);
    const { data: { accounts } } = useOutletContext<{ data: { accounts: User[] } }>();
    const [addLocation] = useAddLocationMutation();
    const [updateLocation] = useUpdateLocationMutation();

    const accountOptions: SelectOption[] = useMemo(() => {
        if (accounts) {
            return accounts
                .filter((account) => account.role === UserRoles.User)
                .map((account) => {
                    return { id: account.id, title: `${account.lastName}, ${account.firstName}` }
                })
        }
        return [];
    }, [accounts]);

    if (isLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    const initialValues: LocationRequest = {
        id: data?.id,
        title: data?.title ?? '',
        color: data?.color ?? '#ccc',
        accountId: data?.accountId ?? ''
    };

    const validationSchema = Yup.object().shape({
        accountId: Yup.string().required('Account ist Pflichtfeld'),
        title: Yup.string().required('Titel ist Pflichtfeld')
    });

    const onSubmit = (values: LocationRequest, { setSubmitting }: FormikHelpers<LocationRequest>) => {
        values = isAddMode ? values : { ...values, id };
        createOrUpdateLocation(values, setSubmitting)
    };

    const createOrUpdateLocation = async (values: LocationRequest, setSubmitting: (isSubmitting: boolean) => void) => {
        try {
            isAddMode ? await addLocation(values).unwrap() : await updateLocation(values).unwrap();
            history.navigate && history.navigate('/admin/locations')
        } catch (err) {
            const errMsg = getErrorMessage(err);
            toast({
                title: `Ort konnte nicht ${isAddMode ? 'erstellt' : 'aktualisiert'} werden`,
                description: errMsg,
                status: 'error',
                duration: 4000,
                isClosable: true
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Container maxW='container.md' bg='whiteAlpha.900' boxShadow='md' p={0}>
            <Heading size='md' bg='secondary.500' color='white' px={4} py={2}>Ort {isAddMode ? 'anlegen' : 'bearbeiten'}</Heading>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                {({ errors, touched, isSubmitting, values, setFieldValue, handleChange }) => (
                    <Form style={{ padding: 'var(--chakra-space-4)' }}>
                        <Grid templateColumns='repeat(4, 1fr)' gap={4} mb={6}>
                            <GridItem rowSpan={2}>
                                <section className='small'>
                                    <ColorPicker
                                        color={values.color}
                                        onChange={(newColor) => setFieldValue('color', newColor)}
                                        style={{ maxHeight: '100px' }}
                                    />
                                </section>
                            </GridItem>
                            <GridItem colSpan={3}>
                                <Input
                                    name='title'
                                    value={values.title}
                                    onChange={handleChange}
                                />
                            </GridItem>
                            <GridItem colSpan={3}>
                                <Select
                                    name='accountId'
                                    value={values.accountId}
                                    onChange={handleChange}
                                    options={accountOptions}
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