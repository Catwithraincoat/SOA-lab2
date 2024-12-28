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
            const actionType = movie ? 'обновлении' : 'создании';
            let errorDetails = {};

            if (error.response?.data) {
                errorDetails = error.response.data;
            } else if (error.message) {
                errorDetails = { message: error.message };
            }

            onError(`Ошибка при ${actionType} фильма: ${JSON.stringify(errorDetails)}`);
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
                                    coordinates: { ...formData.coordinates, x: parseFloat(e.target.value) }
                                })}
                                error={!!fieldErrors['coordinates.x']}
                                helperText={fieldErrors['coordinates.x']}
                                required
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
                                    coordinates: { ...formData.coordinates, y: parseFloat(e.target.value) }
                                })}
                                error={!!fieldErrors['coordinates.y']}
                                helperText={fieldErrors['coordinates.y']}
                                required
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
                                {fieldErrors.genre && (
                                    <FormHelperText>{fieldErrors.genre}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl 
                                fullWidth
                                error={!!fieldErrors.mpaaRating}
                            >
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
                                {fieldErrors.mpaaRating && (
                                    <FormHelperText>{fieldErrors.mpaaRating}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Имя режиссера"
                                value={formData.directorName}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    directorName: e.target.value
                                })}
                                required
                                error={!!fieldErrors.directorName}
                                helperText={fieldErrors.directorName}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Отмена</Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={Object.keys(fieldErrors).length > 0}
                    >
                        {movie ? 'Сохранить' : 'Добавить'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default MovieForm; 