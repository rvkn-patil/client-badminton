import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { AuthContext } from './context/AuthContext';

// Mock the components that are rendered by App.js to prevent
// testing their internal logic and to avoid dependency issues.
jest.mock('./components/auth/Login', () => () => <div data-testid="login-component" />);
jest.mock('./components/auth/Register', () => () => <div data-testid="register-component" />);
jest.mock('./components/auth/ForgotPassword', () => () => <div data-testid="forgot-password-component" />);
jest.mock('./components/auth/ResetPassword', () => () => <div data-testid="reset-password-component" />);
jest.mock('./components/dashboards/UserDashboard', () => () => <div data-testid="user-dashboard" />);
jest.mock('./components/dashboards/OwnerDashboard', () => () => <div data-testid="owner-dashboard-component" />);
jest.mock('./components/layout/Header', () => () => <header data-testid="header-component" />);


describe('App Component', () => {

    // Test case for unauthenticated users.
    test('should render Login component when user is not authenticated', async () => {
        // Mock the AuthContext value for an unauthenticated user.
        const mockAuthContext = { token: null, user: null, role: null };
        
        // Render the App component wrapped in the mocked AuthContext.
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <App />
            </AuthContext.Provider>
        );

        // The component will render the login page immediately.
        expect(screen.getByTestId('login-component')).toBeInTheDocument();
        
        // Ensure that other dashboard components are not in the document.
        expect(screen.queryByTestId('user-dashboard')).not.toBeInTheDocument();
        expect(screen.queryByTestId('owner-dashboard-component')).not.toBeInTheDocument();
    });

    // // Test case for users with the 'user' role.
    // test('should render UserDashboard component for authenticated user role', async () => {
    //     // Mock the AuthContext value with the final, desired state immediately.
    //     const mockAuthContext = { token: 'mock-token', user: { id: '123' }, role: 'user' };

    //     render(
    //         <AuthContext.Provider value={mockAuthContext}>
    //             <App />
    //         </AuthContext.Provider>
    //     );

    //     // Use findByTestId to wait for the component to appear.
    //     expect(await screen.findByTestId('user-dashboard')).toBeInTheDocument();
        
    //     // Ensure that other dashboard components are not in the document.
    //     expect(screen.queryByTestId('login-component')).not.toBeInTheDocument();
    //     expect(screen.queryByTestId('owner-dashboard-component')).not.toBeInTheDocument();
    // });

    // // Test case for users with the 'owner' role.
    // test('should render OwnerDashboard component for authenticated owner role', async () => {
    //     // Mock the AuthContext value with the final, desired state immediately.
    //     const mockAuthContext = { token: 'mock-token', user: { id: '123' }, role: 'owner' };

    //     render(
    //         <AuthContext.Provider value={mockAuthContext}>
    //             <App />
    //         </AuthContext.Provider>
    //     );

    //     // Use findByTestId to wait for the component to appear.
    //     expect(await screen.findByTestId('owner-dashboard-component')).toBeInTheDocument();
        
    //     // Ensure that other dashboard components are not in the document.
    //     expect(screen.queryByTestId('login-component')).not.toBeInTheDocument();
    //     expect(screen.queryByTestId('user-dashboard-component')).not.toBeInTheDocument();
    // });

    // // Test case for users with the 'admin' role.
    // test('should render OwnerDashboard component for authenticated admin role', async () => {
    //     // Mock the AuthContext value with the final, desired state immediately.
    //     const mockAuthContext = { token: 'mock-token', user: { id: '123' }, role: 'admin' };

    //     render(
    //         <AuthContext.Provider value={mockAuthContext}>
    //             <App />
    //         </AuthContext.Provider>
    //     );

    //     // The logic for 'admin' and 'owner' is the same, so we expect the OwnerDashboard.
    //     // Use findByTestId to wait for the component to appear.
    //     expect(await screen.findByTestId('owner-dashboard-component')).toBeInTheDocument();
        
    //     // Ensure that other dashboard components are not in the document.
    //     expect(screen.queryByTestId('login-component')).not.toBeInTheDocument();
    //     expect(screen.queryByTestId('user-dashboard-component')).not.toBeInTheDocument();
    // });
});
