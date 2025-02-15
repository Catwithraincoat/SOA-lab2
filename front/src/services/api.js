import axios from 'axios';

const firstServiceApi = axios.create({
    baseURL: 'https://localhost:8443/jaxrs-service/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 5000, // 5 секунд таймаут
    validateStatus: function (status) {
        return status >= 200 && status < 500; // Принимаем все статусы от 200 до 499
    }
});

firstServiceApi.interceptors.response.use(
    response => response,
    error => {
        console.error('Error response:', error.response?.data);
        
        let processedError = new Error();
        
        if (error.response?.data) {
            const responseData = error.response.data;
            
            // Проверяем наличие ошибок валидации координат
            if (responseData.message && Array.isArray(responseData.message)) {
                const coordinateErrors = {};
                
                responseData.message.forEach(msg => {
                    if (msg.field === 'coordinates.x' || msg.field === 'coordinates.y') {
                        coordinateErrors[msg.field] = msg.inner_message;
                    }
                });
                
                if (Object.keys(coordinateErrors).length > 0) {
                    processedError.validationErrors = coordinateErrors;
                    return Promise.reject(processedError);
                }
            }
            
            processedError.message = responseData.message || 
                                   responseData.error || 
                                   'Неизвестная ошибка';
            if (responseData.details) {
                processedError.details = responseData.details;
            }
            processedError.status = error.response.status;
        } else if (error.request) {
            processedError.message = 'Нет ответа от сервера';
        } else {
            processedError.message = 'Ошибка сети';
        }

        return Promise.reject(processedError);
    }
);

const secondServiceApi = axios.create({
    baseURL: 'https://localhost:8181/second-service/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 5000,
    validateStatus: function (status) {
        return status >= 200 && status < 500;
    }
});

// Интерцептор для обработки ошибок второго сервиса
secondServiceApi.interceptors.response.use(
    response => response,
    error => {
        let processedError = new Error();
        
        if (error.response?.data) {
            const responseData = error.response.data;
            processedError.message = responseData.message || 
                                   responseData.error || 
                                   'Неизвестная ошибка';
            processedError.details = responseData.details;
            processedError.status = error.response.status;
        } else if (error.request) {
            processedError.message = 'Нет ответа от сервера';
        } else {
            processedError.message = 'Ошибка сети';
        }

        return Promise.reject(processedError);
    }
);

// Добавляем интерцептор для повторных попыток
secondServiceApi.interceptors.response.use(null, async (error) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log('Request timed out, retrying...');
        const config = error.config;
        // Пробуем повторить запрос
        try {
            return await secondServiceApi.request(config);
        } catch (retryError) {
            return Promise.reject(retryError);
        }
    }
    return Promise.reject(error);
});

axios.defaults.validateStatus = function (status) {
    return true; // любой статус считаем успешным
};

export const getMovies = async (params) => {
    try {
        console.log('API getMovies called with params:', params);
        const response = await firstServiceApi.get('/movies', { params });
        console.log('API response:', response);
        return response.data;
    } catch (error) {
        // Если это ошибка валидации фильтров
        if (error.response?.status === 400 && error.response.data?.message) {
            const processedError = new Error('Ошибка в параметрах фильтра');
            processedError.response = error.response;
            throw processedError;
        }
        throw error;
    }
};

export const createMovie = async (movie) => {
    const response = await firstServiceApi.post('/movie', movie);
    return response.data;
};

export const updateMovie = async (id, movie) => {
    const response = await firstServiceApi.patch(`/movies/${id}`, movie);
    return response.data;
};

export const deleteMovie = async (id) => {
    const response = await firstServiceApi.delete(`/movies/${id}`);
    return response.data;
};

export const getMoviesWithoutOscars = async () => {
    try {
        console.log('Requesting movies without oscars...');
        const response = await secondServiceApi.get('/oscar/movies/get-loosers');
        console.log('Response received:', response);
        return response.data;
    } catch (error) {
        console.error('Error fetching movies without oscars:', error);
        if (error.code === 'ECONNABORTED') {
            throw new Error('Сервер не отвечает. Пожалуйста, попробуйте позже.');
        }
        throw error;
    }
};

export const getDirectorsWithoutOscars = async () => {
    const response = await secondServiceApi.get('/oscar/directors/get-loosers');
    return response.data;
}; 