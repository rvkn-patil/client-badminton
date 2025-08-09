import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// To use this code, first install the required dependencies:
// npm install @mui/material @emotion/react @emotion/styled luxon

// const API_BASE_URL = 'http://localhost:8080/api';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ... later in the component
const response = await fetch(`${API_BASE_URL}/venues`);

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
});

// A custom styled button for the time slots
const TimeSlotButton = styled(Button)(({ theme, isbooked, isselected }) => ({
  flexGrow: 1,
  margin: theme.spacing(0.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightBold,
  transition: 'all 0.2s ease-in-out',
  ...(isbooked && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: theme.palette.error.light,
    },
  }),
  ...(!isbooked && !isselected && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.success.contrastText,
      transform: 'scale(1.05)',
    },
  }),
  ...(isselected && {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
    '&:hover': {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.success.contrastText,
    },
  }),
}));

const App = () => {
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState({});
  const [selectedCourt, setSelectedCourt] = useState({});
  const [selectedDate, setSelectedDate] = useState(DateTime.local().toISODate());
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

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

  useEffect(() => {
    if (selectedVenue && selectedVenue._id) {
      fetchCourtsAndBookings();
    }
  }, [selectedVenue, selectedDate]);

  const fetchCourtsAndBookings = async () => {
    setLoading(true);
    try {
      const courtsResponse = await fetch(`${API_BASE_URL}/courts/${selectedVenue._id}`);
      const courtsData = await courtsResponse.json();
      setCourts(courtsData);

      const bookingsResponse = await fetch(`${API_BASE_URL}/bookings?venueId=${selectedVenue._id}&date=${selectedDate}`);
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage('Failed to load data. Please check the server.');
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
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: selectedVenue._id,
          courtId: selectedCourt._id,
          date: selectedDate,
          startTime: selectedTime,
          userId: 'mock_user_id',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Booking successful!');
        fetchCourtsAndBookings();
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

  const isSlotBooked = (courtId, startTime) => {
    const bookingStart = DateTime.fromISO(`${selectedDate}T${startTime}:00.000`);
    const bookingEnd = bookingStart.plus({ hours: 1 });

    return bookings.some(booking => {
      const existingStartTime = DateTime.fromISO(booking.startTime);
      const existingEndTime = DateTime.fromISO(booking.endTime);
      
      return booking.courtId === courtId &&
        bookingStart < existingEndTime && bookingEnd > existingStartTime;
    });
  };

  const timeSlots = [];
  for (let i = 6; i <= 22; i++) {
    timeSlots.push(DateTime.fromObject({ hour: i }).toFormat('hh:mm a'));
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f3f4f6, #e9d5ff)',
          p: 4,
        }}
      >
        <Dialog open={isMessageOpen} onClose={() => setIsMessageOpen(false)}>
          <DialogTitle>Notification</DialogTitle>
          <DialogContent>
            <Typography>{message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsMessageOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        
        <Container maxWidth="lg">
          <Paper elevation={12} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 6 }}>
            <Box textAlign="center" mb={4}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Badminton Court Booking
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Find and book your favorite court with ease.
              </Typography>
            </Box>

            {selectedVenue && selectedVenue._id && (<Box sx={{ p: 2, mb: 4, backgroundColor: 'primary.light', borderRadius: 4 }}>
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth style={{minWidth: '145px'}}>
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
              {loading && (
                <Box display="flex" justifyContent="center" py={5}>
                  <CircularProgress color="primary" />
                </Box>
              )}

              {!loading && courts.length > 0 && (
                <Grid container spacing={4}>
                  {courts.map(court => (
                    <Grid item xs={12} md={6} lg={4} key={court._id}>
                      <Paper elevation={4} sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                          {court.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {court.description}
                        </Typography>
                        
                        <Grid container spacing={1}>
                          {timeSlots.map(time => {
                            const isBooked = isSlotBooked(court._id, time);
                            const isSelected = selectedCourt && selectedCourt._id === court._id && selectedTime === time;
                            return (
                              <Grid item xs={4} key={time}>
                                <TimeSlotButton
                                  variant="contained"
                                  isbooked={isBooked.toString()}
                                  isselected={isSelected.toString()}
                                  onClick={() => {
                                    if (!isBooked) {
                                      setSelectedCourt(court);
                                      setSelectedTime(time);
                                    }
                                  }}
                                  disabled={isBooked}
                                >
                                  {time}
                                </TimeSlotButton>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {selectedCourt && (
              <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 6, mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                  Confirm Your Booking
                </Typography>
                <form onSubmit={handleBooking}>
                  <Grid container spacing={3} my={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="" value={selectedVenue.name} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Court" value={selectedCourt.name} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Date" value={selectedDate} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Time" value={selectedTime} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Duration" value="1 Hour" InputProps={{ readOnly: true }} />
                    </Grid>
                  </Grid>

                  <Box mt={3} display="flex" justifyContent="space-between">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ borderRadius: 6, px: 4, py: 1.5 }}
                      disabled={loading}
                    >
                      {loading ? 'Booking...' : 'Book Now'}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      color="primary"
                      sx={{ borderRadius: 6, px: 4, py: 1.5 }}
                      onClick={() => { setSelectedCourt({}); setSelectedTime(''); }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </form>
              </Paper>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;