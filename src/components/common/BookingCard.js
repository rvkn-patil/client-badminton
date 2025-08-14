import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { AccountCircle, CalendarToday, AccessTime } from '@mui/icons-material';
import { DateTime } from 'luxon';

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

export default BookingCard;