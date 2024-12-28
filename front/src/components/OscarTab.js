import React, { useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    Grid,
    CircularProgress
} from '@mui/material';
import * as api from '../services/api';

const OscarTab = ({ onError }) => {
    const [moviesWithoutOscars, setMoviesWithoutOscars] = useState([]);
    const [directorsWithoutOscars, setDirectorsWithoutOscars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [movies, directors] = await Promise.all([
                    api.getMoviesWithoutOscars(),
                    api.getDirectorsWithoutOscars()
                ]);
                setMoviesWithoutOscars(movies.items);
                setDirectorsWithoutOscars(directors.items);
            } catch (error) {
                onError('Ошибка при загрузке данных об оскарах');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [onError]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Фильмы без "Оскара"
                    </Typography>
                    <List>
                        {moviesWithoutOscars.map((movie, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={movie.name} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Режиссеры без "Оскара"
                    </Typography>
                    <List>
                        {directorsWithoutOscars.map((director, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={director.directorName} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default OscarTab; 