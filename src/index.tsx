import { ChakraProvider, extendTheme, theme as baseTheme } from '@chakra-ui/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const theme = extendTheme({
    colors: {
        primary: baseTheme.colors.blue,
        secondary: baseTheme.colors.purple
    },
    styles: {
        global: {
            body: {
                bg: '#f4f5fd'
            }
        }
    }
})

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);

root.render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ChakraProvider>
    </React.StrictMode>
)