import React, { useContext } from 'react';

import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/api';


// Custom hook to provide API functions with AuthContext
export const useServiceApi = () => {
    const { token, logout } = useContext(AuthContext);

    // Pre-bind token and logout to all API functions
    return {
        getVenues: () => getVenues(token, logout),
        getBookings: (venueId, date) => getBookings(venueId, date, token, logout),
        addVenue: (venueData) => addVenue(venueData, token, logout),
        addCourt: (venueId, courtData) => addCourt(venueId, courtData, token, logout),
        addAdmin: (venueId, adminData) => addAdmin(venueId, adminData, token, logout),
        // Expose raw makeApiRequest if needed
        makeApiRequest: (endpoint, method = 'GET', body = null) => makeApiRequest(endpoint, method, token, body, logout),
    };
};


/**
 * A CONSOLIDATED function to handle all API requests.
 * This is the central utility that encapsulates the core fetching logic,
 * headers, and error handling for all calls, regardless of the endpoint.
 * @param {string} endpoint The specific API endpoint (e.g., '/venues').
 * @param {string} method The HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {string} token The authentication token.
 * @param {object} body The request body for methods like POST or PUT.
 * @param {function} logout The logout function (optional, for handling 401 errors).
 * @returns {Promise<any>} The parsed JSON response data.
 * @throws {Error} An error with a user-friendly message if the request fails.
*/
export const makeApiRequest = async (endpoint, method = 'GET', token = null, body = null, logout = null) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            // Handle specific status codes
            if (response.status === 401) {
                // Log a specific message for authentication failures
                console.error("Authentication required. Please check your token or login status.");
                // Call the logout function to clear the session if provided
                if (typeof logout === 'function') {
                    logout();
                }
                // Throw an error to be caught by the calling function
                throw new Error("Authentication required. Please log in again.");
            }
            let errorData;
            try {
                // Attempt to parse the error message from the response body
                errorData = await response.json();
            } catch (e) {
                // If parsing fails, use a generic message based on the status
                throw new Error(`API Error: ${response.status} - ${response.statusText}.`);
            }
            // Throw a more specific error with the message from the API
            throw new Error(errorData.message || 'An unexpected error occurred.');
        }

        // Return the JSON data if the request was successful
        return await response.json();

    } catch (error) {
        console.error(`Error making API request to ${url}:`, error);
        // Rethrow the error to be handled by the calling function
        throw error;
    }
};


// A function to get a list of all venues.
export const getVenues = async (token, logout) => {
    return makeApiRequest('/venues', 'GET', token, null, logout);
};

// A function to get bookings for a specific venue and date.
export const getBookings = async (venueId, date, token, logout) => {
    return await makeApiRequest(`/bookings?venueId=${venueId}&date=${date}`, 'GET', token, null, logout);
};

// A function to add a new venue.
export const addVenue = async (venueData, token, logout) => {
    return makeApiRequest('/venues', 'POST', token, venueData, logout);
};

// A function to add a new court to a venue.
export const addCourt = async (venueId, courtData, token, logout) => {
    return makeApiRequest(`/venues/${venueId}/courts`, 'POST', token, courtData, logout);
};

// A function to add a new admin to a venue.
export const addAdmin = async (venueId, adminData, token, logout) => {
    return makeApiRequest(`/venues/${venueId}/add-admin`, 'POST', token, adminData, logout);
};