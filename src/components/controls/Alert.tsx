import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@chakra-ui/react';
import React from 'react';

type ApiAlertProps = {
    error: any
}

export const ApiAlert: React.FC<ApiAlertProps> = (props): JSX.Element => (
    <Alert
        status='error'
        variant='subtle'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        textAlign='center'
        height='200px'
    >
        <AlertIcon boxSize='40px' mr={0} />
        <AlertTitle mt={4} mb={1} fontSize='lg'>
            Fehler {props.error.status}
        </AlertTitle>
        <AlertDescription maxWidth='sm'>
            {props.error.data.message}
        </AlertDescription>
    </Alert>
)