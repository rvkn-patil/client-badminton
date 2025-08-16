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
// import useApi from '../../hooks/useApi';
import { loginUser } from '../../api/apiService'; // Importing the login function from the API service

const Login = ({ setRoute }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const { login } = useContext(AuthContext);
    
    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        
        try {
            // Use the centralized loginUser function from the API service
            const data = await loginUser(email, password);
            login(data.user, data.token, data.user.role);
            // On successful login, AuthContext will handle navigation
        } catch (error) {
            setIsMessageOpen(true);
            // The error message is now directly from the API service
            setMessage(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
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
