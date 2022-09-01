import { Avatar, Box, Button, Flex, Heading, Spacer, useToast, VStack } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { Input } from 'components/controls';
import { LoginData } from 'features/types';
import { Form, Formik, FormikProps } from 'formik';
import { history } from 'helpers';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authActions } from './authSlice';

export const Login: React.FC = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { user: authUser, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // redirect to profile page if already logged in
        if (authUser && history.navigate) history?.navigate('/account/profile');

        // eslint-disable-next-line react-hooks/exhaustive-deps
    })

    useEffect(() => {
        if (error) {
            toast({
                title: 'Anmeldung fehlgeschlagen',
                description: error,
                status: 'error',
                duration: 2000,
                isClosable: true
            })
        }
    }, [error, toast])

    return (
        <>
            <Flex flexDirection='column' width='100vw' height='90vh' justifyContent='center' alignItems='center'>
                <VStack mb={2}>
                    <Avatar bg='primary.500' />
                    <Heading color='primary.400'>Willkommen</Heading>
                    <Spacer />
                    <Box minW={{ base: '90%', md: '500px' }}>
                        <Formik
                            initialValues={{ email: '', password: '' }}
                            onSubmit={(values: LoginData) => {
                                return dispatch(authActions.login(values))
                            }}
                        >
                            {({ values, handleChange, isSubmitting }: FormikProps<LoginData>) => (
                                <Form>
                                    <VStack spacing={4} p={4} bg='whiteAlpha.900' boxShadow='md'>
                                        <Input
                                            name='email'
                                            value={values.email}
                                            onChange={handleChange}
                                            autoComplete='current-email'
                                        />
                                        <Input
                                            password
                                            name='password'
                                            value={values.password}
                                            onChange={handleChange}

                                        />
                                        <Button type='submit' colorScheme='primary' width='full' isLoading={isSubmitting}>Anmelden</Button>
                                        <Link to='../forgot-password' style={{ width: '100%' }}>
                                            <Flex justifyContent='flex-end' w='100%'>
                                                <Button variant='link'>Passwort vergessen?</Button>
                                            </Flex>
                                        </Link>
                                    </VStack>
                                </Form>
                            )}
                        </Formik>
                    </Box>
                </VStack>
            </Flex>

        </>
    )
}