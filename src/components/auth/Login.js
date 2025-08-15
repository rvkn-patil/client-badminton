import React, { useState, useContext, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress,
    Grid,
    Link,
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import MessageDialog from '../common/MessageDialog';
import useApi from '../../hooks/useApi';

const Login = ({ setRoute }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const { login } = useContext(AuthContext);

    // useApi hook for handling the login POST request.
    const { data, loading, error, post } = useApi('/auth/login', { lazy: true });

    // useEffect to handle the response from the useApi hook.
    useEffect(() => {
        if (data) {
            login(data.user, data.token, data.user.role);
        }
        if (error) {
            setMessage(error.message || 'Login failed. Please check your credentials.');
            setIsMessageOpen(true);
        }
    }, [data, error, login]);

    const handleLogin = (e) => {
        e.preventDefault();
        // Log to confirm that the post function is being called from here.
        console.log('Attempting to log in with a POST request.');
        // Trigger the API call using the 'post' function.
        post({ email, password });
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
                        Sign In
                    </Typography>
                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
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
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link
                                    variant="body2"
                                    onClick={() => setRoute('forgot-password')}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link
                                    variant="body2"
                                    onClick={() => setRoute('register')}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
                <MessageDialog
                    open={isMessageOpen}
                    handleClose={handleCloseMessage}
                    title="Login Failed"
                    message={message}
                />
            </Box>
        </Container>
    );
};

export default Login;
