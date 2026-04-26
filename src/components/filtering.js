export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(elements).forEach(elementName => {
            if (elements[elementName]) {
                elements[elementName].innerHTML = '';
                if (elements[elementName].tagName === 'SELECT') {
                    const neutralOption = document.createElement('option');
                    neutralOption.textContent = '—';
                    neutralOption.value = '';
                    elements[elementName].appendChild(neutralOption);
                }
            }
        });

        Object.keys(indexes).forEach((elementName) => {
            if (elements[elementName] && indexes[elementName]) {
                const options = Object.values(indexes[elementName]).map(name => {
                    const el = document.createElement('option');
                    el.textContent = name;
                    el.value = name;
                    return el;
                });
                elements[elementName].append(...options);
            }
        });
    };

// Новая функция: синхронизация UI с состоянием фильтра
    const updateFilterUI = (elements, state) => {
        Object.keys(elements).forEach(key => {
            if (elements[key] && elements[key].tagName === 'SELECT' && state[key]) {
                elements[key].value = state[key];
            }
        });
    };

    const applyFiltering = (query, state, action) => {
        // Обрабатываем очистку поля
        if (action && action.name === 'clear') {
            const input = action.parentElement.querySelector('input');
            if (input) {
                input.value = '';
            }
            if (action.dataset.field) {
                state[action.dataset.field] = '';
            }
        }

        // Обновляем UI для выпадающих списков
        updateFilterUI(elements, state);

        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) {
                    filter[`filter[${elements[key].name}]`] = elements[key].value;
                }
            }
        });

        return Object.keys(filter).length
            ? Object.assign({}, query, filter)
            : query;
    };

    return {
        updateIndexes,
        applyFiltering,
        updateFilterUI // Экспортируем новую функцию
    };
}
