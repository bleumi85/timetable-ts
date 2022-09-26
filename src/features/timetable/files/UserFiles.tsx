import { Box, Button, Heading, HStack } from '@chakra-ui/react';
import axios from 'axios';
import { User } from 'features/types';
import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import { Link, useParams } from 'react-router-dom';

const convertBlobToBase64 = (blob: Blob): Promise<any> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
})

export const UserFiles: React.FC<{ authUser: User | undefined }> = (props): JSX.Element => {
    const { authUser } = props;
    const { id } = useParams();

    const [pdfString, setPdfString] = useState<unknown>('');
    const [numPages, setNumPages] = useState(null);
    const [contentDisposition, setContentDisposition] = useState('');

    const onDocumentLoadSuccess = ({ numPages }: { numPages: any }) => {
        setNumPages(numPages);
    }

    useEffect(() => {
        const fetchAndProcess = async () => {
            const url = process.env.REACT_APP_API_URL + `/files/${id}`;

            let response = await axios.get(url, {
                headers: {
                    'authorization': `Bearer ${authUser?.jwtToken}`
                },
                responseType: 'blob'
            });

            const contentType = response.headers['content-type'];
            const blob = new Blob(
                [response.data],
                { type: contentType }
            );

            let base64String: any = await convertBlobToBase64(blob);
            setContentDisposition(response.headers['content-disposition']);
            setPdfString(base64String);
        }

        fetchAndProcess()
            .catch(console.error)
    }, [authUser?.jwtToken, id]);

    console.log(contentDisposition)

    return (
        <Box w='100%' p={4}>
            {contentDisposition !== '' && <Heading mb={4} size='md'>{contentDisposition.split('-')[1].split('.')[0].replaceAll('_', ' ')}</Heading>}
            <Document
                file={pdfString}
                onLoadSuccess={onDocumentLoadSuccess}
            >
                <HStack spacing={6} alignItems='flex-start'>
                    {Array.apply(null, Array(numPages))
                        .map((x, i) => i + 1)
                        .map(page =>
                            <Page key={page} pageNumber={page} height={600} />
                        )}
                    <Link to='/schedules'>
                        <Button colorScheme={'danger'}>Abbrechen</Button>
                    </Link>
                </HStack>
            </Document>

        </Box>
    );
}
