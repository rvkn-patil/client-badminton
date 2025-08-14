import React, { useState, useEffect, createContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole] = useState(localStorage.getItem('role'));

    const login = (userData, userToken, userRole) => {
        setUser(userData);
        setToken(userToken);
        setRole(userRole);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        localStorage.setItem('role', userRole);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    };

    useEffect(() => {
        if (!token) {
            setRole(null);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};