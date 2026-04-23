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
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);
    const total = [
        parseFloat(state.totalFrom),
        parseFloat(state.totalTo)
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

        // Применяем пагинацию
        query = applySearching(query, state, action); // result заменяем на query

        // Применяем фильтрацию — только если компонент инициализирован
        if (applyFiltering && typeof applyFiltering.applyFiltering === 'function') {
            query = applyFiltering.applyFiltering(query, state, action);
        }

        // Получаем данные с сервера с учётом фильтров и пагинации
        const { total, items } = await API.getRecords(query);

        // Обновляем отображение пагинации после получения данных
        applyPagination.updatePagination(total, query);

        // Если есть функция обновления индексов фильтрации, вызываем её
        if (applyFiltering && typeof applyFiltering.updateIndexes === 'function') {
            applyFiltering.updateIndexes(sampleTable.filter.elements, {
                searchBySeller: indexes.sellers
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
        // Получаем индексы с сервера
        indexes = await API.getIndexes();

        // Инициализируем компоненты после получения индексов
        sampleTable = initTable({
            tableTemplate: 'table',
            rowTemplate: 'row',
            before: ['search', 'header', 'filter'],
            after: ['pagination']
        }, render);

        applyPagination = initPagination(sampleTable.pagination.elements, (el, page, isCurrent) => {
            const input = el.querySelector('input');
            const label = el.querySelector('span');
            input.value = page;
            input.checked = isCurrent;
            label.textContent = page;
            return el;
        });

        applySorting = initSorting([
            sampleTable.header.elements.sortByDate,
            sampleTable.header.elements.sortByTotal
        ]);

        // Инициализация фильтрации после получения индексов
        applyFiltering = initFiltering(sampleTable.filter.elements);
        // Обновляем индексы после получения данных
        if (typeof applyFiltering.updateIndexes === 'function') {
            applyFiltering.updateIndexes(sampleTable.filter.elements, {
                searchBySeller: indexes.sellers
            });
        }

        applySearching = initSearching('search');

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
