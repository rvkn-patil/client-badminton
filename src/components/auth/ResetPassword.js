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
import { API_BASE_URL } from '../../api/api';

const ResetPassword = ({ setRoute }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setToken(params.get('token'));
    }, []);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!token) {
            setMessage('Invalid or missing password reset token.');
            setIsMessageOpen(true);
            return;
        }
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setIsMessageOpen(true);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Password reset successful! You can now log in with your new password.');
                setRoute('login');
            } else {
                setMessage(data.message || 'Failed to reset password. The token may be invalid or expired.');
            }
        } catch (error) {
            console.error('Reset password error:', error);
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
                    Reset Password
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                    Enter your new password below.
                </Typography>
                <Box component="form" onSubmit={handleResetPassword} noValidate>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="New Password"
                        type="password"
                        id="password"
                        autoFocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Reset Password'}
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

export default ResetPassword;