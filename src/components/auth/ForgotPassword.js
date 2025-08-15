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
    Link,
} from '@mui/material';
import MessageDialog from '../common/MessageDialog';
import useApi from '../../hooks/useApi';

const ForgotPassword = ({ setRoute }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // useApi hook for handling the forgot password POST request.
    const { data, loading, error, post } = useApi('/auth/forgot-password', { lazy: true });

    // useEffect to handle the response from the useApi hook.
    // It runs when 'data' or 'error' changes.
    useEffect(() => {
        if (data) {
            setMessage(data.message || 'If an account with that email exists, a password reset link has been sent.');
            setIsMessageOpen(true);
        }
        if (error) {
            setMessage(error.message || 'Failed to send password reset email. Please try again.');
            setIsMessageOpen(true);
        }
    }, [data, error]);

    const handleForgotPassword = (e) => {
        e.preventDefault();
        // Trigger the API call using the 'post' function from the useApi hook.
        post({ email });
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
                        Forgot Password
                    </Typography>
                    <Box component="form" onSubmit={handleForgotPassword} noValidate sx={{ mt: 1 }}>
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link
                                    variant="body2"
                                    onClick={() => setRoute('login')}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    Remember your password? Login
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
                <MessageDialog
                    open={isMessageOpen}
                    handleClose={handleCloseMessage}
                    title="Forgot Password"
                    message={message}
                />
            </Box>
        </Container>
    );
};

export default ForgotPassword;