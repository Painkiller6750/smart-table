import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements) {
    let indexes = {}; // Храним индексы внутри компонента

    // Функция для обновления индексов
    const updateIndexes = (elements, newIndexes) => {
        indexes = newIndexes;

        // Очищаем существующие опции
        Object.keys(elements).forEach(elementName => {
            elements[elementName].innerHTML = '';
        });

        // Заполняем выпадающие списки опциями
        Object.keys(indexes).forEach((elementName) => {
            if (elements[elementName]) {
                elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
                    const el = document.createElement('option');
                    el.textContent = name;
                    el.value = name;
                    return el;
                }));
            }
        });
    };

    const applyFiltering = (data, state, action) => {
        // Обрабатываем очистку поля
        if (action && action.name === 'clear') {
            const input = action.parentElement.querySelector('input');
            input.value = '';
            state[action.dataset.field] = '';
        }

        // Фильтруем данные используя компаратор
        return data.filter(row => compare(row, state));
    };

    return {
        applyFiltering,
        updateIndexes
    };
}
