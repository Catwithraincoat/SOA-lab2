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
    Pagination,
    Card,
    CardContent,
    Divider,
    Typography,
    Grid
} from '@mui/material';
import * as api from '../services/api';
import MovieForm from './MovieForm';
import FilterField from './FilterField';
import TruncatedText from './TruncatedText';

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

const MPAA_RATINGS_ORDER = {
    'PG_13': 1,
    'R': 2,
    'NC_17': 3
};

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
    const [specialSearch, setSpecialSearch] = useState({
        mpaaRating: '',
        nameSubstring: '',
        directorWeight: ''
    });
    const [specialResults, setSpecialResults] = useState({
        mpaaCount: null,
        nameResults: null,
        directorResults: null
    });
    const [mpaaRating, setMpaaRating] = useState('');
    const [mpaaCount, setMpaaCount] = useState(null);

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
            // Проверяем наличие ошибок валидации
            if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
                const errorMessages = error.response.data.message
                    .map(msg => {
                        // Преобразуем поля в читаемый формат
                        const fieldMap = {
                            'coordinates.x': 'Координата X',
                            'coordinates.y': 'Координата Y',
                            'oscarsCount': 'Количество оскаров',
                            'director.weight': 'Вес режиссера',
                            'director.height': 'Рост режиссера'
                        };
                        
                        const fieldName = fieldMap[msg.field] || msg.field;
                        return `${fieldName}: ${msg.inner_message}`;
                    })
                    .join('\n');
                
                onError(`Ошибка в параметрах фильтра:\n${errorMessages}`);
            } else if (error.code === 'ECONNABORTED') {
                onError('Превышено время ожидания ответа от сервера. Пожалуйста, попробуйте позже.');
            } else {
                onError(error.message || 'Произошла ошибка при поиске');
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
                queryParams.filter = filterParams.join(',');
            }

            if (sort.field) {
                const sortField = SORT_FIELD_MAPPING[sort.field];
                if (sortField) {
                    queryParams.sort = sort.direction === 'desc' ? `-${sortField}` : sortField;
                }
            }

            console.log('Request params:', queryParams);

            const response = await api.getMovies(queryParams);
            if (Array.isArray(response)) {
                setMovies(response);
                setHasNextPage(response.length === 10);
            } else {
                throw new Error('Ошибка в параметрах фильтра');
            }
        } catch (error) {
            if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
                const errorMessages = error.response.data.message
                    .map(msg => {
                        const fieldMap = {
                            'coordinates.x': 'Координата X',
                            'coordinates.y': 'Координата Y',
                            'oscarsCount': 'Количество оскаров',
                            'director.weight': 'Вес режиссера',
                            'director.height': 'Рост режиссера'
                        };
                        
                        const fieldName = fieldMap[msg.field] || msg.field;
                        return `${fieldName}: ${msg.inner_message}`;
                    })
                    .join('\n');
                
                onError(`Ошибка в параметрах фильтра:\n${errorMessages}`);
            } else {
                onError(error.message || 'Произошла ошибка при загрузке фильмов');
            }
            setMovies([]);
            setHasNextPage(false);
        }
    }, [page, activeFilters, sort.field, sort.direction, onError]);

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

    const handleEdit = (movieId) => {
        const movie = movies.find(m => m.id === movieId);
        if (movie) {
            setSelectedMovie(movie);
            setIsModalOpen(true);
        }
    };

    const handleSpecialSearch = async (type) => {
        let results;
        try {
            switch (type) {
                case 'mpaa':
                    // Получаем все фильмы
                    const allMovies = await api.getMovies({});
                    // Фильтруем на клиенте, учитывая правильный порядок рейтингов
                    const filteredMovies = allMovies.filter(movie => 
                        movie.mpaaRating && 
                        MPAA_RATINGS_ORDER[movie.mpaaRating] < MPAA_RATINGS_ORDER[specialSearch.mpaaRating]
                    );
                    setMovies(filteredMovies);
                    setSpecialResults({
                        ...specialResults,
                        mpaaCount: filteredMovies.length,
                        nameResults: null,
                        directorResults: null
                    });
                    break;

                case 'name':
                    results = await api.getMovies({});
                    const filteredByName = results.filter(movie => 
                        movie.name.toLowerCase().includes(specialSearch.nameSubstring.toLowerCase())
                    );
                    setMovies(filteredByName);
                    setSpecialResults({
                        ...specialResults,
                        mpaaCount: null,
                        nameResults: null,
                        directorResults: null
                    });
                    break;

                case 'director':
                    results = await api.getMovies({
                        filter: `director.weight[lt]=${specialSearch.directorWeight}`
                    });
                    setMovies(results);
                    setSpecialResults({
                        ...specialResults,
                        mpaaCount: null,
                        nameResults: null,
                        directorResults: results
                    });
                    break;

                default:
                    console.warn('Неизвестный тип поиска:', type);
                    break;
            }
        } catch (error) {
            onError(error.message);
        }
    };

    const handleMpaaCount = async () => {
        try {
            const results = await api.getMovies({
                filter: `mpaaRating[lt]=${mpaaRating}`
            });
            setMovies(results);
            setMpaaCount(results.length);
        } catch (error) {
            onError(error.message);
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

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Специальный поиск
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Фильмы с рейтингом MPAA меньше
                                </Typography>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>MPAA Рейтинг</InputLabel>
                                    <Select
                                        value={mpaaRating}
                                        onChange={(e) => setMpaaRating(e.target.value)}
                                        label="MPAA Рейтинг"
                                    >
                                        <MenuItem value="PG_13">PG-13</MenuItem>
                                        <MenuItem value="R">R</MenuItem>
                                        <MenuItem value="NC_17">NC-17</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button 
                                    variant="contained"
                                    onClick={handleMpaaCount}
                                    disabled={!mpaaRating}
                                    fullWidth
                                >
                                    Посчитать
                                </Button>
                                {mpaaCount !== null && (
                                    <Typography sx={{ mt: 2 }}>
                                        Найдено фильмов: {mpaaCount}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Поиск фильмов по подстроке в названии
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Подстрока для поиска"
                                    value={specialSearch.nameSubstring}
                                    onChange={(e) => setSpecialSearch({
                                        ...specialSearch,
                                        nameSubstring: e.target.value
                                    })}
                                    sx={{ mb: 2 }}
                                />
                                <Button 
                                    variant="contained"
                                    onClick={() => handleSpecialSearch('name')}
                                    disabled={!specialSearch.nameSubstring}
                                    fullWidth
                                >
                                    Найти
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Фильмы с весом режиссера меньше
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Вес режиссера"
                                    value={specialSearch.directorWeight}
                                    onChange={(e) => setSpecialSearch({
                                        ...specialSearch,
                                        directorWeight: e.target.value
                                    })}
                                    sx={{ mb: 2 }}
                                />
                                <Button 
                                    variant="contained"
                                    onClick={() => handleSpecialSearch('director')}
                                    disabled={!specialSearch.directorWeight}
                                    fullWidth
                                >
                                    Найти
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>

            {/* {specialResults.nameResults && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Название</TableCell>
                                <TableCell>Режиссер</TableCell>
                                <TableCell>Жанр</TableCell>
                                <TableCell>MPAA</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {specialResults.nameResults.map((movie) => (
                                <TableRow key={movie.id}>
                                    <TableCell>{movie.id}</TableCell>
                                    <TableCell>
                                        <TruncatedText text={movie.name} />
                                    </TableCell>
                                    <TableCell>
                                        <TruncatedText text={movie.director.name} />
                                    </TableCell>
                                    <TableCell>{movie.genre || 'Не указан'}</TableCell>
                                    <TableCell>{movie.mpaaRating || 'Не указан'}</TableCell>
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
            )} */}

            {/* {(specialResults.nameResults || specialResults.directorResults) && (
                <Paper sx={{ mb: 2 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Название</TableCell>
                                    <TableCell>Режиссер</TableCell>
                                    <TableCell>Вес режиссера</TableCell>
                                    <TableCell>MPAA</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(specialResults.nameResults || specialResults.directorResults).map((movie) => (
                                    <TableRow key={movie.id}>
                                        <TableCell>{movie.id}</TableCell>
                                        <TableCell>
                                            <TruncatedText text={movie.name} />
                                        </TableCell>
                                        <TableCell>
                                            <TruncatedText text={movie.director.name} />
                                        </TableCell>
                                        <TableCell>{movie.director.weight}</TableCell>
                                        <TableCell>{movie.mpaaRating}</TableCell>
                                        <TableCell>
                                            <Button 
                                                size="small"
                                                onClick={() => handleEdit(movie.id)}
                                            >
                                                Изменить
                                            </Button>
                                            <Button 
                                                size="small"
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
                </Paper>
            )} */}

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
                            <TableCell>Вес режиссера</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {movies.map((movie) => (
                            <TableRow key={movie.id}>
                                <TableCell>{movie.id}</TableCell>
                                <TableCell>
                                    <TruncatedText text={movie.name} />
                                </TableCell>
                                <TableCell>
                                    X: {movie.coordinates.x}, Y: {movie.coordinates.y}
                                </TableCell>
                                <TableCell>
                                    {formatDate(movie.creationDate)}
                                </TableCell>
                                <TableCell>{movie.oscarsCount || 'Нет'}</TableCell>
                                <TableCell>{movie.genre || 'Не указан'}</TableCell>
                                <TableCell>{movie.mpaaRating || 'Не указан'}</TableCell>
                                <TableCell>
                                    <TruncatedText text={movie.director.name} />
                                </TableCell>
                                <TableCell>{movie.director.weight || 'Не указан'}</TableCell>
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