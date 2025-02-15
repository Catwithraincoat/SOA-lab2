import React, { useState } from 'react';
import { 
    Container, 
    Tabs, 
    Tab, 
    Box,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Typography
} from '@mui/material';
import MovieList from './components/MovieList';
import OscarTab from './components/OscarTab';
import ErrorModal from './components/ErrorModal';

const theme = createTheme();

function App() {
    const [currentTab, setCurrentTab] = useState(0);
    const [error, setError] = useState(null);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container>
                <Box sx={{ width: '100%', mt: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Управление фильмами
                    </Typography>
                    
                    <Tabs value={currentTab} onChange={handleTabChange}>
                        <Tab label="Фильмы" />
                        <Tab label="Оскар" />
                    </Tabs>

                    <Box sx={{ mt: 2 }}>
                        {currentTab === 0 && (
                            <MovieList onError={setError} />
                        )}
                        {currentTab === 1 && (
                            <OscarTab onError={setError} />
                        )}
                    </Box>
                </Box>

                <ErrorModal 
                    open={!!error}
                    message={error}
                    onClose={() => setError(null)}
                />
            </Container>
        </ThemeProvider>
    );
}

export default App;
