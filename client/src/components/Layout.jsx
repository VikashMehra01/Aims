import React from 'react';
import Navbar from './Navbar';
import { Box, Container, Fade } from '@mui/material';

const Layout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
            <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
                <Fade in={true} timeout={500}>
                    <Box>
                        {children}
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default Layout;
