import { Button, Container, Grid, GridItem, Heading, Progress, Stack, useToast } from '@chakra-ui/react';
import { Checkbox, ColorPicker, Input } from 'components/controls';
import { LocationRequest, User } from 'features/types';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { history } from 'helpers';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { getErrorMessage, useAddLocationMutation, useGetLocationQuery, useUpdateLocationMutation } from '../timetableApi';

export const UserLocationsForm: React.FC<{ authUser: User | undefined }> = (props): JSX.Element => {
    const { authUser } = props;
    const { id } = useParams();
    const isAddMode = !id;

    const toast = useToast();

    const { data, isLoading } = useGetLocationQuery(id);
    const [addLocation] = useAddLocationMutation();
    const [updateLocation] = useUpdateLocationMutation();

    if (isLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    const initialValues: LocationRequest = {
        id: data?.id,
        title: data?.title ?? '',
        color: data?.color ?? '#ccc',
        accountId: authUser?.id ?? '',
        showCompleteMonth: data?.showCompleteMonth ?? false
    }

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Titel ist Pflichtfeld')
    });

    const onSubmit = async (values: LocationRequest, { setSubmitting }: FormikHelpers<LocationRequest>) => {
        try {
            isAddMode ? await addLocation(values) : await updateLocation({ ...values, id })
            history.navigate && history.navigate('/locations');
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
            setSubmitting(true);
        }
    }

    return (
        <Container maxW='container.sm' bg='whiteAlpha.900' boxShadow='md' p={0}>
            <Heading size='sm' bg='secondary.500' color='white' px={4} py={2}>Ort {isAddMode ? 'anlegen' : 'aktualisieren'}</Heading>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                {(props: FormikProps<LocationRequest>) => {
                    const { errors, touched, isSubmitting, values, setFieldValue, handleChange } = props;
                    return (
                        <Form style={{ padding: 'var(--chakra-space-4)' }}>
                            <Grid templateColumns='repeat(4, 1fr)' gap={4} mb={6}>
                                <GridItem rowSpan={2}>
                                    <section className='small'>
                                        <ColorPicker
                                            color={values.color}
                                            onChange={(newColor) => setFieldValue('color', newColor)}
                                        />
                                    </section>
                                </GridItem>
                                <GridItem colSpan={3}>
                                    <Input
                                        name='title'
                                        label='Bezeichnung'
                                        value={values.title}
                                        onChange={handleChange}
                                        error={touched.title && errors.title}
                                    />
                                </GridItem>
                                <GridItem colSpan={3}>
                                    <Checkbox
                                        name='showCompleteMonth'
                                        label='Ganzen Monat ausgeben'
                                        checked={values.showCompleteMonth}
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
                    )
                }}
            </Formik>
        </Container>
    )
}