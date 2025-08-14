import React, { useState, useContext } from 'react';
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
import { API_BASE_URL } from '../../api/api';

const Login = ({ setRoute }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                login(data.user, data.token, data.user.role);
            } else {
                setMessage(data.message || 'Login failed. Please check your credentials.');
                setIsMessageOpen(true);
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage('An error occurred during login. Please try again.');
            setIsMessageOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={12} sx={{ p: 4, mt: 8 }}>
                <Typography component="h1" variant="h5" align="center">
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
                    <Grid container justifyContent="space-between">
                        <Grid item>
                            <Link onClick={() => setRoute('forgot-password')} variant="body2" sx={{ cursor: 'pointer' }}>
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link onClick={() => setRoute('register')} variant="body2" sx={{ cursor: 'pointer' }}>
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
            <MessageDialog
                open={isMessageOpen}
                handleClose={() => setIsMessageOpen(false)}
                title="Login Error"
                message={message}
            />
        </Container>
    );
};

export default Login;