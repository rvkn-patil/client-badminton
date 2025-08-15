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

const ResetPassword = ({ setRoute }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [token, setToken] = useState(null);

    const { data, loading, error, post } = useApi('/auth/reset-password', { lazy: true });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setToken(params.get('token'));
    }, []);

    const handleResetPassword = (e) => {
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

        post({ token, newPassword: password });
    };

    useEffect(() => {
        if (data) {
            setMessage('Password reset successful! You can now log in with your new password.');
            setRoute('login');
        }
        if (error) {
            setMessage(error.message || 'Failed to reset password. The token may be invalid or expired.');
        }
        if (data || error) {
            setIsMessageOpen(true);
        }
    }, [data, error, setRoute]);

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