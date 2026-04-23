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

const api = initData();

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

        // Пока закомментированы по заданию
        // query = applySearching(query, state, action);
        // query = applyFiltering(query, state, action);
        query = applySorting(query, state, action);
        query = applyPagination(query, state, action);

        const { total, items } = await api.getRecords(query);

        updatePagination(total, query);
        sampleTable.render(items);
    } catch (error) {
        console.error('Ошибка в render:', error);
    }
}

let sampleTable, applyPagination, updatePagination, applySorting, applySearching, applyFiltering, updateIndexes;

async function init() {
    // Сначала получаем индексы с сервера
    const indexes = await api.getIndexes();

    // Теперь инициализируем компоненты ПОСЛЕ получения индексов
    sampleTable = initTable({
        tableTemplate: 'table',
        rowTemplate: 'row',
        before: ['search', 'header', 'filter'],
        after: ['pagination']
    }, render);

    ({applyPagination, updatePagination} = initPagination(
        sampleTable.pagination.elements,
        (el, page, isCurrent) => {
            const input = el.querySelector('input');
            const label = el.querySelector('span');
            input.value = page;
            input.checked = isCurrent;
            label.textContent = page;
            return el;
        }
    ));

    applySorting = initSorting([
        sampleTable.header.elements.sortByDate,
        sampleTable.header.elements.sortByTotal
    ]);

    ({applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements));

    // Обновляем фильтры с полученными индексами
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });

    applySearching = initSearching('search');

    const appRoot = document.querySelector('#app');
    appRoot.appendChild(sampleTable.container);
}

init()
    .then(() => render())
    .catch(error => {
        console.error('Ошибка инициализации:', error);
        const appRoot = document.querySelector('#app');
        appRoot.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
    });
