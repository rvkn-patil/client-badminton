import React, { useState } from 'react';
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
import { API_BASE_URL } from '../../api/api';

const ForgotPassword = ({ setRoute }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message || 'If an account with that email exists, a password reset link has been sent.');
            } else {
                setMessage(data.message || 'Failed to send password reset email. Please try again.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
            setIsMessageOpen(true);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={12} sx={{ p: 4, mt: 8 }}>
                <Typography component="h1" variant="h5" align="center">
                    Forgot Password
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                    Enter your email address and we'll send you a link to reset your password.
                </Typography>
                <Box component="form" onSubmit={handleForgotPassword} noValidate>
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
                            <Link onClick={() => setRoute('login')} variant="body2" sx={{ cursor: 'pointer' }}>
                                {"Back to Sign In"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
            <MessageDialog
                open={isMessageOpen}
                handleClose={() => setIsMessageOpen(false)}
                title="Password Reset"
                message={message}
            />
        </Container>
    );
};

export default ForgotPassword;