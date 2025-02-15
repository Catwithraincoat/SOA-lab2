import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    FormHelperText
} from '@mui/material';
import * as api from '../services/api';

const MovieForm = ({ open, onClose, movie, onSubmit, onError }) => {
    const [formData, setFormData] = useState({
        name: '',
        coordinates: { x: 0, y: 0 },
        oscarsCount: null,
        genre: null,
        mpaaRating: null,
        directorName: ''
    });

    const [fieldErrors, setFieldErrors] = useState({});
    
    const directors = [
        "Sergei Balabanov",
        "Christopher Nolan",
        "Quentin Tarantino"
    ];

    useEffect(() => {
        setFieldErrors({});
        
        if (movie) {
            setFormData({
                name: movie.name,
                coordinates: movie.coordinates,
                oscarsCount: movie.oscarsCount,
                genre: movie.genre,
                mpaaRating: movie.mpaaRating,
                directorName: movie.director.name
            });
        } else {
            setFormData({
                name: '',
                coordinates: { x: 0, y: 0 },
                oscarsCount: null,
                genre: null,
                mpaaRating: null,
                directorName: ''
            });
        }
    }, [movie, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setFieldErrors({});
            
            if (movie) {
                await api.updateMovie(movie.id, formData);
            } else {
                await api.createMovie(formData);
            }
            onSubmit();
        } catch (error) {
            if (error.validationErrors) {
                // Устанавливаем ошибки валидации в состояние
                setFieldErrors(error.validationErrors);
                return;
            }
            
            const actionType = movie ? 'обновлении' : 'создании';
            onError(`Ошибка при ${actionType} фильма: ${error.message}`);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {movie ? 'Редактировать фильм' : 'Добавить фильм'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Название"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                error={!!fieldErrors.name}
                                helperText={fieldErrors.name}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Координата X"
                                type="number"
                                value={formData.coordinates.x}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    coordinates: { 
                                        ...formData.coordinates, 
                                        x: parseInt(e.target.value) 
                                    }
                                })}
                                required
                                error={!!fieldErrors['coordinates.x']}
                                helperText={fieldErrors['coordinates.x']}
                                inputProps={{ max: 775 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Координата Y"
                                type="number"
                                value={formData.coordinates.y}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    coordinates: { 
                                        ...formData.coordinates, 
                                        y: parseFloat(e.target.value) 
                                    }
                                })}
                                required
                                error={!!fieldErrors['coordinates.y']}
                                helperText={fieldErrors['coordinates.y']}
                                inputProps={{ min: -531 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Количество оскаров"
                                type="number"
                                value={formData.oscarsCount || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || parseInt(value) >= 0) {
                                        setFormData({
                                            ...formData,
                                            oscarsCount: value ? parseInt(value) : null
                                        });
                                    }
                                }}
                                error={!!fieldErrors.oscarsCount}
                                helperText={fieldErrors.oscarsCount}
                                inputProps={{ 
                                    min: 0,
                                    step: 1
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl 
                                fullWidth 
                                error={!!fieldErrors.genre}
                            >
                                <InputLabel>Жанр</InputLabel>
                                <Select
                                    value={formData.genre || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        genre: e.target.value || null
                                    })}
                                    label="Жанр"
                                >
                                    <MenuItem value="">Не указан</MenuItem>
                                    <MenuItem value="ACTION">Боевик</MenuItem>
                                    <MenuItem value="ADVENTURE">Приключения</MenuItem>
                                    <MenuItem value="SCIENCE_FICTION">Научная фантастика</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Рейтинг MPAA</InputLabel>
                                <Select
                                    value={formData.mpaaRating || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        mpaaRating: e.target.value || null
                                    })}
                                    label="Рейтинг MPAA"
                                >
                                    <MenuItem value="">Не указан</MenuItem>
                                    <MenuItem value="PG_13">PG-13</MenuItem>
                                    <MenuItem value="R">R</MenuItem>
                                    <MenuItem value="NC_17">NC-17</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl 
                                fullWidth
                                error={!!fieldErrors.directorName}
                            >
                                <InputLabel required>Режиссер</InputLabel>
                                <Select
                                    value={formData.directorName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        directorName: e.target.value
                                    })}
                                    label="Режиссер"
                                    required
                                >
                                    {directors.map((director) => (
                                        <MenuItem key={director} value={director}>
                                            {director}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.directorName && (
                                    <FormHelperText>{fieldErrors.directorName}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Отмена</Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                    >
                        {movie ? 'Сохранить' : 'Добавить'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default MovieForm; 