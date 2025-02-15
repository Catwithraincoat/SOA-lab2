document.addEventListener('DOMContentLoaded', () => {
    // Загружаем начальные данные
    ui.loadMovies();

    // Закрываем модальные окна при клике вне их содержимого
    window.addEventListener('click', (e) => {
        if (e.target === ui.movieModal || e.target === ui.errorModal) {
            ui.closeModals();
        }
    });

    // Обработка ошибок
    window.onerror = (message, source, lineno, colno, error) => {
        ui.showError(`Произошла ошибка: ${message}`);
        return false;
    };
}); 