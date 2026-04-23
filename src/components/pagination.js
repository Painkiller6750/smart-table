import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // Шаблон кнопки страницы
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    // Временная переменная для хранения количества страниц
    let pageCount;

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        if (action) {
            switch (action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    // Увеличиваем страницу, но позже проверим корректность
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

        // Добавляем параметры к query, не изменяя исходный объект
        return Object.assign({}, query, {
            limit,
            page
        });
    };

    const updatePagination = (total, { limit, page }) => {
        pageCount = Math.ceil(total / limit);

        // Обновляем номер страницы для действия 'last'
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
