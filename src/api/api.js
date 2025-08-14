// export const API_BASE_URL = 'http://localhost:8080/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined. Please set REACT_APP_API_BASE_URL in your .env file.');
}

export { API_BASE_URL };
// This allows the API_BASE_URL to be set via environment variables, which is useful for different environments (development, production, etc.).
// Make sure to define REACT_APP_API_BASE_URL in your .env file or set it in your deployment environment.
// Example .env file:
// REACT_APP_API_BASE_URL=http://localhost:8080/api
// This will ensure that the API_BASE_URL is correctly set when the application is built and run.
// If REACT_APP_API_BASE_URL is not set, it defaults to 'http://localhost:8080/api' for local development.
// Ensure that you have the .env file in the root of your project and that it is loaded correctly by your build tool (like Create React App).
// This way, you can easily switch between different API endpoints without changing the code.
// In production, you can set the REACT_APP_API_BASE_URL to your actual API endpoint, ensuring that the application connects to the correct backend service.
// Note: Make sure to restart your development server after changing the .env file for the changes to take effect.
// This approach is commonly used in React applications to manage environment-specific configurations.
// Usage in other files:
// import { API_BASE_URL } from '../../api';
// This will import the API_BASE_URL constant, which can be used to make API calls throughout your application.
// Example usage in a component:
// const response = await fetch(`${API_BASE_URL}/endpoint`, { method: 'GET' });
// This will use the API_BASE_URL defined above, ensuring that your API calls are consistent across the application.
// If you are using a different build tool or framework, make sure to adapt the way environment variables are handled accordingly.
// This code snippet is designed to be used in a React application, particularly with Create React App or similar setups that support environment variables.
// Ensure that you have the necessary environment variable set up in your development and production environments.