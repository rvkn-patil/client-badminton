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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import MessageDialog from '../common/MessageDialog';
import { API_BASE_URL } from '../../api/api';

const Register = ({ setRoute }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = role === 'user' ? '/auth/register/user' : '/auth/register/owner';
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Registration successful! Please log in.');
                setRoute('login');
            } else {
                setMessage(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setMessage('An error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
            setIsMessageOpen(true);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={12} sx={{ p: 4, mt: 8 }}>
                <Typography component="h1" variant="h5" align="center">
                    Sign Up
                </Typography>
                <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
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
                        <InputLabel id="role-select-label">Account Type</InputLabel>
                        <Select
                            labelId="role-select-label"
                            id="role-select"
                            value={role}
                            label="Account Type"
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="owner">Owner/Admin</MenuItem>
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
                            <Button onClick={() => setRoute('login')} variant="text">
                                {"Already have an account? Sign In"}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
            <MessageDialog
                open={isMessageOpen}
                handleClose={() => setIsMessageOpen(false)}
                title="Registration Status"
                message={message}
            />
        </Container>
    );
};

export default Register;