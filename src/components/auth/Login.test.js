// --- Test Cases for Login.js ---

/*
  Login.js tests should focus on user interaction with the form and the outcome
  of a successful or failed login attempt. They should not test the API call itself,
  but rather mock it to test the component's behavior.
*/

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { AuthContext } from '../../context/AuthContext';
import { loginUser } from '../../api/apiService'; // Importing the login function from the API service

// Mock the AuthContext and the API service
const mockAuthContext = {
    login: jest.fn(),
    token: null
};
jest.mock('../../api/apiService');

// Mock the MessageDialog component to prevent rendering issues
jest.mock('../common/MessageDialog', () => (props) => {
    // Render a simple div with the message for testing purposes
    if (props.open) {
        return <div data-testid="message-dialog">{props.message}</div>;
    }
    return null;
});

describe('Login Component', () => {

    test('should render login form with email and password fields', () => {
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <Login />
            </AuthContext.Provider>
        );
        // Assert that the email and password fields are in the document
        // expect(screen.getByLabelText('textbox', { name: /Email Address/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('should show error message on failed login attempt', async () => {
        // Mock the API service to return a failed login response
        loginUser.mockRejectedValueOnce(new Error('Invalid credentials'));

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <Login />
            </AuthContext.Provider>
        );

        // Simulate user input
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Use findByTestId to wait for the dialog to appear
        const messageDialog = await screen.findByTestId('message-dialog');

        // Assert that the mocked dialog is in the document and contains the correct error message
        expect(messageDialog).toBeInTheDocument();
        expect(messageDialog).toHaveTextContent(/invalid credentials/i);
    });

    test('should call login function on successful login', async () => {
        // Mock the API service to return a successful login response
        loginUser.mockResolvedValueOnce({user: { id: '123', role: 'user' }, token: 'mock-token', role: 'user'});

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <Login />
            </AuthContext.Provider>
        );

        // Simulate user input and click the login button
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'correctpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Wait for the login function from AuthContext to be called
        await waitFor(() => {
            expect(mockAuthContext.login).toHaveBeenCalledWith(expect.any(Object), 'mock-token', 'user');
        });
    });
});