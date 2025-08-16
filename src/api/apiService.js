// apiService.js

// This file centralizes all API calls and their error handling.
// It helps to keep component code clean and focused on the UI.

import { API_BASE_URL } from "./api";

// The base URL for the API. This should be consistent across the application.
// const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your actual API base URL
/**
 * A CONSOLIDATED function to handle all API requests.
 * This is the central utility that encapsulates the core fetching logic,
 * headers, and error handling for all calls, regardless of the endpoint.
 * @param {string} endpoint The specific API endpoint (e.g., '/venues').
 * @param {string} method The HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {string} token The authentication token.
 * @param {object} body The request body for methods like POST or PUT.
 * @returns {Promise<any>} The parsed JSON response data.
 * @throws {Error} An error with a user-friendly message if the request fails.
 */
const makeApiRequest = async (endpoint, method = 'GET', body = null) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
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

// --- API Client Helper Functions ---
// These functions are wrappers around makeApiRequest.
// They make the component code more readable and abstract away the specific
// endpoint URLs and HTTP methods.

// A function to handle user login.
export const loginUser = async (email, password) => {
    return makeApiRequest('/auth/login', 'POST', { email, password });
};

// A function to get a list of all venues.
export const getVenues = async () => {
    return makeApiRequest('/venues', 'GET');
};

// A function to get bookings for a specific venue and date.
export const getBookings = async (venueId, date, token) => {
    return await makeApiRequest(`/bookings?venueId=${venueId}&date=${date}`, 'GET', token);
};

// A function to add a new venue.
export const addVenue = async (venueData, token) => {
    return makeApiRequest('/venues', 'POST', token, venueData);
};

// A function to add a new court to a venue.
export const addCourt = async (venueId, courtData, token) => {
    return makeApiRequest(`/venues/${venueId}/courts`, 'POST', token, courtData);
};

// A function to add a new admin to a venue.
export const addAdmin = async (venueId, adminData, token) => {
    return makeApiRequest(`/venues/${venueId}/add-admin`, 'POST', token, adminData);
};
