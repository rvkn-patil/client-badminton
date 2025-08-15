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
import { API_BASE_URL } from '../../api/api';
import { theme } from '../../theme/theme';

const OwnerDashboard = () => {
    const { token, user, role } = useContext(AuthContext);
    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [selectedDate, setSelectedDate] = useState(DateTime.local().toISODate());
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const [activeBookings, setActiveBookings] = useState([]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [expiredBookings, setExpiredBookings] = useState([]);

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

    const fetchOwnerVenues = async () => {
        if (!user || !user.id) return;
        try {
            const response = await fetch(`${API_BASE_URL}/venues`);
            const allVenues = await response.json();
            const ownerVenues = allVenues.filter(venue => role === 'admin' ? venue.adminIds.includes(user.id) : venue.ownerIds.includes(user.id));
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
            const bookingsResponse = await fetch(`${API_BASE_URL}/bookings?venueId=${selectedVenue._id}&date=${selectedDate}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const bookingsData = await bookingsResponse.json();

            setAllBookings(bookingsData);

        } catch (error) {
            console.error('Failed to fetch data:', error);
            setMessage('Failed to load data. Please check the server or your authentication.');
            setIsMessageOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.id) {
            fetchOwnerVenues();
        }
    }, [user]);

    useEffect(() => {
        if (selectedVenue) {
            fetchCourtsAndBookings();
        }
    }, [selectedVenue, selectedDate, token]);

    useEffect(() => {
        const now = DateTime.utc();
        const active = [];
        const upcoming = [];
        const expired = [];

        if (allBookings.length > 0) {
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
        }
        setActiveBookings(active);
        setUpcomingBookings(upcoming);
        setExpiredBookings(expired);
    }, [allBookings]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

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

export default OwnerDashboard;