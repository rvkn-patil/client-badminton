import React, { useState, useEffect, useContext } from 'react';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Chip,
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import MessageDialog from '../common/MessageDialog';
import { API_BASE_URL } from '../../api/api';
import { Item } from '../../theme/theme';

const marks = [];
for (let i = 6; i <= 22; i++) {
    marks.push({ value: i, label: DateTime.fromObject({ hour: i }).toFormat('hh a') });
}

function valueText(value) {
    if (value) {
        return DateTime.fromObject({ hour: parseInt(value) }).toFormat('hh a');
    }
}

const UserDashboard = () => {
    const { token } = useContext(AuthContext);
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
                fetchCourtsAndBookings();
                setSelectedCourt(null);
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
        setSelectedCourt(null);
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

export default UserDashboard;