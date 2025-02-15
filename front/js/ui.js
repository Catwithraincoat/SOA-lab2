class UI {
    constructor() {
        // Состояние приложения
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentMovie = null;

        // Табы
        this.tabs = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');

        // Таблица фильмов
        this.moviesTable = document.getElementById('movies-table').querySelector('tbody');
        
        // Пагинация
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');
        this.pageInfo = document.getElementById('page-info');

        // Фильтры и сортировка
        this.nameFilter = document.getElementById('name-filter');
        this.genreFilter = document.getElementById('genre-filter');
        this.mpaaFilter = document.getElementById('mpaa-filter');
        this.sortField = document.getElementById('sort-field');
        this.sortDirection = document.getElementById('sort-direction');

        // Модальные окна
        this.movieModal = document.getElementById('movie-modal');
        this.errorModal = document.getElementById('error-modal');
        this.movieForm = document.getElementById('movie-form');

        // Секции оскара
        this.moviesWithoutOscars = document.getElementById('movies-without-oscars');
        this.directorsWithoutOscars = document.getElementById('directors-without-oscars');

        this.initEventListeners();
    }

    initEventListeners() {
        // Обработчики табов
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Обработчики пагинации
        this.prevPageBtn.addEventListener('click', () => this.changePage(-1));
        this.nextPageBtn.addEventListener('click', () => this.changePage(1));

        // Обработчики фильтров и сортировки
        document.getElementById('apply-filters').addEventListener('click', () => this.loadMovies());
        document.getElementById('apply-sort').addEventListener('click', () => this.loadMovies());

        // Обработчики модальных окон
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeModals());
        });

        // Обработ��ик добавления фильма
        document.getElementById('add-movie').addEventListener('click', () => this.showMovieModal());

        // Обработчик формы фильма
        this.movieForm.addEventListener('submit', (e) => this.handleMovieSubmit(e));
    }

    async loadMovies() {
        try {
            const params = {
                page: this.currentPage,
                pageSize: this.pageSize,
                filter: this.getFilters(),
                sort: this.getSortParams()
            };

            const movies = await api.getMovies(params);
            this.renderMoviesTable(movies);
        } catch (error) {
            this.showError(error.message);
        }
    }

    getFilters() {
        const filters = [];
        
        if (this.nameFilter.value) {
            filters.push(`name[eq]=${this.nameFilter.value}`);
        }
        if (this.genreFilter.value) {
            filters.push(`genre[eq]=${this.genreFilter.value}`);
        }
        if (this.mpaaFilter.value) {
            filters.push(`mpaaRating[eq]=${this.mpaaFilter.value}`);
        }

        return filters;
    }

    getSortParams() {
        const field = this.sortField.value;
        const direction = this.sortDirection.value === 'desc' ? '-' : '';
        return `${direction}${field}`;
    }

    renderMoviesTable(movies) {
        this.moviesTable.innerHTML = movies.map(movie => `
            <tr>
                <td>${movie.id}</td>
                <td>${movie.name}</td>
                <td>X: ${movie.coordinates.x}, Y: ${movie.coordinates.y}</td>
                <td>${new Date(movie.creationDate).toLocaleDateString()}</td>
                <td>${movie.oscarsCount || 'Нет'}</td>
                <td>${movie.genre || 'Не указан'}</td>
                <td>${movie.mpaaRating || 'Не указан'}</td>
                <td>${movie.director.name}</td>
                <td>
                    <button onclick="ui.editMovie(${movie.id})">Изменить</button>
                    <button onclick="ui.deleteMovie(${movie.id})">Удалить</button>
                </td>
            </tr>
        `).join('');
    }

    async loadOscarData() {
        try {
            const [movies, directors] = await Promise.all([
                api.getMoviesWithoutOscars(),
                api.getDirectorsWithoutOscars()
            ]);

            this.renderOscarData(movies, directors);
        } catch (error) {
            this.showError(error.message);
        }
    }

    renderOscarData(movies, directors) {
        this.moviesWithoutOscars.innerHTML = `
            <ul>
                ${movies.items.map(movie => `<li>${movie.name}</li>`).join('')}
            </ul>
        `;

        this.directorsWithoutOscars.innerHTML = `
            <ul>
                ${directors.items.map(director => `<li>${director.directorName}</li>`).join('')}
            </ul>
        `;
    }

    switchTab(tabId) {
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });

        if (tabId === 'oscar') {
            this.loadOscarData();
        } else {
            this.loadMovies();
        }
    }

    showMovieModal(movie = null) {
        this.currentMovie = movie;
        this.movieModal.style.display = 'block';
        this.movieForm.reset();

        if (movie) {
            document.getElementById('movie-name').value = movie.name;
            document.getElementById('coord-x').value = movie.coordinates.x;
            document.getElementById('coord-y').value = movie.coordinates.y;
            document.getElementById('oscars-count').value = movie.oscarsCount || '';
            document.getElementById('movie-genre').value = movie.genre || '';
            document.getElementById('movie-mpaa').value = movie.mpaaRating || '';
            document.getElementById('director-name').value = movie.director.name;
        }
    }

    async handleMovieSubmit(e) {
        e.preventDefault();
        
        const movieData = {
            name: document.getElementById('movie-name').value,
            coordinates: {
                x: parseInt(document.getElementById('coord-x').value),
                y: parseFloat(document.getElementById('coord-y').value)
            },
            oscarsCount: document.getElementById('oscars-count').value ? 
                parseInt(document.getElementById('oscars-count').value) : null,
            genre: document.getElementById('movie-genre').value || null,
            mpaaRating: document.getElementById('movie-mpaa').value || null,
            directorName: document.getElementById('director-name').value
        };

        try {
            if (this.currentMovie) {
                await api.updateMovie(this.currentMovie.id, movieData);
            } else {
                await api.createMovie(movieData);
            }
            
            this.closeModals();
            this.loadMovies();
        } catch (error) {
            this.showError(error.message);
        }
    }

    async deleteMovie(id) {
        if (confirm('Вы уверены, что хотите удалить этот фильм?')) {
            try {
                await api.deleteMovie(id);
                this.loadMovies();
            } catch (error) {
                this.showError(error.message);
            }
        }
    }

    async editMovie(id) {
        try {
            const movies = await api.getMovies();
            const movie = movies.find(m => m.id === id);
            if (movie) {
                this.showMovieModal(movie);
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    changePage(delta) {
        this.currentPage += delta;
        this.loadMovies();
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        this.errorModal.style.display = 'block';
    }

    closeModals() {
        this.movieModal.style.display = 'none';
        this.errorModal.style.display = 'none';
    }
}

const ui = new UI(); 