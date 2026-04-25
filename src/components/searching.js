


export function initSearching(searchField) {
    return (query, state, action) => {
        // Получаем значение из поля поиска
        const searchValue = state[searchField];

        // Если есть значение для поиска, добавляем его в query
        if (searchValue && searchValue.trim()) {
            return Object.assign({}, query, {
                search: searchValue.trim() // очищаем от лишних пробелов
            });
        }

        return query; // если поле пустое, возвращаем исходный query
    };
}
