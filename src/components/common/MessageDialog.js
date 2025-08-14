import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

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

export default MessageDialog;

// Usage in other components:
// <MessageDialog
//   open={isMessageOpen}
//   handleClose={() => setIsMessageOpen(false)}
//   title="Registration Successful"
//   message="You have successfully registered!"
// />
// This component can be reused across different parts of the application to display messages to the user.