import React, { useState, useEffect, useCallback } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Pagination
} from '@mui/material';
import * as api from '../services/api';
import MovieForm from './MovieForm';
import FilterField from './FilterField';

const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    
    try {
        // Очищаем строку от [UTC] в конце
        const cleanDate = dateString.replace('[UTC]', '');
        const date = new Date(cleanDate);
        
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC'
        }).replace(',', '');
    } catch (e) {
        console.error('Error formatting date:', dateString, e);
        return 'Некорректная дата';
    }
};

const SORT_FIELD_MAPPING = {
    'id': 'id',
    'name': 'name',
    'creationDate': 'creationDate',
    'oscarsCount': 'oscarsCount',
    'genre': 'genre',
    'mpaaRating': 'mpaaRating',
    'director.name': 'director.name',
    'coordinates.x': 'coordinates.x',
    'coordinates.y': 'coordinates.y'
};

const FILTER_FIELDS = [
    { field: 'id', label: 'ID', type: 'number' },
    { field: 'name', label: 'Название' },
    { field: 'creationDate', label: 'Дата создания', type: 'datetime-local' },
    { field: 'coordinates.x', label: 'Координата X', type: 'number' },
    { field: 'coordinates.y', label: 'Координата Y', type: 'number' },
    { field: 'oscarsCount', label: 'Количество оскаров', type: 'number' },
    { 
        field: 'genre', 
        label: 'Жанр',
        options: [
            { value: 'ACTION', label: 'Боевик' },
            { value: 'ADVENTURE', label: 'Приключения' },
            { value: 'SCIENCE_FICTION', label: 'Научная фантастика' }
        ]
    },
    { 
        field: 'mpaaRating', 
        label: 'Рейтинг MPAA',
        options: [
            { value: 'PG_13', label: 'PG-13' },
            { value: 'R', label: 'R' },
            { value: 'NC_17', label: 'NC-17' }
        ]
    },
    { field: 'director.name', label: 'Имя режиссера' },
    { field: 'director.weight', label: 'Вес режиссера', type: 'number' },
    { field: 'director.passportID', label: 'Паспорт режиссера' },
    { field: 'director.height', label: 'Рост режиссера', type: 'number' },
    { field: 'director.location.name', label: 'Локация режиссера' },
    { field: 'director.location.x', label: 'Локация X', type: 'number' },
    { field: 'director.location.y', label: 'Локация Y', type: 'number' }
];

