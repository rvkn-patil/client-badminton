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
    Chip,
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import MessageDialog from '../common/MessageDialog';
import useApi from '../../hooks/useApi';

// Define the available time slots for booking
const marks = [];
for (let i = 6; i <= 22; i++) {
    marks.push({ value: i, label: DateTime.fromObject({ hour: i }).toFormat('hh a') });
}

// Helper function to format time values for display
function valueText(value) {
    if (value) {
        return DateTime.fromObject({ hour: parseInt(value) }).toFormat('hh a');
    }
}

const UserDashboard = () => {
    // Context and state management
    const { token } = useContext(AuthContext);
    const [venues, setVenues] = useState([]);
    const [courts, setCourts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState('');
    const [selectedCourt, setSelectedCourt] = useState('');
    const [selectedDate, setSelectedDate] = useState(DateTime.local().toISODate());
    const [selectedTime, setSelectedTime] = useState(6);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);

    // useApi hooks for fetching data and making bookings.
    // The lazy option is used for all but the initial venue fetch to prevent immediate calls.
    const { data: venuesData, loading: venuesLoading, error: venuesError, get: getVenues } = useApi('/venues');
    const { data: courtsData, loading: courtsLoading, error: courtsError, get: getCourts } = useApi(null, { lazy: true });
    const { data: bookingsData, loading: bookingsLoading, error: bookingsError, get: getBookings } = useApi(null, { lazy: true });
    const { data: bookingResponse, loading: bookingLoading, error: bookingError, post: postBooking } = useApi('/bookings', { lazy: true });

    // Handles initial fetch of venues on component mount.
    // This effect runs only once.
    useEffect(() => {
        getVenues();
    }, [getVenues]);

    // Handle venues data, set initial selected venue.
    // This effect runs when venuesData is updated.
    useEffect(() => {
        if (venuesData && venuesData.data) {
            setVenues(venuesData.data);
            if (venuesData.data.length > 0) {
                setSelectedVenue(venuesData.data[0]._id);
            } else {
                setSelectedVenue('');
                setCourts([]);
                setBookings([]);
                setMessage('No venues found. Please check with the administrator.');
                setIsMessageOpen(true);
            }
        }
        if (venuesError) {
            setMessage(venuesError.message || 'Failed to fetch venues.');
            setIsMessageOpen(true);
        }
    }, [venuesData, venuesError]);

    // Handle fetching courts whenever selectedVenue changes.
    // This effect is specifically for user interaction.
    useEffect(() => {
        if (selectedVenue) {
            setIsFormVisible(false); // Hide form when venue changes
            getCourts(`/courts?venueId=${selectedVenue}`);
        } else {
            setCourts([]);
            setBookings([]);
        }
    }, [selectedVenue, getCourts]);

    // Handle courts data, set initial selected court.
    useEffect(() => {
        if (courtsData && courtsData.data) {
            setCourts(courtsData.data);
            if (courtsData.data.length > 0) {
                setSelectedCourt(courtsData.data[0]._id);
            } else {
                setSelectedCourt('');
                setBookings([]);
                setMessage('No courts available for this venue.');
                setIsMessageOpen(true);
            }
        }
        if (courtsError) {
            setMessage(courtsError.message || 'Failed to fetch courts.');
            setIsMessageOpen(true);
        }
    }, [courtsData, courtsError]);

    // A separate effect to handle when the user manually changes the date or court.
    useEffect(() => {
        if (selectedCourt && selectedDate) {
            setIsFormVisible(false); // Hide form when court or date changes
            getBookings(`/bookings?courtId=${selectedCourt}&date=${selectedDate}`);
        } else {
            setBookings([]);
        }
    }, [selectedCourt, selectedDate, getBookings]);

    // Handles the booking submission response
    useEffect(() => {
        if (bookingResponse) {
            setMessage(bookingResponse.message || 'Booking successful!');
            setIsMessageOpen(true);
            setIsFormVisible(false); // Hide form on success
            // Re-fetch bookings to update the UI
            if (selectedCourt && selectedDate) {
                getBookings(`/bookings?courtId=${selectedCourt}&date=${selectedDate}`);
            }
        }
        if (bookingError) {
            setMessage(bookingError.message || 'Booking failed. Please try again.');
            setIsMessageOpen(true);
        }
    }, [bookingResponse, bookingError, selectedCourt, selectedDate, getBookings]);

    // Handlers for UI interactions
    const handleVenueChange = (event) => {
        setSelectedVenue(event.target.value);
    };

    const handleCourtChange = (event) => {
        setSelectedCourt(event.target.value);
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleTimeClick = (value) => {
        setSelectedTime(value);
        setIsFormVisible(true);
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        const start = DateTime.fromISO(selectedDate).set({ hour: selectedTime, minute: 0 });
        const end = start.plus({ hours: 1 });
        postBooking({
            courtId: selectedCourt,
            startTime: start.toISO(),
            endTime: end.toISO(),
        });
    };

    // Helper to check if a time slot is booked
    const isSlotBooked = (hour) => {
        return bookings.some(booking => {
            const bookingStartHour = DateTime.fromISO(booking.startTime).hour;
            return bookingStartHour === hour;
        });
    };

    const availableSlots = marks.filter(mark => !isSlotBooked(mark.value));
    
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Container component="main" maxWidth="md">
                <Paper elevation={12} sx={{ p: 4, mt: 8 }}>
                    <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
                        Book a Court
                    </Typography>
                    
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth disabled={venuesLoading}>
                                <InputLabel id="venue-select-label">Venue</InputLabel>
                                <Select
                                    labelId="venue-select-label"
                                    id="venue-select"
                                    value={selectedVenue}
                                    label="Venue"
                                    onChange={handleVenueChange}
                                >
                                    {venues.length > 0 ? (
                                        venues.map((venue) => (
                                            <MenuItem key={venue._id} value={venue._id}>
                                                {venue.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>No venues found</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth disabled={courtsLoading || !selectedVenue}>
                                <InputLabel id="court-select-label">Court</InputLabel>
                                <Select
                                    labelId="court-select-label"
                                    id="court-select"
                                    value={selectedCourt}
                                    label="Court"
                                    onChange={handleCourtChange}
                                >
                                    {courts.length > 0 ? (
                                        courts.map((court) => (
                                            <MenuItem key={court._id} value={court._id}>
                                                {court.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>No courts available</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                id="booking-date"
                                label="Booking Date"
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                InputLabelProps={{ shrink: true }}
                                disabled={!selectedCourt}
                            />
                        </Grid>
                    </Grid>

                    <Paper elevation={6} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Available Times
                        </Typography>
                        {bookingsLoading || courtsLoading || venuesLoading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {availableSlots.length > 0 ? (
                                    availableSlots.map((mark) => (
                                        <Chip
                                            key={mark.value}
                                            label={mark.label}
                                            onClick={() => handleTimeClick(mark.value)}
                                            color={selectedTime === mark.value ? 'primary' : 'default'}
                                            clickable
                                        />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No available slots on this date.
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Paper>

                    {isFormVisible && (
                        <Paper elevation={6} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Booking Details
                            </Typography>
                            <form onSubmit={handleBookingSubmit}>
                                <Grid container spacing={2}>
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
                                        disabled={bookingLoading}
                                    >
                                        {bookingLoading ? <CircularProgress size={24} /> : 'Book Now'}
                                    </Button>
                                </Box>
                            </form>
                        </Paper>
                    )}
                </Paper>
            </Container>
            <MessageDialog
                open={isMessageOpen}
                handleClose={() => setIsMessageOpen(false)}
                title="Booking Status"
                message={message}
            />
        </Box>
    );
};

export default UserDashboard;