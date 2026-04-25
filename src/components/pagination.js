import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // Шаблон кнопки страницы
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    // Временная переменная для хранения количества страниц
    let pageCount;

    /**
     * Формирует параметры пагинации для запроса к серверу
     */
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // Обрабатываем действия пользователя
        if (action) {
            switch (action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page++; // Увеличиваем, позже уточним после получения total
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    // Оставляем как есть — обновим после получения total
                    if (pageCount) {
                        page = pageCount;
                    }
                    break;
            }
        }

        return Object.assign({}, query, {
            limit,
            page
        });
    };

    /**
     * Обновляет отображение пагинатора после получения данных от сервера
     */
    const updatePagination = (total, { limit, page }) => {
        pageCount = Math.ceil(total / limit);

        // Если действие было 'last', устанавливаем последнюю страницу
        if (page === 'last') {
            page = pageCount;
        }

        // Получаем список видимых страниц
        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === page);
        }));

        // Обновляем статус пагинации
        const startRow = (page - 1) * limit + 1;
        const endRow = Math.min(page * limit, total);

        fromRow.textContent = startRow;
        toRow.textContent = endRow;
        totalRows.textContent = total;
    };

    return {
        applyPagination,
        updatePagination
    };
};
