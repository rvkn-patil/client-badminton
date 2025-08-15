import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Link,
} from '@mui/material';
import MessageDialog from '../common/MessageDialog';
import useApi from '../../hooks/useApi';

const Register = ({ setRoute }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);

    // useApi hook for handling the registration POST request.
    const { data, loading, error, post } = useApi(
        role === 'user' ? '/auth/register/user' : '/auth/register/owner',
        { lazy: true }
    );

    // useEffect to handle the response from the useApi hook.
    useEffect(() => {
        if (data) {
            setMessage('Registration successful! Please log in.');
            setIsMessageOpen(true);
            setRoute('login');
        }
        if (error) {
            setMessage(error.message || 'Registration failed. Please try again.');
            setIsMessageOpen(true);
        }
    }, [data, error, setRoute]);

    const handleRegister = (e) => {
        e.preventDefault();
        // The API endpoint is determined by the `role` state, which is handled by the `useApi` hook.
        // Trigger the API call using the 'post' function.
        post({ name, email, password });
    };

    const handleCloseMessage = () => {
        setIsMessageOpen(false);
        setMessage('');
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                        Sign Up
                    </Typography>
                    <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Full Name"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="role-select-label">Role</InputLabel>
                            <Select
                                labelId="role-select-label"
                                id="role-select"
                                value={role}
                                label="Role"
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <MenuItem value="user">User</MenuItem>
                                <MenuItem value="owner">Owner</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link
                                    variant="body2"
                                    onClick={() => setRoute('login')}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    Already have an account? Sign In
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
                <MessageDialog
                    open={isMessageOpen}
                    handleClose={handleCloseMessage}
                    title="Registration Status"
                    message={message}
                />
            </Box>
        </Container>
    );
};

export default Register;
