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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { AuthContext } from '../../context/AuthContext';
import MessageDialog from '../common/MessageDialog';
import BookingCard from '../common/BookingCard';
import TabPanel from '../common/TabPanel';
import { theme } from '../../theme/theme';
import useApi from '../../hooks/useApi';

const OwnerDashboard = () => {
    // Context and state management
    const { user } = useContext(AuthContext);
    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState('');
    const [selectedDate, setSelectedDate] = useState(DateTime.local().toISODate());
    const [allBookings, setAllBookings] = useState([]);
    const [tabValue, setTabValue] = useState(0);

    const [activeBookings, setActiveBookings] = useState([]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [pastBookings, setPastBookings] = useState([]);

    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);

    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // useApi hooks for fetching data
    const { data: venuesData, loading: venuesLoading, error: venuesError, get: getVenues } = useApi('/venues');
    const { data: bookingsData, loading: bookingsLoading, error: bookingsError, get: getBookings } = useApi(null, { lazy: true });
    const { data: adminData, loading: adminLoading, error: adminError, post: addAdminPost } = useApi('/auth/register/owner', { lazy: true });

    // Handles the initial fetch of venues on component mount.
    // This effect runs only once.
    useEffect(() => {
        getVenues();
    }, [getVenues]);

    // Handles the venues data once it's fetched and sets the initial state.
    // This effect runs when venuesData is updated.
    useEffect(() => {
        if (venuesData && venuesData.data) {
            setVenues(venuesData.data);
            if (venuesData.data.length > 0) {
                // Set the first venue as the default selected venue
                setSelectedVenue(venuesData.data[0]._id);
            } else {
                setSelectedVenue('');
                setAllBookings([]);
                setMessage('No venues found. Please add a venue.');
                setIsMessageOpen(true);
            }
        }
        if (venuesError) {
            setMessage(venuesError.message || 'Failed to fetch venues.');
            setIsMessageOpen(true);
        }
    }, [venuesData, venuesError]);

    // Handles fetching bookings whenever selectedVenue or selectedDate changes.
    // This effect is specifically for user interaction and prevents recursive calls.
    useEffect(() => {
        if (selectedVenue && selectedDate) {
            getBookings(`/bookings?venueId=${selectedVenue}&date=${selectedDate}`);
        } else {
            setAllBookings([]);
        }
    }, [selectedVenue, selectedDate, getBookings]);

    // Handles bookings data once it's fetched.
    useEffect(() => {
        if (bookingsData && bookingsData.data) {
            setAllBookings(bookingsData.data);
        }
        if (bookingsError) {
            setMessage(bookingsError.message || 'Failed to fetch bookings.');
            setIsMessageOpen(true);
        }
    }, [bookingsData, bookingsError]);

    // Handles the add admin form submission response.
    useEffect(() => {
        if (adminData) {
            setMessage('Admin account created successfully!');
            setIsMessageOpen(true);
            setIsAddAdminOpen(false);
            setAdminName('');
            setAdminEmail('');
            setAdminPassword('');
        }
        if (adminError) {
            setMessage(adminError.message || 'Failed to add admin.');
            setIsMessageOpen(true);
        }
    }, [adminData, adminError]);

    // Filter bookings into active, upcoming, and past.
    // This runs whenever `allBookings` is updated.
    useEffect(() => {
        const now = DateTime.local();
        const active = [];
        const upcoming = [];
        const past = [];

        allBookings.forEach(booking => {
            const startTime = DateTime.fromISO(booking.startTime);
            const endTime = DateTime.fromISO(booking.endTime);

            if (startTime <= now && endTime >= now) {
                active.push(booking);
            } else if (startTime > now) {
                upcoming.push(booking);
            } else {
                past.push(booking);
            }
        });

        setActiveBookings(active);
        setUpcomingBookings(upcoming);
        setPastBookings(past);
    }, [allBookings]);

    // Handlers for UI interactions
    const handleVenueChange = (event) => {
        setSelectedVenue(event.target.value);
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleAddAdmin = () => {
        if (adminName && adminEmail && adminPassword) {
            addAdminPost({ name: adminName, email: adminEmail, password: adminPassword });
        } else {
            setMessage('Please fill out all fields.');
            setIsMessageOpen(true);
        }
    };

    const handleCloseMessage = () => {
        setIsMessageOpen(false);
    };

    const handleCloseAddAdmin = () => {
        setIsAddAdminOpen(false);
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Container component="main" maxWidth="md">
                <Paper elevation={12} sx={{ p: 4, mt: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Owner Dashboard
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            onClick={() => setIsAddAdminOpen(true)}
                        >
                            Add Admin
                        </Button>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="venue-select-label">Venue</InputLabel>
                                <Select
                                    labelId="venue-select-label"
                                    id="venue-select"
                                    value={selectedVenue}
                                    label="Venue"
                                    onChange={handleVenueChange}
                                    disabled={venuesLoading}
                                >
                                    {venues.length > 0 ? (
                                        venues.map(venue => (
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
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="booking-date"
                                label="Booking Date"
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
                            <Tab label="Bookings" />
                            <Tab label="Add Court" />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        {bookingsLoading || venuesLoading ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>Active Bookings ({activeBookings.length})</Typography>
                                {activeBookings.length > 0 ? (
                                    activeBookings.map(booking => (
                                        <BookingCard key={booking._id} booking={booking} statusColor={theme.palette.success.main} />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No active bookings.</Typography>
                                )}

                                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Upcoming Bookings ({upcomingBookings.length})</Typography>
                                {upcomingBookings.length > 0 ? (
                                    upcomingBookings.map(booking => (
                                        <BookingCard key={booking._id} booking={booking} statusColor={theme.palette.primary.main} />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No upcoming bookings.</Typography>
                                )}

                                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Past Bookings ({pastBookings.length})</Typography>
                                {pastBookings.length > 0 ? (
                                    pastBookings.map(booking => (
                                        <BookingCard key={booking._id} booking={booking} statusColor={theme.palette.error.main} />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No past bookings.</Typography>
                                )}
                            </Box>
                        )}
                    </TabPanel>

                    {/* Placeholder for "Add Court" tab content */}
                    <TabPanel value={tabValue} index={1}>
                        <Typography>Content for adding a new court will go here.</Typography>
                    </TabPanel>

                    {/* Dialog for adding a new admin */}
                    <Dialog open={isAddAdminOpen} onClose={handleCloseAddAdmin}>
                        <DialogTitle>Add New Admin</DialogTitle>
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
                            <Button onClick={handleCloseAddAdmin}>Cancel</Button>
                            <Button onClick={handleAddAdmin} disabled={adminLoading}>
                                {adminLoading ? <CircularProgress size={24} /> : 'Add'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <MessageDialog
                        open={isMessageOpen}
                        handleClose={handleCloseMessage}
                        title="Dashboard Message"
                        message={message}
                    />
                </Paper>
            </Container>
        </Box>
    );
};

export default OwnerDashboard;