const MovieList = ({ onError }) => {
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [filters, setFilters] = useState({});
    const [activeFilters, setActiveFilters] = useState({});
    const [sort, setSort] = useState({
        field: 'name',
        direction: 'asc'
    });

    const handleSort = (field) => {
        setSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFilterChange = (field, type, value) => {
        console.log('Filter change:', { field, type, value });
        
        setFilters(prev => {
            const newFilters = { ...prev };
            
            if (value === '' || value === null) {
                console.log('Removing filter for:', field);
                delete newFilters[field];
                return newFilters;
            }

            newFilters[field] = {
                operator: prev[field]?.operator || 'eq',
                value: prev[field]?.value || '',
                [type]: value
            };
            
            console.log('New filters state:', newFilters);
            return newFilters;
        });
    };

    const handleSearch = async () => {
        try {
            console.log('Applying filters:', filters);
            setActiveFilters(filters);
            setPage(1);
            await fetchMovies(filters);
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                onError('Превышено время ожидания ответа от сервера. Пожалуйста, попробуйте позже.');
            } else {
                onError(error.message);
            }
        }
    };

    const handleReset = () => {
        setFilters({});
        setActiveFilters({});
        setPage(1);
    };

    const fetchMovies = useCallback(async (customFilters = null) => {
        try {
            const queryParams = {
                page: page,
                pageSize: 10
            };

            const filtersToUse = customFilters || activeFilters;
            console.log('Using filters:', filtersToUse);

            const filterParams = Object.entries(filtersToUse)
                .filter(([_, filter]) => {
                    const isValid = filter.value !== '' && filter.value !== null && filter.operator;
                    console.log('Filter:', filter, 'isValid:', isValid);
                    return isValid;
                })
                .map(([field, filter]) => {
                    let paramValue;
                    if (field === 'creationDate') {
                        const date = new Date(filter.value);
                        paramValue = date.toISOString();
                    } else {
                        paramValue = encodeURIComponent(filter.value);
                    }
                    const param = `${field}[${filter.operator}]=${paramValue}`;
                    return param;
                });
            
            console.log('Filter params:', filterParams);
            if (filterParams.length > 0) {
                queryParams.filter = filterParams.join(';');
            }

            if (sort.field) {
                const sortField = SORT_FIELD_MAPPING[sort.field];
                if (sortField) {
                    queryParams.sort = sort.direction === 'desc' ? `-${sortField}` : sortField;
                }
            }

            console.log('Request params:', queryParams);

            const response = await api.getMovies(queryParams);
            setMovies(response);
            setHasNextPage(response.length === 10);
        } catch (error) {
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.error 
                || error.message 
                || 'Неизвестная ошибка при загрузке фильмов';
            onError(`Ошибка при загрузке фильмов: ${errorMessage}`);
        }
    }, [page, sort, onError]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies, page, sort]);

    const handleDelete = async (id) => {
        try {
            await api.deleteMovie(id);
            fetchMovies();
        } catch (error) {
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.error 
                || error.message 
                || 'Неизвестная ошибка при удалении';
            onError(`Ошибка при удалении фильма: ${errorMessage}`);
        }
    };

    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                    {FILTER_FIELDS.map(field => (
                        <FilterField
                            key={field.field}
                            {...field}
                            value={filters[field.field]?.value || ''}
                            operator={filters[field.field]?.operator || 'eq'}
                            onChange={handleFilterChange}
                        />
                    ))}
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button 
                        variant="contained" 
                        onClick={handleSearch}
                    >
                        Найти
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={handleReset}
                    >
                        Сбросить фильтры
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell 
                                onClick={() => handleSort('id')}
                                sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                ID {sort.field === 'id' && (sort.direction === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell 
                                onClick={() => handleSort('name')}
                                sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                Название {sort.field === 'name' && (sort.direction === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
                                    Координаты
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Box 
                                            onClick={() => handleSort('coordinates.x')}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            (X {sort.field === 'coordinates.x' && (sort.direction === 'asc' ? '↑' : '↓')})
                                        </Box>
                                        <Box 
                                            onClick={() => handleSort('coordinates.y')}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            (Y {sort.field === 'coordinates.y' && (sort.direction === 'asc' ? '↑' : '↓')})
                                        </Box>
                                    </Box>
                                </Box>
                            </TableCell>
                            <TableCell 
                                onClick={() => handleSort('creationDate')}
                                sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                Дата создания {sort.field === 'creationDate' && (sort.direction === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell 
                                onClick={() => handleSort('oscarsCount')}
                                sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                Оскары {sort.field === 'oscarsCount' && (sort.direction === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell 
                                onClick={() => handleSort('genre')}
                                sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                Жанр {sort.field === 'genre' && (sort.direction === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell 
                                onClick={() => handleSort('mpaaRating')}
                                sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                MPAA {sort.field === 'mpaaRating' && (sort.direction === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell 
                                onClick={() => handleSort('director.name')}
                                sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                Режиссер {sort.field === 'director.name' && (sort.direction === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {movies.map((movie) => (
                            <TableRow key={movie.id}>
                                <TableCell>{movie.id}</TableCell>
                                <TableCell>{movie.name}</TableCell>
                                <TableCell>
                                    X: {movie.coordinates.x}, Y: {movie.coordinates.y}
                                </TableCell>
                                <TableCell>
                                    {formatDate(movie.creationDate)}
                                </TableCell>
                                <TableCell>{movie.oscarsCount || 'Нет'}</TableCell>
                                <TableCell>{movie.genre || 'Не указан'}</TableCell>
                                <TableCell>{movie.mpaaRating || 'Не указан'}</TableCell>
                                <TableCell>{movie.director.name}</TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => {
                                            setSelectedMovie(movie);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Изменить
                                    </Button>
                                    <Button
                                        color="error"
                                        onClick={() => handleDelete(movie.id)}
                                    >
                                        Удалить
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    page={page}
                    count={hasNextPage ? page + 1 : page}
                    onChange={(_, value) => setPage(value)}
                    disabled={!hasNextPage && page === 1}
                />
            </Box>

            <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => {
                    setSelectedMovie(null);
                    setIsModalOpen(true);
                }}
            >
                Добавить фильм
            </Button>

            <MovieForm
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                movie={selectedMovie}
                onSubmit={() => {
                    setIsModalOpen(false);
                    fetchMovies();
                }}
                onError={onError}
            />
        </>
    );
};

export default MovieList; 