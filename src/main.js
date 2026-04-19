
import './fonts/ys-display/fonts.css';
import './style.css';

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Шаг 1: вызов initData(sourceData) присваиваем константе API
const API = initData(sourceData);

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
        let state = collectState(); // состояние полей из таблицы
        // Шаг 2.1: заменяем копирование данных на let query = {}
        let query = {};

        // На данном этапе все apply* закомментированы по заданию
        // query остаётся пустым — это нормально для первого шага

        // Шаг 2.2: получаем данные через API
        const { total, items } = await API.getRecords(query);

        console.log('Получено записей:', items.length); // Отладка: проверяем количество данных
        if (items.length === 0) {
            console.warn('API вернул пустой массив items');
        }

        // Шаг 2.3: передаём items вместо result
        sampleTable.render(items);
    } catch (error) {
        console.error('Ошибка в render:', error);
    }
}

// Глобальная переменная для хранения индексов
let indexes;
// Переменные для хранения компонентов (инициализируем позже)
let sampleTable, applyPagination, applySorting, applyFiltering, applySearching;

// Шаг 3: асинхронная функция init()
async function init() {
    // 3.1. внутри init() получаем индексы
    indexes = await API.getIndexes();

    // Теперь, когда indexes получены, инициализируем компоненты
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

    // Закомментируем applyFiltering по заданию
    // applyFiltering = initFiltering(sampleTable.filter.elements, {
    //     searchBySeller: indexes.sellers
    // });

    applySearching = initSearching('search');

    const appRoot = document.querySelector('#app');
    appRoot.appendChild(sampleTable.container);

    // Возвращаем sampleTable для использования в render
    return sampleTable;
}

// Заменяем вызов render на init().then(render) с обработкой ошибок
init()
    .then(() => {
        // После инициализации вызываем render
        render();
    })
    .catch(error => {
        console.error('Ошибка инициализации:', error);
        // Показываем сообщение об ошибке пользователю
        const appRoot = document.querySelector('#app');
        appRoot.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
    });