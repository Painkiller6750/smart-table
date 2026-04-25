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
                    // Увеличиваем, но не более pageCount (уточним после получения total)
                    page++;
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
            page: page || 1 // fallback на 1, если page не определён
        });
    };


    /**
     * Обновляет отображение пагинатора после получения данных от сервера
     */
    const updatePagination = (total, { limit, page }) => {
        // Проверяем, что total — число
        const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
        pageCount = Math.ceil(safeTotal / limit) || 1; // fallback на 1 страницу

        // Если действие было 'last', устанавливаем последнюю страницу
        if (page === 'last') {
            page = pageCount;
        } else if (isNaN(page) || page < 1) {
            // Если page некорректен, устанавливаем 1
            page = 1;
        }

        // Получаем список видимых страниц
        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === page);
        }));

        // Обновляем статус пагинации с проверками
        const startRow = Math.max(1, (page - 1) * limit + 1);
        const endRow = Math.min(page * limit, safeTotal);

        fromRow.textContent = safeTotal > 0 ? startRow : 0;
        toRow.textContent = safeTotal > 0 ? endRow : 0;
        totalRows.textContent = safeTotal;
    };


    return {
        applyPagination,
        updatePagination
    };
};
