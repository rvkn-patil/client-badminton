import { createTheme, styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#4f46e5',
        },
        secondary: {
            main: '#8b5cf6',
        },
        success: {
            main: '#10b981',
        },
        error: {
            main: '#ef4444',
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '1.5rem',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '1.5rem',
                },
            },
        },
    },
});

export const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
}));

// Usage in other components:
// You can import the theme and Item component in your other components like this:
// import { theme, Item } from './theme';
// Then wrap your components with ThemeProvider to apply the theme:
// import { ThemeProvider } from '@mui/material/styles';
// import { theme } from './theme';
// ...
// <ThemeProvider theme={theme}>
//   <Item>Content</Item>
// </ThemeProvider>

// This will apply the custom theme and styles to the Item component.
// You can also use the theme in styled components or MUI components directly.
// For example, to use the theme in a styled component:
// import { styled } from '@mui/material/styles';
// const StyledComponent = styled('div')(({ theme }) => ({
//   backgroundColor: theme.palette.primary.main,
//   color: theme.palette.primary.contrastText,
// }));
// ...
// <StyledComponent>Content</StyledComponent>

// =========================================================================
// End of Theme Configuration
// =========================================================================