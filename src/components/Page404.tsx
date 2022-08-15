import { Button, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { history } from 'helpers';
import React from 'react';
import { Link } from 'react-router-dom';

export const Page404: React.FC = (): JSX.Element => {


    return (
        <Container maxW='container.2xl' height='100vh' color='primary.500' display='flex' justifyContent='center' alignItems='center'>
            <Stack direction='column' maxW='container.sm' spacing={4}>
                <Heading size='4xl'>Hmmm.</Heading>
                <Text fontSize='2xl'>Sieht so aus als wärst du hier komplett falsch. Lass mich dir helfen zurück zu kommen.</Text>
                <Stack direction='row' spacing={4}>
                    <Button variant='outline' colorScheme='primary' _hover={{ bg: 'primary.500', color: 'white' }} borderRadius={0} onClick={() => history.navigate && history.navigate(-3)}>Zurück</Button>
                    <Link to='/'>
                        <Button variant='outline' colorScheme='primary' _hover={{ bg: 'primary.500', color: 'white' }} borderRadius={0}>Startseite</Button>
                    </Link>
                </Stack>
            </Stack>
        </Container>
    )
}