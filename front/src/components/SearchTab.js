// import React, { useState } from 'react';
// import {
//     TextField,
//     Button,
//     Select,
//     MenuItem,
//     FormControl,
//     InputLabel,
//     Grid,
//     Typography,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Card,
//     CardContent
// } from '@mui/material';
// import * as api from '../services/api';

// const SearchTab = ({ onError }) => {
//     // Состояния для MPAA Rating
//     const [mpaaRating, setMpaaRating] = useState('');
//     const [mpaaCount, setMpaaCount] = useState(null);

//     // Состояния для поиска по имени
//     const [nameSearch, setNameSearch] = useState('');
//     const [nameResults, setNameResults] = useState(null);

//     // Состояния для поиска по весу режиссера
//     const [directorWeight, setDirectorWeight] = useState('');
//     const [directorResults, setDirectorResults] = useState(null);

//     const handleMpaaCount = async () => {
//         try {
//             const results = await api.getMovies({
//                 filter: `mpaaRating[lt]=${mpaaRating}`
//             });
//             setMpaaCount(results.length);
//             setNameResults(null);
//             setDirectorResults(null);
//         } catch (error) {
//             onError(error.message);
//         }
//     };

//     const handleNameSearch = async () => {
//         try {
//             const allMovies = await api.getMovies({});
//             const filteredMovies = allMovies.filter(movie => 
//                 movie.name.toLowerCase().includes(nameSearch.toLowerCase())
//             );
//             setNameResults(filteredMovies);
//             setMpaaCount(null);
//             setDirectorResults(null);
//         } catch (error) {
//             onError(error.message);
//         }
//     };

//     const handleDirectorSearch = async () => {
//         try {
//             const results = await api.getMovies({
//                 filter: `director.weight[lt]=${directorWeight}`
//             });
//             setDirectorResults(results);
//             setMpaaCount(null);
//             setNameResults(null);
//         } catch (error) {
//             onError(error.message);
//         }
//     };

//     const ResultsTable = ({ results }) => (
//         <TableContainer sx={{ mt: 2 }}>
//             <Table>
//                 <TableHead>
//                     <TableRow>
//                         <TableCell>ID</TableCell>
//                         <TableCell>Название</TableCell>
//                         <TableCell>Режиссер</TableCell>
//                         <TableCell>Вес режиссера</TableCell>
//                         <TableCell>MPAA</TableCell>
//                     </TableRow>
//                 </TableHead>
//                 <TableBody>
//                     {results.map((movie) => (
//                         <TableRow key={movie.id}>
//                             <TableCell>{movie.id}</TableCell>
//                             <TableCell>{movie.name}</TableCell>
//                             <TableCell>{movie.director.name}</TableCell>
//                             <TableCell>{movie.director.weight}</TableCell>
//                             <TableCell>{movie.mpaaRating}</TableCell>
//                         </TableRow>
//                     ))}
//                 </TableBody>
//             </Table>
//         </TableContainer>
//     );

//     return (
//         <Grid container spacing={3}>
//             {/* Секция 1: Поиск по MPAA Rating */}
//             <Grid item xs={12}>
//                 <Card>
//                     <CardContent>
//                         <Typography variant="h6" gutterBottom>
//                             1. Количество фильмов с рейтингом MPAA меньше заданного
//                         </Typography>
//                         <Grid container spacing={2} alignItems="center">
//                             <Grid item xs={12} md={6}>
//                                 <FormControl fullWidth>
//                                     <InputLabel>MPAA Рейтинг</InputLabel>
//                                     <Select
//                                         value={mpaaRating}
//                                         onChange={(e) => setMpaaRating(e.target.value)}
//                                         label="MPAA Рейтинг"
//                                     >
//                                         <MenuItem value="PG_13">PG-13</MenuItem>
//                                         <MenuItem value="R">R</MenuItem>
//                                         <MenuItem value="NC_17">NC-17</MenuItem>
//                                     </Select>
//                                 </FormControl>
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <Button 
//                                     variant="contained"
//                                     onClick={handleMpaaCount}
//                                     disabled={!mpaaRating}
//                                 >
//                                     Посчитать
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                         {mpaaCount !== null && (
//                             <Typography sx={{ mt: 2 }}>
//                                 Найдено фильмов: {mpaaCount}
//                             </Typography>
//                         )}
//                     </CardContent>
//                 </Card>
//             </Grid>

//             {/* Секция 2: Поиск по подстроке в названии */}
//             <Grid item xs={12}>
//                 <Card>
//                     <CardContent>
//                         <Typography variant="h6" gutterBottom>
//                             2. Поиск фильмов по подстроке в названии
//                         </Typography>
//                         <Grid container spacing={2} alignItems="center">
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     label="Подстрока для поиска"
//                                     value={nameSearch}
//                                     onChange={(e) => setNameSearch(e.target.value)}
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <Button 
//                                     variant="contained"
//                                     onClick={handleNameSearch}
//                                     disabled={!nameSearch}
//                                 >
//                                     Найти
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                         {nameResults && <ResultsTable results={nameResults} />}
//                     </CardContent>
//                 </Card>
//             </Grid>

//             {/* Секция 3: Поиск по весу режиссера */}
//             <Grid item xs={12}>
//                 <Card>
//                     <CardContent>
//                         <Typography variant="h6" gutterBottom>
//                             3. Поиск фильмов с весом режиссера меньше заданного
//                         </Typography>
//                         <Grid container spacing={2} alignItems="center">
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     type="number"
//                                     label="Вес режиссера"
//                                     value={directorWeight}
//                                     onChange={(e) => setDirectorWeight(e.target.value)}
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <Button 
//                                     variant="contained"
//                                     onClick={handleDirectorSearch}
//                                     disabled={!directorWeight}
//                                 >
//                                     Найти
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                         {directorResults && <ResultsTable results={directorResults} />}
//                     </CardContent>
//                 </Card>
//             </Grid>
//         </Grid>
//     );
// };

// export default SearchTab; 