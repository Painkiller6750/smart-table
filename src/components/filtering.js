export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        // Очищаем существующие опции
        Object.keys(elements).forEach(elementName => {
            if (elements[elementName]) {
                elements[elementName].innerHTML = '';
                // Добавляем нейтральную опцию для select
                if (elements[elementName].tagName === 'SELECT') {
                    const neutralOption = document.createElement('option');
                    neutralOption.textContent = '—';
                    neutralOption.value = '';
                    elements[elementName].appendChild(neutralOption);
                }
            }
        });

        // Заполняем выпадающие списки опциями
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


    // Функция формирования параметров фильтрации для запроса к серверу
    const applyFiltering = (query, state, action) => {
        // Обрабатываем очистку поля
        if (action && action.name === 'clear') {
            const input = action.parentElement.querySelector('input');
            if (input) {
                input.value = '';
            }
            // Обновляем state — убираем значение очищенного поля
            if (action.dataset.field) {
                state[action.dataset.field] = '';
            }
        }

        // Формируем параметры фильтрации
        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) {
                    // Формируем вложенный объект фильтра
                    filter[`filter[${elements[key].name}]`] = elements[key].value;
                }
            }
        });

        // Если есть параметры фильтрации, добавляем их к запросу
        return Object.keys(filter).length
            ? Object.assign({}, query, filter)
            : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}
