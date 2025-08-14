import React, { useState, useEffect, createContext, useContext } from 'react';
import { DateTime } from 'luxon';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  CssBaseline,
  Link,
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { AccountCircle, CalendarToday, AccessTime } from '@mui/icons-material';

// To use this code, first install the required dependencies:
// npm install @mui/material @emotion/react @emotion/styled luxon @mui/icons-material

const API_BASE_URL = 'http://localhost:8080/api';

// Create a custom theme for a consistent look and feel
const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5', // Indigo
    },
    secondary: {
      main: '#8b5cf6', // Purple
    },
    success: {
      main: '#10b981', // Green
    },
    error: {
      main: '#ef4444', // Red
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '1.5rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '1.5rem',
        },
      },
    },
  },
});

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const marks = [];
for (let i = 6; i <= 22; i++) {
  marks.push({ value: i, label: DateTime.fromObject({ hour: i }).toFormat('hh a') });
}

function valueText(value) {
  if (value) {
    return DateTime.fromObject({ hour: parseInt(value) }).toFormat('hh a');
  }
}

// =========================================================================
// Context for Authentication State
// =========================================================================
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const login = (userData, userToken, userRole) => {
    setUser(userData);
    setToken(userToken);
    setRole(userRole);
    console.log("userData", userData);
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userToken);
    localStorage.setItem('role', userRole);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  useEffect(() => {
    if (!token) {
      setRole(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// =========================================================================
// Reusable Message Dialog Component
// =========================================================================
const MessageDialog = ({ open, handleClose, title, message }) => (
  <Dialog open={open} onClose={handleClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{message}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

// =========================================================================
// Login Component
// =========================================================================
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

// =========================================================================
// Forgot Password Component
// =========================================================================
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

// =========================================================================
// Reset Password Component
// =========================================================================
const ResetPassword = ({ setRoute }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [token, setToken] = useState(null);

  // Parse token from URL query parameters on component mount
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

// =========================================================================
// Register Component
// =========================================================================
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

// =========================================================================
// User Dashboard Component
// =========================================================================
const UserDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(DateTime.local().toISODate());
  const [selectedTime, setSelectedTime] = useState(6);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  // Fetch all venues on initial load
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/venues`);
        const data = await response.json();
        setVenues(data);
        if (data.length > 0) {
          setSelectedVenue(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch venues:', error);
        setMessage('Failed to load venues. Please check the server.');
        setIsMessageOpen(true);
      }
    };
    fetchVenues();
  }, []);

  // Fetch courts and bookings when venue or date changes
  useEffect(() => {
    if (selectedVenue) {
      fetchCourtsAndBookings();
    }
  }, [selectedVenue, selectedDate, token]);

  const fetchCourtsAndBookings = async () => {
    setLoading(true);
    try {
      const courtsResponse = await fetch(`${API_BASE_URL}/venues/${selectedVenue._id}/courts`);
      const courtsData = await courtsResponse.json();
      setCourts(courtsData);

      const bookingsResponse = await fetch(`${API_BASE_URL}/bookings?venueId=${selectedVenue._id}&date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage('Failed to load data. Please check the server or your authentication.');
      setIsMessageOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedVenue || !selectedCourt || !selectedDate || !selectedTime) {
      setMessage('Please select a venue, court, date, and time.');
      setIsMessageOpen(true);
      return;
    }

    setLoading(true);
    try {
      const formattedTime = DateTime.fromObject({ hour: selectedTime }).toFormat('HH:mm');
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          venueId: selectedVenue._id,
          courtId: selectedCourt._id,
          date: selectedDate,
          startTime: formattedTime,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Booking successful!');
        fetchCourtsAndBookings(); // Refresh data
        setSelectedCourt(null); // Deselect court
      } else {
        setMessage(data.message || 'Booking failed.');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      setMessage('Failed to create booking. Please check the server.');
    } finally {
      setIsMessageOpen(true);
      setLoading(false);
    }
  };

  const isSlotBooked = (courtId, hour) => {
    return bookings.some(booking => {
      const bookingStartHour = DateTime.fromJSDate(new Date(booking.startTime)).hour;
      return booking.courtId === courtId && bookingStartHour === hour;
    });
  };

  const handleSliderChange = (event, newValue) => {
    setSelectedTime(newValue);
    setSelectedCourt(null); // Clear selected court when time changes
  };

  const handleCourtClick = (courtId) => {
    if (selectedCourt && selectedCourt._id === courtId) {
      setSelectedCourt(null);
    } else {
      setSelectedCourt(courts.find(c => c._id === courtId));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f3f4f6, #e9d5ff)',
        p: { xs: 2, sm: 4 },
      }}
    >
      <MessageDialog
        open={isMessageOpen}
        handleClose={() => setIsMessageOpen(false)}
        title="Notification"
        message={message}
      />

      <Container maxWidth="lg">
        <Paper elevation={12} sx={{ p: { xs: 2, sm: 4 } }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              User Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Book a court at your favorite venue.
            </Typography>
          </Box>

          {selectedVenue && selectedVenue._id && (<Box sx={{ p: 2, mb: 4, backgroundColor: 'primary.light', borderRadius: 4 }}>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="venue-select-label">Select Venue</InputLabel>
                  <Select
                    labelId="venue-select-label"
                    id="venue-select"
                    value={selectedVenue ? selectedVenue._id : ''}
                    label="Select Venue"
                    onChange={(e) => setSelectedVenue(venues.find(v => v._id === e.target.value))}
                  >
                    {venues.map(venue => (
                      <MenuItem key={venue._id} value={venue._id}>
                        {venue.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="date-input"
                  label="Select Date"
                  type="date"
                  fullWidth
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Box>)}

          <Box mb={4}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Select Time:
              </Typography>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                **{valueText(selectedTime)}**
              </Typography>
              <Slider
                aria-label="Time"
                value={selectedTime}
                onChange={handleSliderChange}
                getAriaValueText={valueText}
                step={1}
                marks={marks}
                min={6}
                max={22}
                sx={{
                  '& .MuiSlider-track': {
                    height: '0px',
                    width: '100%'
                  },
                }}
              />
            </Item>
          </Box>

          <Box mb={4}>
            {loading && (
              <Box display="flex" justifyContent="center" py={5}>
                <CircularProgress color="primary" />
              </Box>
            )}

            {!loading && courts.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom align="center">
                  Available Courts for {valueText(selectedTime)}
                </Typography>
                <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                  {courts.map(court => (
                    <Grid item key={court._id}>
                      <Chip
                        label={court.name}
                        color={!isSlotBooked(court._id, selectedTime) ? (selectedCourt?._id === court._id ? "success" : "default") : "error"}
                        disabled={isSlotBooked(court._id, selectedTime)}
                        onClick={() => handleCourtClick(court._id)}
                        variant={isSlotBooked(court._id, selectedTime) ? "filled" : "outlined"}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>

          {selectedCourt && (
            <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, mt: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                Confirm Your Booking
              </Typography>
              <form onSubmit={handleBooking}>
                <Grid container spacing={3} my={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Venue" value={selectedVenue.name} InputProps={{ readOnly: true }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Court" value={selectedCourt.name} InputProps={{ readOnly: true }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Date" value={selectedDate} InputProps={{ readOnly: true }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Time" value={valueText(selectedTime)} InputProps={{ readOnly: true }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Duration" value="1 Hour" InputProps={{ readOnly: true }} />
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ px: 4, py: 1.5 }}
                    disabled={loading}
                  >
                    {loading ? 'Booking...' : 'Book Now'}
                  </Button>
                </Box>
              </form>
            </Paper>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

// =========================================================================
// Booking Card Component for Owner Dashboard
// =========================================================================
const BookingCard = ({ booking, statusColor }) => {
  const startDate = DateTime.fromISO(booking.startTime);
  const endDate = DateTime.fromISO(booking.endTime);

  const formattedDate = startDate.isValid ? startDate.toFormat('LLL dd, yyyy') : 'N/A';
  const formattedStartTime = startDate.isValid ? startDate.toFormat('hh:mm a') : 'N/A';
  const formattedEndTime = endDate.isValid ? endDate.toFormat('hh:mm a') : 'N/A';
  const formattedTimeRange = `${formattedStartTime} - ${formattedEndTime}`;

  return (
    <Card elevation={6} sx={{ borderRadius: '1rem', mb: 2, width: '100%' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: statusColor,
              display: 'inline-block',
              mr: 1
            }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {booking.courtName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={10}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center">
                  <AccountCircle fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Booked by: {booking?.bookedBy || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center">
                  <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Date: {formattedDate}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center">
                  <AccessTime fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Time: {formattedTimeRange}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// =========================================================================
// Owner Dashboard Component
// =========================================================================
const OwnerDashboard = () => {
  const { token, user, role } = useContext(AuthContext);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(DateTime.local().toISODate());
  const [allBookings, setAllBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [activeBookings, setActiveBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [expiredBookings, setExpiredBookings] = useState([]);

  // Dialog states for creating venue/court/admin
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false);
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtDescription, setNewCourtDescription] = useState('');
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Fetch venues managed by the owner
  const fetchOwnerVenues = async () => {
    if (!user || !user.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/venues`);
      const allVenues = await response.json();
      const ownerVenues = allVenues.filter(venue => role == 'admin' ? venue.adminIds.includes(user.id) : venue.ownerIds.includes(user.id));
      setVenues(ownerVenues);
      if (ownerVenues.length > 0 && !selectedVenue) {
        setSelectedVenue(ownerVenues[0]);
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      setMessage('Failed to load your venues. Please check the server.');
      setIsMessageOpen(true);
    }
  };

  const fetchCourtsAndBookings = async () => {
    if (!selectedVenue) return;
    setLoading(true);
    try {
      // Fetch all courts for the selected venue
      const courtsResponse = await fetch(`${API_BASE_URL}/venues/${selectedVenue._id}/courts`);
      const courtsData = await courtsResponse.json();
      setCourts(courtsData);

      // Fetch bookings for the selected venue and date
      const bookingsResponse = await fetch(`${API_BASE_URL}/bookings?venueId=${selectedVenue._id}&date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsResponse.json();

      // // Enrich bookings with court names and consistent time format
      // const enrichedBookings = bookingsData.map(booking => {
      //   const court = courtsData.find(c => c._id === booking.courtId);
      //   // Assuming the backend returns date and time in local time,
      //   // we parse it as local and store as UTC for consistent comparison.
      //   const bookingStartLocal = DateTime.fromISO(`${booking.date}T${booking.startTime}`, { zone: 'local' });
      //   const bookingStartUTC = bookingStartLocal.toUTC();
      //   const bookingEndUTC = bookingStartUTC.plus({ hours: 1 });

      //   return {
      //     ...booking,
      //     courtName: court ? court.name : 'Unknown Court',
      //     startTime: bookingStartUTC.toISO(),
      //     endTime: bookingEndUTC.toISO(),
      //   };
      // });
      // setAllBookings(enrichedBookings);
      setAllBookings(bookingsData);

    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage('Failed to load data. Please check the server or your authentication.');
      setIsMessageOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch owner venues on component mount and user change
  useEffect(() => {
    if (user && user.id) {
      fetchOwnerVenues();
    }
  }, [user]);

  // Effect to fetch courts and all bookings when selected venue or date changes
  useEffect(() => {
    if (selectedVenue) {
      fetchCourtsAndBookings();
    }
  }, [selectedVenue, selectedDate, token]);

  // Effect to categorize bookings whenever allBookings changes
  useEffect(() => {
    if (allBookings.length > 0) {
      // Get the current time in UTC for consistent comparison
      const now = DateTime.utc();
      const active = [];
      const upcoming = [];
      const expired = [];

      allBookings.forEach(booking => {
        const bookingStart = DateTime.fromISO(booking.startTime);
        const bookingEnd = DateTime.fromISO(booking.endTime);

        if (now >= bookingStart && now < bookingEnd) {
          active.push(booking);
        } else if (now < bookingStart) {
          upcoming.push(booking);
        } else {
          expired.push(booking);
        }
      });
      setActiveBookings(active);
      setUpcomingBookings(upcoming);
      setExpiredBookings(expired);
    }
  }, [allBookings]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  const handleAddVenue = async () => {
    if (!newVenueName || !newVenueAddress) {
      setMessage('Venue name and address are required.');
      setIsMessageOpen(true);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/venues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newVenueName, address: newVenueAddress, ownerIds: [user.id] }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Venue added successfully!');
        fetchOwnerVenues();
        setIsAddVenueOpen(false);
        setNewVenueName('');
        setNewVenueAddress('');
      } else {
        setMessage(data.message || 'Failed to add venue.');
      }
    } catch (error) {
      console.error('Failed to add venue:', error);
      setMessage('Failed to add venue. Please check the server.');
    } finally {
      setLoading(false);
      setIsMessageOpen(true);
    }
  };

  const handleAddCourt = async () => {
    if (!selectedVenue || !newCourtName || !newCourtDescription) {
      setMessage('Please select a venue and provide a court name and description.');
      setIsMessageOpen(true);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/venues/${selectedVenue._id}/courts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCourtName, description: newCourtDescription }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Court added successfully!');
        fetchCourtsAndBookings();
        setIsAddCourtOpen(false);
        setNewCourtName('');
        setNewCourtDescription('');
      } else {
        setMessage(data.message || 'Failed to add court.');
      }
    } catch (error) {
      console.error('Failed to add court:', error);
      setMessage('Failed to add court. Please check the server.');
    } finally {
      setLoading(false);
      setIsMessageOpen(true);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedVenue || !adminName || !adminEmail || !adminPassword) {
      setMessage('All admin fields must be filled out.');
      setIsMessageOpen(true);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/venues/${selectedVenue._id}/add-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: adminName, email: adminEmail, password: adminPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`Admin ${adminName} added to venue successfully!`);
        fetchOwnerVenues();
        setIsAddAdminOpen(false);
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
      } else {
        setMessage(data.message || 'Failed to add admin.');
      }
    } catch (error) {
      console.error('Failed to add admin:', error);
      setMessage('Failed to add admin. Please check the server.');
    } finally {
      setLoading(false);
      setIsMessageOpen(true);
    }
  };


  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f3f4f6, #e9d5ff)',
        p: { xs: 2, sm: 4 },
      }}
    >
      <MessageDialog
        open={isMessageOpen}
        handleClose={() => setIsMessageOpen(false)}
        title="Notification"
        message={message}
      />
      <Container maxWidth="lg">
        <Paper elevation={12} sx={{ p: { xs: 2, sm: 4 } }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Owner Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage your venues, courts, and bookings.
            </Typography>
          </Box>

          <Box sx={{ p: 2, mb: 4, backgroundColor: 'primary.light', borderRadius: 4 }}>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="venue-select-label">Select Venue</InputLabel>
                  <Select
                    labelId="venue-select-label"
                    id="venue-select"
                    value={selectedVenue ? selectedVenue._id : ''}
                    label="Select Venue"
                    onChange={(e) => setSelectedVenue(venues.find(v => v._id === e.target.value))}
                  >
                    {venues.map(venue => (
                      <MenuItem key={venue._id} value={venue._id}>
                        {venue.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  id="date-input"
                  label="Select Date"
                  type="date"
                  fullWidth
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              {role === 'owner' && (
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ py: 1.5 }}
                    onClick={() => setIsAddVenueOpen(true)}
                  >
                    Add New Venue
                  </Button>
                </Grid>
              )}
              {selectedVenue && (
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ py: 1.5 }}
                    onClick={() => setIsAddCourtOpen(true)}
                  >
                    Add New Court
                  </Button>
                </Grid>
              )}
              {role === 'owner' && selectedVenue && (
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    fullWidth
                    sx={{ py: 1.5 }}
                    onClick={() => setIsAddAdminOpen(true)}
                  >
                    Add New Admin
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>

          <Paper sx={{ mb: 4 }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label={`Upcoming (${upcomingBookings.length})`} />
              <Tab label={`Active (${activeBookings.length})`} />
              <Tab label={`Expired (${expiredBookings.length})`} />
            </Tabs>
          </Paper>

          {loading && (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress color="primary" />
            </Box>
          )}

          {!loading && (
            <>
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  {upcomingBookings.map(booking => (
                    <Grid item xs={12} key={booking._id}>
                      <BookingCard booking={booking} statusColor={theme.palette.primary.main} />
                    </Grid>
                  ))}
                  {upcomingBookings.length === 0 && <Typography align="center" variant="subtitle1">No upcoming bookings.</Typography>}
                </Grid>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  {activeBookings.map(booking => (
                    <Grid item xs={12} key={booking._id}>
                      <BookingCard booking={booking} statusColor={theme.palette.success.main} />
                    </Grid>
                  ))}
                  {activeBookings.length === 0 && <Typography align="center" variant="subtitle1">No active bookings.</Typography>}
                </Grid>
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={2}>
                  {expiredBookings.map(booking => (
                    <Grid item xs={12} key={booking._id}>
                      <BookingCard booking={booking} statusColor={theme.palette.error.main} />
                    </Grid>
                  ))}
                  {expiredBookings.length === 0 && <Typography align="center" variant="subtitle1">No expired bookings.</Typography>}
                </Grid>
              </TabPanel>
            </>
          )}

          {/* Add Venue Dialog */}
          <Dialog open={isAddVenueOpen} onClose={() => setIsAddVenueOpen(false)}>
            <DialogTitle>Add New Venue</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Venue Name"
                type="text"
                fullWidth
                variant="standard"
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
              />
              <TextField
                margin="dense"
                id="address"
                label="Address"
                type="text"
                fullWidth
                variant="standard"
                value={newVenueAddress}
                onChange={(e) => setNewVenueAddress(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsAddVenueOpen(false)}>Cancel</Button>
              <Button onClick={handleAddVenue}>Add</Button>
            </DialogActions>
          </Dialog>

          {/* Add Court Dialog */}
          <Dialog open={isAddCourtOpen} onClose={() => setIsAddCourtOpen(false)}>
            <DialogTitle>Add New Court to {selectedVenue?.name}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="courtName"
                label="Court Name"
                type="text"
                fullWidth
                variant="standard"
                value={newCourtName}
                onChange={(e) => setNewCourtName(e.target.value)}
              />
              <TextField
                margin="dense"
                id="courtDescription"
                label="Court Description"
                type="text"
                fullWidth
                variant="standard"
                value={newCourtDescription}
                onChange={(e) => setNewCourtDescription(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsAddCourtOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCourt}>Add</Button>
            </DialogActions>
          </Dialog>

          {/* Add Admin Dialog */}
          <Dialog open={isAddAdminOpen} onClose={() => setIsAddAdminOpen(false)}>
            <DialogTitle>Add New Admin to {selectedVenue?.name}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="adminName"
                label="Admin Name"
                type="text"
                fullWidth
                variant="standard"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
              <TextField
                margin="dense"
                id="adminEmail"
                label="Admin Email"
                type="email"
                fullWidth
                variant="standard"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <TextField
                margin="dense"
                id="adminPassword"
                label="Admin Password"
                type="password"
                fullWidth
                variant="standard"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsAddAdminOpen(false)}>Cancel</Button>
              <Button onClick={handleAddAdmin}>Add</Button>
            </DialogActions>
          </Dialog>

        </Paper>
      </Container>
    </Box>
  );
};

const MainApp = () => {
  const [route, setRoute] = useState('login');
  const { user, logout, role } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      if (user.role === 'owner' || user.role === 'admin') {
        setRoute('owner-dashboard');
      } else if (user.role === 'user') {
        setRoute('user-dashboard');
      }
    } else {
      setRoute('login');
    }
  }, [user]);

  const renderContent = () => {
    switch (route) {
      case 'login':
        return <Login setRoute={setRoute} />;
      case 'register':
        return <Register setRoute={setRoute} />;
      case 'forgot-password':
        return <ForgotPassword setRoute={setRoute} />;
      case 'reset-password':
        return <ResetPassword setRoute={setRoute} />;
      case 'user-dashboard':
        return <UserDashboard />;
      case 'owner-dashboard':
        return <OwnerDashboard />;
      default:
        return <Login setRoute={setRoute} />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
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
              <Button color="inherit" onClick={() => { logout(); setRoute('login') }}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 3, p: { xs: 1, md: 3 } }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;