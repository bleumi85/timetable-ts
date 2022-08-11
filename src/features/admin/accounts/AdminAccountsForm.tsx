import { Button, Container, Heading, Progress, SimpleGrid, Stack, useToast } from '@chakra-ui/react';
import { Input, RadioCard } from 'components/controls';
import { getErrorMessage, useAddAccountMutation, useGetAccountQuery, useUpdateAccountMutation } from 'features/timetable';
import { RadioOption, UserRequest, UserRoles } from 'features/types';
import { Form, Formik, FormikHelpers } from 'formik';
import { history } from 'helpers';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import * as Yup from 'yup';

export const AdminAccountsForm: React.FC = (): JSX.Element => {
    const { id } = useParams();
    const isAddMode = !id;

    const toast = useToast();

    const { data, isLoading } = useGetAccountQuery(id);
    const [addAccount] = useAddAccountMutation();
    const [updateAccount] = useUpdateAccountMutation();

    if (isLoading)
        return <Progress w='100%' isIndeterminate colorScheme='primary' />

    const roleOptions: RadioOption[] = Object.values(UserRoles).map((value) => {
        return { id: value, title: value }
    })

    const initialValues: UserRequest = {
        id: data?.id,
        firstName: data?.firstName ?? '',
        lastName: data?.lastName ?? '',
        email: data?.email ?? '',
        password: '',
        confirmPassword: '',
        role: data?.role ?? UserRoles.User
    }

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('Vorname ist Pflichtfeld'),
        lastName: Yup.string().required('Nachname ist Pflichtfeld'),
        email: Yup.string().email('E-Mail ist nicht valide').required('E-Mail ist Pflichtfeld')
    });

    const onSubmit = (values: UserRequest, { setSubmitting }: FormikHelpers<UserRequest>) => {
        values = isAddMode ? values : { ...values, id };
        createOrUpdateAccount(isAddMode, values, setSubmitting);
    }

    const createOrUpdateAccount = async (isAddMode: boolean, values: UserRequest, setSubmitting: (isSubmitting: boolean) => void) => {
        try {
            isAddMode ? await addAccount(values).unwrap() : await updateAccount(values).unwrap();
            history.navigate && history.navigate('/admin/accounts')
        } catch (err) {
            const errMsg = getErrorMessage(err);
            toast({
                title: `Account konnte nicht ${isAddMode ? 'erstellt' : 'aktualisiert'} werden`,
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
            <Heading size='md' bg='secondary.500' color='white' px={4} py={2}>Account {isAddMode ? 'anlegen' : 'bearbeiten'}</Heading>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                {({ errors, touched, isSubmitting, values, setFieldValue, handleChange }) => (
                    <Form style={{ padding: 'var(--chakra-space-4)' }}>
                        <SimpleGrid columns={2} spacing={4} mb={6}>
                            <Input
                                name='firstName'
                                label='Vorname'
                                value={values.firstName}
                                onChange={handleChange}
                                error={touched.firstName && errors.firstName}
                            />
                            <Input
                                name='lastName'
                                label='Nachname'
                                value={values.lastName}
                                onChange={handleChange}
                                error={touched.lastName && errors.lastName}
                            />
                            <Input
                                name='email'
                                label='E-Mail'
                                value={values.email}
                                onChange={handleChange}
                                error={touched.email && errors.email}
                            />
                            <RadioCard
                                name='role'
                                label='Rolle'
                                value={values.role}
                                options={roleOptions}
                                onChange={(value) => setFieldValue('role', value)}
                                direction='row'
                            />
                            <Input
                                password
                                name='password'
                                label='Passwort'
                                value={values.password}
                                onChange={handleChange}
                                error={touched.password && errors.password}
                            />
                            <Input
                                password
                                name='confirmPassword'
                                label='Passwort bestätigen'
                                value={values.confirmPassword}
                                onChange={handleChange}
                                error={touched.confirmPassword && errors.confirmPassword}
                            />
                        </SimpleGrid>
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