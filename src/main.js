import './fonts/ys-display/fonts.css';
import './style.css';

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

const API = initData();

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const formData = new FormData(sampleTable.container);
    const state = processFormData(formData);

    // Исправляем парсинг rowsPerPage с fallback на 10
    const rowsPerPage = parseInt(state.rowsPerPage) || 10;

    // Исправляем парсинг page с fallback на 1
    let page = parseInt(state.page);
    if (isNaN(page) || page < 1) {
        page = 1;
    }

    const total = [
        parseFloat(state.totalFrom) || null,
        parseFloat(state.totalTo) || null
    ];

    return {
        ...state,
        total,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    try {
        let state = collectState();
        let query = {};

        // Применяем глобальный поиск
        query = applySearching(query, state, action);

        // Применяем пагинацию — формируем параметры запроса
        query = window.applyPagination.applyPagination(query, state, action);

        // Сортировка
        query = applySorting(query, state, action);

        // Фильтрация
        if (applyFiltering && typeof applyFiltering.applyFiltering === 'function') {
            query = applyFiltering.applyFiltering(query, state, action);
        }

        // Получаем данные с сервера
        const { total, items } = await API.getRecords(query);

        // Обновляем отображение пагинации после получения данных
        if (window.updatePagination) {
            window.updatePagination(total, query);
        }

        // Обновляем индексы фильтрации после получения данных
        if (applyFiltering && typeof applyFiltering.updateIndexes === 'function') {
            applyFiltering.updateIndexes(sampleTable.filter.elements, {
                searchBySeller: indexes.sellers,
                searchByCustomer: indexes.customers
            });
        }

        // Отрисовываем таблицу
        sampleTable.render(items);
    } catch (error) {
        console.error('Ошибка в render:', error);
    }
}



// Глобальные переменные
let sampleTable, applyPagination, applySorting, applySearching, applyFiltering, indexes;

async function init() {
    try {
        // 1. Сначала получаем индексы с сервера
        indexes = await API.getIndexes();

        // Инициализируем таблицу
        sampleTable = initTable({
            tableTemplate: 'table',
            rowTemplate: 'row',
            before: ['search', 'header', 'filter'],
            after: ['pagination']
        }, render);

        // Устанавливаем начальное значение rowsPerPage, если не задано
        const rowsPerPageSelect = sampleTable.pagination.elements.rowsPerPage;
        if (rowsPerPageSelect && !rowsPerPageSelect.value) {
            rowsPerPageSelect.value = '10';
        }

        // 3. Инициализируем пагинацию
        const {applyPagination, updatePagination} = initPagination(
            sampleTable.pagination.elements,
            (el, page, isCurrent) => {
                const input = el.querySelector('input');
                const label = el.querySelector('span');
                input.value = page;
                input.checked = isCurrent;
                label.textContent = page;
                return el;
            }
        );
        window.applyPagination = {applyPagination, updatePagination}; // Сохраняем в глобальную область видимости

        // 4. Инициализируем сортировку
        applySorting = initSorting([
            sampleTable.header.elements.sortByDate,
            sampleTable.header.elements.sortByTotal
        ]);

        // 5. Инициализируем фильтрацию (без updateIndexes на этом этапе)
        applyFiltering = initFiltering(sampleTable.filter.elements);

        // 6. Инициализируем поиск
        applySearching = initSearching('search');

        // 7. Добавляем обработчик Enter для поля поиска
        const searchInput = sampleTable.search.elements.search;
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    render();
                }
            });
        }

        // 8. Теперь, когда всё инициализировано и indexes загружены, обновляем компоненты
        if (applyFiltering && typeof applyFiltering.updateIndexes === 'function') {
            applyFiltering.updateIndexes(sampleTable.filter.elements, {
                searchBySeller: indexes.sellers,
                searchByCustomer: indexes.customers
            });
        }

        // Добавляем в глобальную область видимости updatePagination
        window.updatePagination = updatePagination;

        const appRoot = document.querySelector('#app');
        appRoot.appendChild(sampleTable.container);

        return sampleTable;
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        const appRoot = document.querySelector('#app');
        appRoot.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
    }
}




init()
    .then(() => render())
    .catch(error => {
        console.error('Ошибка инициализации:', error);
        const appRoot = document.querySelector('#app');
        appRoot.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
    });
