import { Button, Container, Grid, GridItem, Heading, Progress, Stack, useToast } from '@chakra-ui/react';
import { ColorPicker, Input } from 'components/controls';
import { TaskRequest, User } from 'features/types';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { history } from 'helpers';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { getErrorMessage, useAddTaskMutation, useGetTaskQuery, useUpdateTaskMutation } from '../timetableApi';

export const UserTasksForm: React.FC<{ authUser: User | undefined }> = (props): JSX.Element => {
    const { authUser } = props;
    const { id } = useParams();
    const isAddMode = !id;

    const toast = useToast();

    const { data, isLoading } = useGetTaskQuery(id);
    const [addLocation] = useAddTaskMutation();
    const [updateLocation] = useUpdateTaskMutation();

    if (isLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    const initialValues: TaskRequest = {
        id: data?.id,
        title: data?.title ?? '',
        color: data?.color ?? '#ccc',
        accountId: authUser?.id ?? ''
    }

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Titel ist Pflichtfeld')
    });

    const onSubmit = async (values: TaskRequest, { setSubmitting }: FormikHelpers<TaskRequest>) => {
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
            <Heading size='sm' bg='secondary.500' color='white' px={4} py={2}>Tätigkeit {isAddMode ? 'anlegen' : 'aktualisieren'}</Heading>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                {(props: FormikProps<TaskRequest>) => {
                    const { errors, touched, isSubmitting, values, setFieldValue, handleChange } = props;
                    return (
                        <Form style={{ padding: 'var(--chakra-space-4)' }}>
                            <Grid templateColumns='repeat(4, 1fr)' gap={4} mb={6}>
                                <GridItem>
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