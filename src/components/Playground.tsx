import { Box, Button, Heading } from '@chakra-ui/react';
import { timetableAPI } from 'features/endpoints';
import { getErrorMessage } from 'features/timetable';
import React from 'react';

export const Playground: React.FC = (): JSX.Element => {
    var myBlob = new Blob(["This is my blob content"], { type: "text/plain" });

    var fd = new FormData();
    fd.append('upl', myBlob, 'blobby.txt');

    const onSubmit = async () => {
        try {
            await timetableAPI.post('/uploads', fd);
        } catch (err) {
            const errMsg = getErrorMessage(err);
            console.log(errMsg)
        }
    }

    return (
        <Box border='3px solid tomato' p={4} w={'100%'}>
            <Heading mb={4}>Spielwiese</Heading>
            <Button colorScheme={'primary'} onClick={onSubmit}>
                Klick
            </Button>
        </Box>
    )
}
