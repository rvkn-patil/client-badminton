import React, { useState, useEffect, useContext } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { theme } from './theme/theme';
import Header from './components/layout/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import UserDashboard from './components/dashboards/UserDashboard';
import OwnerDashboard from './components/dashboards/OwnerDashboard';

const MainApp = () => {
  const [route, setRoute] = useState('login');
  const { user, role } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      if (role === 'owner' || role === 'admin') {
        setRoute('owner-dashboard');
      } else if (role === 'user') {
        setRoute('user-dashboard');
      }
    } else {
      setRoute('login');
    }
  }, [user, role]);

  const renderContent = () => {
    switch (route) {
      case 'login':
        return <Login setRoute={setRoute} />;
      case 'register':
        return <Register setRoute={setRoute} />;
      case 'forgot-password':
        return <ForgotPassword setRoute={setRoute} />;
      case 'reset-password':
        return <ResetPassword setRoute={setRoute} />;
      case 'user-dashboard':
        return <UserDashboard />;
      case 'owner-dashboard':
        return <OwnerDashboard />;
      default:
        return <Login setRoute={setRoute} />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header />
      <Box sx={{ mt: 3, p: { xs: 1, md: 3 } }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;