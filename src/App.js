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
  Slider,
  Chip,
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
  marks.push({value: i, label: DateTime.fromObject({ hour: i }).toFormat('hh a')}); // { value: 22, label: '10 PM' }
}

function valueText(value) {
  if(value) {
    return DateTime.fromObject({ hour: parseInt(value) }).toFormat('hh a');
  }
}

const App = () => {
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState({});
  const [selectedCourt, setSelectedCourt] = useState({});
  const [selectedDate, setSelectedDate] = useState(DateTime.local().toISODate());
  // const [selectedTime, setSelectedTime] = useState('');
  const [selectedTime, setSelectedTime] = useState(6);
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
      const formattedTime = DateTime.fromObject({ hour: selectedTime }).toFormat('HH:mm');
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: selectedVenue._id,
          courtId: selectedCourt._id,
          date: selectedDate,
          // startTime: selectedTime,
          startTime: formattedTime,
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

  const isSlotBooked = (courtId, hour) => {
    return bookings.some(booking => {
      const bookingStartHour = DateTime.fromISO(booking.startTime).hour;
      return booking.courtId === courtId && bookingStartHour === hour;
    });
  };

  const handleSliderChange = (event, newValue) => {
    setSelectedTime(newValue);
    setSelectedCourt({}); // Clear selected court when time changes
  };

  const handleCourtClick = (courtId) => {
    setCourts(prevCourts =>
      prevCourts.map(court =>
        court._id === courtId
          ? { ...court, isSelected: !court.isSelected }
          : { ...court, isSelected: false } // Deselect others
      )
    );
    setSelectedCourt(courts.find(c => c._id === courtId));
  };

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
              <Item>
                <Typography variant="h6" gutterBottom>
                  Select Time:
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  **{valueText(selectedTime)}**
                </Typography>
                <Slider
                  aria-label="Time"
                  defaultValue={12}
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
                          color={!isSlotBooked(court._id, selectedTime) ? (court.isSelected ? "success" : "default") : "error"}
                          disabled={isSlotBooked(court._id, selectedTime)}
                          onClick={() => handleCourtClick(court._id)}
                          variant={isSlotBooked(court._id, selectedTime) ? "filled" : "outlined"}
                          sx={{
                            '&.MuiChip-colorSuccess': {
                              borderColor: 'success.main',
                              backgroundColor: 'success.light',
                              color: 'success.dark',
                            },
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
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
                      {/* <TextField fullWidth label="Time" value={selectedTime} InputProps={{ readOnly: true }} /> */}
                      <TextField fullWidth label="Time" value={valueText(selectedTime)} InputProps={{ readOnly: true }} />
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