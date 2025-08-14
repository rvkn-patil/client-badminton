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
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

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
    setUser({ role, id: userData.id });
    localStorage.setItem('user', JSON.stringify({role, id: userData.id }))
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
    // We now only check if a token exists. The `login` function is responsible
    // for setting the actual user object from the API response.
    // The initial `user` state will remain `null` until a successful login.
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
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button onClick={() => setRoute('register')} variant="text">
                {"Don't have an account? Sign Up"}
              </Button>
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
// Owner Dashboard Component
// =========================================================================
const OwnerDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(DateTime.local().toISODate());
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  // State for new venue form fields
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [newVenueTotalCourts, setNewVenueTotalCourts] = useState('');

  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false);
  // State for new court form fields
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtDescription, setNewCourtDescription] = useState('');

  // New state for adding admins
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Fetch venues managed by the owner
  const fetchOwnerVenues = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/venues`); // Fetch all venues
      const allVenues = await response.json();
      // In a real app, the backend would filter by owner ID. For this mock, we filter on the front end.
      const ownerVenues = allVenues.filter(venue => venue.ownerIds.includes(user.id));
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

  useEffect(() => {
    if (user && user.id) {
      fetchOwnerVenues();
    }
  }, [user]);

  // Fetch courts and bookings for the selected venue and date
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
      console.log("USER::::", user);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setMessage('Failed to fetch bookings. Please check the server.');
      setIsMessageOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVenue = async () => {
    if (!newVenueName || !newVenueAddress || !newVenueTotalCourts) {
      setMessage('All venue fields must be filled out.');
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
        // Include new fields in the request body
        body: JSON.stringify({
          name: newVenueName,
          address: newVenueAddress,
          ownerIds: [user.id]
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Venue added successfully!');
        fetchOwnerVenues(); // Refresh the list of venues
        setIsAddVenueOpen(false);
        // Reset form fields
        setNewVenueName('');
        setNewVenueAddress('');
        setNewVenueTotalCourts('');
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
        // Include new description field
        body: JSON.stringify({ name: newCourtName, description: newCourtDescription }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Court added successfully!');
        fetchCourtsAndBookings(); // Refresh the courts and bookings
        setIsAddCourtOpen(false);
        // Reset form fields
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
    if (!selectedVenue || !adminEmail || !adminName || !adminPassword) {
      setMessage('Please fill in all admin fields: name, email, and password.');
      setIsMessageOpen(true);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/${selectedVenue._id}/add-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: adminName, email: adminEmail, password: adminPassword }),
      });
      if (response.ok) {
        setMessage('Admin added successfully!');
        fetchOwnerVenues();
        setIsAddAdminOpen(false);
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
      } else {
        const data = await response.json();
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

  const isSlotBooked = (courtId, hour) => {
    return bookings.some(booking => {
      const bookingStartHour = DateTime.fromJSDate(new Date(booking.startTime)).hour;
      return booking.courtId === courtId && bookingStartHour === hour;
    });
  };

  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)',
        p: { xs: 2, sm: 4 },
      }}
    >
      <MessageDialog
        open={isMessageOpen}
        handleClose={() => setIsMessageOpen(false)}
        title="Notification"
        message={message}
      />

      {/* Add Venue Dialog with new fields */}
      <Dialog open={isAddVenueOpen} onClose={() => setIsAddVenueOpen(false)}>
        <DialogTitle>Add New Venue</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Venue Name"
            type="text"
            fullWidth
            value={newVenueName}
            onChange={(e) => setNewVenueName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Venue Address"
            type="text"
            fullWidth
            value={newVenueAddress}
            onChange={(e) => setNewVenueAddress(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddVenueOpen(false)}>Cancel</Button>
          <Button onClick={handleAddVenue} disabled={loading} variant="contained">
            {loading ? <CircularProgress size={24} /> : 'Add Venue'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Court Dialog with new fields */}
      <Dialog open={isAddCourtOpen} onClose={() => setIsAddCourtOpen(false)}>
        <DialogTitle>Add New Court to {selectedVenue?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Court Name"
            type="text"
            fullWidth
            value={newCourtName}
            onChange={(e) => setNewCourtName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newCourtDescription}
            onChange={(e) => setNewCourtDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddCourtOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCourt} disabled={loading} variant="contained">
            {loading ? <CircularProgress size={24} /> : 'Add Court'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Dialog for adding an admin */}
      <Dialog open={isAddAdminOpen} onClose={() => setIsAddAdminOpen(false)}>
        <DialogTitle>Add Admin to {selectedVenue?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddAdminOpen(false)}>Cancel</Button>
          <Button onClick={handleAddAdmin} disabled={loading} variant="contained">
            {loading ? <CircularProgress size={24} /> : 'Add Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="lg">
        <Paper elevation={12} sx={{ p: { xs: 2, sm: 4 } }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Owner/Admin Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage your venues and view bookings.
            </Typography>
          </Box>
          
          <Grid container spacing={2} justifyContent="center" mb={4}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Select Venue</InputLabel>
                <Select
                  value={selectedVenue ? selectedVenue._id : ''}
                  label="Select Venue"
                  onChange={(e) => setSelectedVenue(venues.find(v => v._id === e.target.value))}
                >
                  {venues.map(venue => (
                    <MenuItem key={venue._id} value={venue._id}>{venue.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Select Date"
                type="date"
                fullWidth
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {user?.role == 'owner' ?? <Grid item xs={12} md={4}>
                <Button variant="contained" startIcon={<AddIcon />} fullWidth onClick={() => setIsAddVenueOpen(true)}>
                    Add New Venue
                </Button>
            </Grid>}
            <Grid item xs={12} md={4}>
                <Button variant="contained" startIcon={<AddIcon />} fullWidth disabled={!selectedVenue} onClick={() => setIsAddCourtOpen(true)}>
                    Add New Court
                </Button>
            </Grid>
            {/* New Button to add an admin */}
            {user?.role == 'owner' ?? <Grid item xs={12} md={4}>
                <Button variant="contained" startIcon={<PersonAddIcon />} fullWidth disabled={!selectedVenue} onClick={() => setIsAddAdminOpen(true)}>
                    Add Admin
                </Button>
            </Grid>}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

// =========================================================================
// Main App Component with Routing
// =========================================================================
const App = () => {
  const [route, setRoute] = useState('login');
  const { user, role, logout } = useContext(AuthContext);

  useEffect(() => {
    // Redirect based on auth state on initial load
    if (user && role) {
      if (role === 'user') {
        setRoute('user-dashboard');
      } else if (role === 'owner' || role === 'admin') {
        setRoute('owner-dashboard');
      }
    } else {
      setRoute('login');
    }
  }, [user, role]);

  const renderContent = () => {
    if (!user) {
      // Not logged in
      switch (route) {
        case 'register':
          return <Register setRoute={setRoute} />;
        default:
          return <Login setRoute={setRoute} />;
      }
    } else {
      // Logged in, show dashboard based on role
      switch (role) {
        case 'user':
          return <UserDashboard />;
        case 'owner':
        case 'admin':
          return <OwnerDashboard />;
        default:
          return null;
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Court Booking App
          </Typography>
          {user ? (
            <Button color="inherit" onClick={logout}>Logout</Button>
          ) : (
            <Tabs value={route} onChange={(e, newValue) => setRoute(newValue)} textColor="inherit">
              <Tab label="Login" value="login" />
              <Tab label="Register" value="register" />
            </Tabs>
          )}
        </Toolbar>
      </AppBar>
      {renderContent()}
    </ThemeProvider>
  );
};

// =========================================================================
// Root Component with AuthProvider
// =========================================================================
const RootApp = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default RootApp;