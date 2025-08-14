import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
    const { user, logout, role } = useContext(AuthContext);

    return (
        <AppBar position="static" color="primary" elevation={0} sx={{ borderBottom: 1, borderColor: 'grey.300' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    Court Booking
                </Typography>
                {user && (
                    <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                            Welcome, {role}!
                        </Typography>
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;