import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../api/api';

const useApi = (initialEndpoint, initialOptions = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, logout } = useContext(AuthContext);

    // The core function to handle all API calls
    const callApi = useCallback(async (method, body = null) => {
        setLoading(true);
        setError(null);
        setData(null);

        // Log the method and endpoint being used for debugging
        console.log(`[useApi] Calling API: ${method} ${API_BASE_URL}${initialEndpoint}`);

        const headers = {
            'Content-Type': 'application/json',
            ...initialOptions.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const fetchOptions = {
            ...initialOptions,
            method,
            headers,
        };

        if (body && method !== 'GET' && method !== 'HEAD') {
            fetchOptions.body = JSON.stringify(body);
        }

        const finalEndpoint = initialEndpoint || '';

        try {
            const response = await fetch(`${API_BASE_URL}${finalEndpoint}`, fetchOptions);

            if (response.status === 401) {
                logout();
                throw new Error('Unauthorized. Please log in again.');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred.');
            }

            const responseData = await response.json();
            setData(responseData);
            return responseData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [initialEndpoint, initialOptions, token, logout]);

    // Memoized functions for POST and GET requests
    const post = useCallback(async (body) => callApi('POST', body), [callApi]);
    const get = useCallback(async () => callApi('GET'), [callApi]);
    const put = useCallback(async (body) => callApi('PUT', body), [callApi]);
    const del = useCallback(async () => callApi('DELETE'), [callApi]);

    // This useEffect is what handles the initial, non-lazy API call.
    // The conditional check `!initialOptions.lazy` prevents it from running for components that set lazy to true.
    useEffect(() => {
        if (!initialOptions.lazy && initialEndpoint) {
            console.log('[useApi] Auto-fetching data with GET request due to lazy: false');
            get();
        }
    }, [get, initialOptions.lazy, initialEndpoint]);

    return { data, loading, error, post, get };
};

export default useApi;