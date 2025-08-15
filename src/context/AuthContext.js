import React, { useState, useEffect, createContext } from 'react';

// Create a context to share authentication state across the app.
export const AuthContext = createContext(null);

// The provider component that wraps the application and provides auth state.
export const AuthProvider = ({ children }) => {
    // Initialize state from localStorage to persist user session across refreshes.
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [role, setRole] = useState(() => localStorage.getItem('role'));

    // useEffect hook to synchronize state changes with localStorage.
    // This runs whenever user, token, or role changes.
    useEffect(() => {
        if (user && token && role) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
        } else {
            // If any of the auth states are null, clear all from localStorage.
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
        }
    }, [user, token, role]);

    // Function to set all auth states on successful login.
    const login = (userData, userToken, userRole) => {
        setUser(userData);
        setToken(userToken);
        setRole(userRole);
    };

    // Function to clear all auth states on logout.
    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
    };

    // The value object provided to consuming components.
    const value = { user, token, role, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
